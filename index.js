'use strict'

const fs = require('fs')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const fp = require('fastify-plugin')
const helmet = require('fastify-helmet')
const sensible = require('fastify-sensible')
const oas = require('fastify-oas')
const autoload = require('fastify-autoload')
const underPressure = require('under-pressure')
const assign = require('assign-deep')

const configure = require('./config')

module.exports = fp(async (fastify, opts, next) => {
  /**
   * verify config options
   */
  const config = configure(opts)

  /**
   * read package information
   */
  const pack = readPkgUp.sync()
  const pkg = {
    name: pack.package.name,
    version: pack.package.version,
    root: path.dirname(pack.path)
  }

  /**
   * add package information
   */
  for (const [k, v] of Object.entries(pkg)) {
    fastify.decorate(k, v)
  }

  /**
   * add config
   */
  fastify.decorate('config', assign(config, opts))

  /**
   * add OpenAPI docs (v3.0 aka swagger)
   */
  fastify.register(oas, config.swagger)

  /**
   * add helmet (http security headers)
   */
  fastify.register(helmet, {
    hidePoweredBy: {
      setTo: `${fastify.name} ${fastify.version}`
    }
  })

  /**
   * add sensible defaults
   */
  fastify.register(sensible)

  /**
   * autoload plugins, services, etc
   */
  for (const dir of config.autoloads) {
    if (fs.existsSync(dir))
      fastify.register(autoload, {
        dir,
        options: config
      })
  }

  /**
   * add healthcheck
   */
  fastify.register(underPressure, config.healthCheck)

  /**
   * post-treatment
   */
  fastify.ready(err => {
    if (err) throw err
    fastify.log.debug(
      `${fastify.name} (${fastify.version}) ready. pwd: ${fastify.root}`
    )

    // re-read routes for OpenAPI docs
    fastify.oas()
  })

  next()
})

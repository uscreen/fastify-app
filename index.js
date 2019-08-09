'use strict'

const path = require('path')
const readPkgUp = require('read-pkg-up')
const fp = require('fastify-plugin')
const helmet = require('fastify-helmet')
const sensible = require('fastify-sensible')
const oas = require('fastify-oas')
const autoload = require('fastify-autoload')

module.exports = fp(async (fastify, config, next) => {
  console.log(config)

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
  fastify.decorate('config', config)

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
    fastify.register(autoload, {
      dir,
      options: config
    })
  }

  /**
   * post-treatment
   */
  fastify.ready(err => {
    if (err) throw err
    fastify.log.debug(
      `${fastify.name} (${fastify.version}) ready. pwd: ${fastify.root}`
    )
  })

  next()
})

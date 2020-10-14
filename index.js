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

module.exports = fp((fastify, opts, next) => {
  /**
   * verify config options
   */
  const config = configure(opts)

  /**
   * read package information
   */
  const pack = readPkgUp.sync()
  const pkg = {
    name: pack.packageJson.name,
    version: pack.packageJson.version,
    root: path.dirname(pack.path)
  }

  /**
   * add package information
   */
  for (const [k, v] of Object.entries(pkg)) {
    /**
     * fastify ^3.6.0 uses fastify.version internaly,
     * so avoid redeclaring
     */
    if (!fastify.hasDecorator(k)) {
      fastify.decorate(k, v)
    }
  }

  /**
   * add package information, namespaced
   */
  fastify.decorate('app', pkg)

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
    contentSecurityPolicy: config.contentSecurityPolicy
  })

  /**
   * add sensible defaults
   */
  fastify.register(sensible)

  /**
   * autoload plugins, services, etc
   * @see https://github.com/fastify/fastify/blob/master/docs/Getting-Started.md#loading-order-of-your-plugins
   */
  for (const dir of config.autoloads) {
    if (fs.existsSync(dir))
      fastify.register(autoload, {
        dir,
        options: config
      })
  }

  /**
   * add application health check
   */
  fastify.register(underPressure, config.health)

  /**
   * post-treatment
   */
  fastify.ready((err) => {
    /* istanbul ignore if */
    if (err) throw err
    fastify.log.debug(
      `${fastify.name} (${fastify.app.version}) ready. pwd: ${fastify.root}`
    )

    // re-read routes for OpenAPI docs
    fastify.oas()
  })

  /**
   * add some custom headers
   */
  fastify.addHook('onSend', async (request, reply, payload) => {
    reply.header('X-Request-ID', request.id)
    reply.header('x-Powered-By', `${fastify.name} ${fastify.version}`)

    // helmet changed defaults, @see https://github.com/helmetjs/helmet/issues/230
    reply.header('X-XSS-Protection', '1; mode=block')
    return payload
  })

  next()
})

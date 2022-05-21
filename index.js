'use strict'

const fs = require('fs')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const fp = require('fastify-plugin')
const helmet = require('fastify-helmet')
const sensible = require('@fastify/sensible')
const swagger = require('fastify-swagger')
const autoload = require('@fastify/autoload')
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
    description: pack.packageJson.description,
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
  const swaggerConfig = config.swagger

  /**
   * prefer .openapi but use .swagger per default
   */
  const customSwaggerConfig = {
    ...swaggerConfig.swagger,
    ...swaggerConfig.openapi
  }

  fastify.register(swagger, {
    ...swaggerConfig,

    openapi: {
      // customizable
      ...customSwaggerConfig,

      // default infos from package.json
      info: {
        title: pkg.name,
        description: pkg.description,
        version: pkg.version,

        // but customizable
        ...customSwaggerConfig.info
      }
    }
  })

  /**
   * add helmet (http security headers)
   */
  fastify.register(helmet, {
    contentSecurityPolicy: config.contentSecurityPolicy
  })

  /**
   * @see https://github.com/fastify/fastify-swagger#integration
   */
  // fastify.register(helmet, (instance) => {
  //   console.log(helmet.contentSecurityPolicy.getDefaultDirectives())
  //   console.log(instance.swaggerCSP)
  //   return {
  //     contentSecurityPolicy: {
  //       directives: {
  //         ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  //         'form-action': ["'self'"],
  //         'img-src': ["'self'", 'data:', 'validator.swagger.io'],
  //         'script-src': ["'self'"].concat(instance.swaggerCSP.script),
  //         'style-src': ["'self'", 'https:'].concat(instance.swaggerCSP.style)
  //       }
  //     }
  //   }
  // })

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
    fastify.swagger()
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

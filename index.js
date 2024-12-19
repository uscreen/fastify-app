import fs from 'fs'
import path from 'path'
import { readPackageUpSync } from 'read-package-up'
import hyperid from 'hyperid'
import fp from 'fastify-plugin'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import swagger from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import autoload from '@fastify/autoload'
import underPressure from '@fastify/under-pressure'
import assign from 'assign-deep'
import configure from './config.js'

const instance = hyperid({ urlSafe: true })

/**
 * read package information
 */
const pack = readPackageUpSync()

/**
 * factory to provide id generator and
 * logger defaults by environment
 */
export const options = (config = {}) => {
  const { ajv, logLevel = 'debug', trustProxy = false } = config

  const { name, version } = pack.packageJson
  const { NODE_ENV } = process.env

  const envToLogger = {
    development: {
      level: logLevel,
      name: `${name}@v${version}`,
      transport: {
        target: 'pino-pretty',
        options: {
          sync: true,
          translateTime: true,
          ignore: 'pid,hostname'
        }
      }
    },
    production: {
      level: logLevel,
      name: `${name}@v${version}`
    },
    test: false
  }

  const opts = {
    forceCloseConnections: true,
    trustProxy,
    genReqId: instance,
    logger: envToLogger[NODE_ENV || 'development'] ?? true // defaults to true if no entry matches in the map
  }

  return ajv ? { ...opts, ajv } : opts
}

export default fp(async (fastify, opts) => {
  /**
   * verify config options
   */
  const config = configure(opts)

  /**
   * read package information
   */
  const pack = readPackageUpSync()
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
  const {
    scalar: scalarConfig,
    openapi: openapiConfig,
    ...swaggerConfig
  } = config.swagger

  fastify.register(swagger, {
    ...swaggerConfig,

    openapi: {
      // customizable
      ...openapiConfig,

      // default infos from package.json
      info: {
        title: pkg.name,
        description: pkg.description,
        version: pkg.version,

        // but customizable
        ...openapiConfig.info
      }
    }
  })

  /**
   * add Scalar Client (if enabled)
   */
  if (swaggerConfig.exposeRoute) {
    await fastify.register(ScalarApiReference, {
      ...swaggerConfig,
      configuration: scalarConfig
    })
  }

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
    /* c8 ignore next */
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
})

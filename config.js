import envSchema from 'env-schema'

const schema = {
  type: 'object',
  properties: {
    prefix: {
      type: 'string',
      default: ''
    },
    autoloads: {
      type: 'array',
      default: []
    },
    swagger: {
      type: 'object',
      default: {},
      properties: {
        routePrefix: {
          type: 'string'
          // no default, we set it dynamically below if not set
        },
        exposeRoute: {
          default: true
        },
        openapi: {
          default: {}
        },
        scalar: { default: {} }
      }
    },
    health: {
      type: 'object',
      default: {},
      properties: {
        exposeStatusRoute: {
          default: true
          // default true, we set route dynamically below if not explicitely set
        },
        maxEventLoopDelay: {
          default: 1000
        },
        maxHeapUsedBytes: {
          default: 128 * 1024 * 1024
        },
        maxRssBytes: {
          default: 256 * 1024 * 1024
        },
        retryAfter: {
          default: 50
        }
      }
    },
    contentSecurityPolicy: {
      type: ['boolean', 'object'],

      // disable CSR as default, as we won't know any options from api side
      default: false
    }
  }
}

export default (opts) => {
  if (opts.healthCheck && !opts.health) opts.health = opts.healthCheck

  const config = envSchema({
    schema,
    data: opts
  })

  // set swagger route prefix to default, if not set:
  config.swagger.routePrefix =
    config.swagger.routePrefix ?? `${config.prefix}/docs`

  // set healthcheck route to default, if enabled, but not set:
  if (config.health.exposeStatusRoute === true) {
    config.health.exposeStatusRoute = `${config.prefix}/health`
  }

  return config
}

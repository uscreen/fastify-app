'use strict'

const envSchema = require('env-schema')

const schema = {
  type: 'object',
  properties: {
    autoloads: {
      type: 'array',
      default: []
    },
    swagger: {
      type: 'object',
      default: {},
      properties: {
        exposeRoute: {
          default: true
        }
      }
    },
    health: {
      type: 'object',
      default: {},
      properties: {
        exposeStatusRoute: {
          default: true
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

module.exports = opts => {
  if (opts.healthCheck && !opts.health) opts.health = opts.healthCheck

  const config = envSchema({
    schema: schema,
    data: opts
  })

  return config
}

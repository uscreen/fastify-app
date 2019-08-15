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
    healthCheck: {
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
    }
    // httpPort: { default: 3000 },
    // httpBind: { default: '127.0.0.1' },
    // prefix: { default: '/api' },
    // logEnabled: { default: true },
    // logLevel: { default: 'info' },
  }
}

module.exports = opts => {
  const config = envSchema({
    schema: schema,
    data: opts,
    dotenv: opts.useDotenv
  })

  return config
}

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

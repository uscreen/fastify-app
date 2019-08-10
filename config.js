'use strict'

const envSchema = require('env-schema')

const schema = {
  type: 'object',
  properties: {
    autoloads: {
      type: 'array',
      default: []
    }
    // httpPort: { default: 3000 },
    // httpBind: { default: '127.0.0.1' },
    // prefix: { default: '/api' },
    // logEnabled: { default: true },
    // logLevel: { default: 'info' },
    // ldapUrl: { default: 'ldap://127.0.0.1:389' },
    // ldapBindDN: { default: 'cn=admin' },
    // ldapPassword: { default: '' },
    // ldapSearchDN: { default: 'ou=users' },
    // jwtSecret: { default: '' },
    // pwResetUrl: { default: '' },

    // hookBaseUrl: { default: '' },
    // hookUrl: { default: '' },
    // hookLoginUrl: { default: '' },
    // hookTestMode: { default: false },
    // hookUsername: { default: '' },
    // hookPassword: { default: '' }
  }
}

module.exports = opts => {
  const config = envSchema({
    schema: schema,
    data: opts,
    dotenv: opts.useDotenv
  })

  // config.autoloads = [
  //   path.join(__dirname, 'services'),
  //   path.join(__dirname, 'plugins'),
  //   path.join(__dirname, 'models')
  // ]

  // config.swagger = {
  //   routePrefix: '/api/docs',
  //   exposeRoute: true,
  //   addModels: true,
  //   swagger: {
  //     info: {
  //       title: name,
  //       version: version
  //     },
  //     schemes: ['http', 'https'],
  //     servers: [
  //       {
  //         url: 'http://localhost:8080/',
  //         description: 'Local Dev'
  //       },
  //       {
  //         url: 'https://knh-ldap-admin-stage.uscreen.net/',
  //         description: 'Stage'
  //       }
  //     ],
  //     consumes: ['application/json'],
  //     produces: ['application/json'],
  //     tags: [
  //       {
  //         name: 'auth',
  //         description: 'Endpoints for authentication, session-state'
  //       },
  //       {
  //         name: 'sync',
  //         description: 'Endpoints for synchronisation between services'
  //       },
  //       {
  //         name: 'user',
  //         description: 'User related endpoint'
  //       },
  //       {
  //         name: 'group',
  //         description: 'Group related endpoint'
  //       }
  //     ]
  //   }
  // }
  return config
}

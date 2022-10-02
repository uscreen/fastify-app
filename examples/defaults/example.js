import hyperid from 'hyperid'
import app from 'fastify'

// import @uscreen.de/fastify-app
import defaultApp from '../../index.js'

const name = 'example-app'
const version = '0.1.0'
const instance = hyperid({ urlSafe: true })

const fastify = app({
  genReqId() {
    return instance()
  },

  logger: {
    prettyPrint: true,
    level: 'debug',
    name: `${name} (v${version}) ${process.env.NODE_APP_INSTANCE}`
  }
})

// register with defaults
fastify.register(defaultApp)

// Declare a route
fastify.get('/', (request, reply) => {
  reply.send({
    hello: 'world'
  })
})

// some more optional verbose output on ready
fastify.ready((err) => {
  if (err) throw err
  fastify.log.debug(
    'Application ready, routes are set:\n' + fastify.printRoutes()
  )
  fastify.log.debug('config', fastify.config)
})

// Run the server!
fastify.listen(3000, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

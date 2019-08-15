// Require the framework and instantiate it
const fastify = require('fastify')({
  logger: {
    prettyPrint: true,
    level: 'debug'
  }
})

// require @uscreen.de/fastify-app
const defaultApp = require('../../index')

// register with defaults
fastify.register(defaultApp)

// Declare a route
fastify.get('/', (request, reply) => {
  reply.send({
    hello: 'world'
  })
})

// some more optional verbose output on ready
fastify.ready(err => {
  if (err) throw err
  fastify.log.debug(
    'Application ready, routes are set:\n' + fastify.printRoutes()
  )
  fastify.log.debug('config', fastify.config)
})

// Run the server!
fastify.listen(3000, err => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

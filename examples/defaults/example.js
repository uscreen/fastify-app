// Require the framework and instantiate it
const fastify = require('fastify')({
  logger: {
    prettyPrint: true,
    level: 'debug'
  }
})

// require @uscreen.de/fastify-app
const defaultApp = require('./index')

// register defaults
fastify.register(defaultApp)

// Declare a route
fastify.get('/', (request, reply) => {
  reply.send({
    hello: 'world'
  })
})

// Run the server!
fastify.listen(3000, err => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${fastify.server.address().port}`)
})

// some more optional verbose output
fastify.ready(err => {
  if (err) throw err
  fastify.log.debug(
    'Application ready, routes are set:\n' + fastify.printRoutes()
  )
})

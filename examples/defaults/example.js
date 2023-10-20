import Fastify from 'fastify'
import stringify from 'json-stringify-pretty-compact'

// import @uscreen.de/fastify-app
import defaultApp, { options } from '../../index.js'
import config from './config.js'

// create fastify instance with default options
const fastify = Fastify(options(config))

// register with defaults
fastify.register(defaultApp)

// Declare a route
fastify.get('/', () => ({ hello: 'world' }))

// some more optional verbose output on ready
fastify.ready((err) => {
  if (err) throw err
  fastify.log.debug(
    'Application ready, routes are set:\n' +
      fastify.printRoutes({ commonPrefix: false })
  )
  fastify.log.debug(`config ${stringify(fastify.config)}`)
})

/**
 * graceful shutdown (closing handles, etc.)
 */
const shutdown = async () => {
  fastify.log.info(`application shutting down.`)
  await fastify.close()
  process.exit()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// Run the server!
fastify.listen({ port: 8000 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

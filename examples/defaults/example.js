import app from 'fastify'
import hyperid from 'hyperid'
import stringify from 'json-stringify-pretty-compact'

// import @uscreen.de/fastify-app
import defaultApp from '../../index.js'
import config from './config.js'

const name = 'example-app'
const version = '0.1.0'
const instance = hyperid({ urlSafe: true })

const fastify = app({
  genReqId() {
    return instance()
  },

  logger: config.logEnabled
    ? {
        level: config.logLevel,
        name: `${name} (v${version})`,
        prettyPrint: config.logPretty
          ? { translateTime: true, sync: true, colorize: true }
          : false
      }
    : false
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
fastify.listen(3000, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

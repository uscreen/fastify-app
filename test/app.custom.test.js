import tap from 'tap'
import { build } from './helper.js'

tap.test('basic bootstrapping with some custom config and overwrites', (t) => {
  const fastify = build(t, {
    autoloads: ['one', 'two', 'three'],
    hazCustomConfig: true,
    swagger: {
      routePrefix: '/docs'
    },
    healthCheck: {
      exposeStatusRoute: '/health'
    }
  })

  fastify.ready((err) => {
    t.test('should not throw any error', (t) => {
      t.error(err)
      t.end()
    })

    t.test('should expose it`s config', (t) => {
      t.type(fastify.config, 'object')
      t.same(fastify.config.autoloads, ['one', 'two', 'three'])
      t.same(fastify.config.hazCustomConfig, true)
      t.end()
    })

    t.test('should provide openapi json on custom url', (t) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/docs/json'
        },
        (e, response) => {
          const body = JSON.parse(response.body)
          t.error(e)
          t.ok(body.openapi)
          t.end()
        }
      )
    })

    t.test('should provide healthcheck on custom url', (t) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/health'
        },
        (e, response) => {
          t.error(e)
          t.same(response.statusCode, 200)
          t.same(JSON.parse(response.body), {
            status: 'ok'
          })
          t.end()
        }
      )
    })

    t.end()
  })
})

tap.test('basic bootstrapping with `swagger.exposeRoute: false`', (t) => {
  const fastify = build(t, {
    swagger: {
      exposeRoute: false
    }
  })

  fastify.ready((err) => {
    t.test('should not throw any error', (t) => {
      t.error(err)
      t.end()
    })

    t.test('should not provide openapi json url', (t) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/documentation/json'
        },
        (e, response) => {
          t.same(response.statusCode, 404)
          t.end()
        }
      )
    })

    t.end()
  })
})

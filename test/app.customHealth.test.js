import tap from 'tap'
import { build } from './helper.js'

tap.test('health should handled as alias to healthCheck', (t) => {
  const fastify = build(t, {
    health: {
      exposeStatusRoute: '/healthyStatus'
    }
  })

  fastify.ready((err) => {
    t.test('should not throw any error', (t) => {
      t.error(err)
      t.end()
    })

    t.test('should expose it`s config', (t) => {
      t.type(fastify.config, 'object')
      t.end()
    })

    t.test('should provide healthcheck on custom url', (t) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/healthyStatus'
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

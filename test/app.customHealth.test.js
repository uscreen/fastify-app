import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from './helper.js'

test('health should handled as alias to healthCheck', (t, done) => {
  const fastify = build(t, {
    health: {
      exposeStatusRoute: '/healthyStatus'
    }
  })

  fastify.ready(async (err) => {
    await t.test('should not throw any error', (t, done) => {
      assert.ok(!err)
      done()
    })

    await t.test('should expose it`s config', (t, done) => {
      assert.equal(typeof fastify.config, 'object')
      done()
    })

    await t.test('should provide healthcheck on custom url', (t, done) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/healthyStatus'
        },
        (e, response) => {
          assert.ok(!e)
          assert.equal(response.statusCode, 200)
          assert.deepEqual(JSON.parse(response.body), {
            status: 'ok'
          })
          done()
        }
      )
    })

    done()
  })
})

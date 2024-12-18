import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from './helper.js'

test('basic bootstrapping with some custom config and overwrites', (t, done) => {
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

  fastify.ready(async (err) => {
    await t.test('should not throw any error', (t, done) => {
      assert.ok(!err)
      done()
    })

    await t.test('should expose it`s config', (t, done) => {
      assert.equal(typeof fastify.config, 'object')
      assert.deepEqual(fastify.config.autoloads, ['one', 'two', 'three'])
      assert.equal(fastify.config.hazCustomConfig, true)
      done()
    })

    await t.test('should provide openapi json on custom url', (t, done) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/docs/openapi.json'
        },
        (e, response) => {
          const body = JSON.parse(response.body)
          assert.ok(!e)
          assert.ok(body.openapi)
          done()
        }
      )
    })

    await t.test('should provide healthcheck on custom url', (t, done) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/health'
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

test('basic bootstrapping with `swagger.exposeRoute: false`', (t, done) => {
  const fastify = build(t, {
    swagger: {
      exposeRoute: false
    }
  })

  fastify.ready(async (err) => {
    await t.test('should not throw any error', (t, done) => {
      assert.ok(!err)
      done()
    })

    await t.test('should not provide openapi json url', (t, done) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/documentation/json'
        },
        (e, response) => {
          assert.equal(response.statusCode, 404)
          done()
        }
      )
    })

    done()
  })
})

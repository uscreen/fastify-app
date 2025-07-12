import test from 'node:test'
import assert from 'node:assert/strict'
import { build, buildWithOptions } from './helper.js'

test('basic bootstrapping with some custom config and overwrites', (t, done) => {
  const fastify = build(t, {
    prefix: '/api',
    autoloads: ['one', 'two', 'three'],
    hazCustomConfig: true,
    swagger: {
      routePrefix: '/api/refs'
    },
    healthCheck: {
      exposeStatusRoute: '/api/healthcheck'
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
          url: '/api/refs/openapi.json'
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
          url: '/api/healthcheck'
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

test('basic bootstrapping with custom logger name', (t, done) => {
  const customLoggerName = 'my-custom-test-app'

  const fastify = buildWithOptions(t, {
    logger: {
      name: customLoggerName,
    }
  })

  fastify.ready(async (err) => {
    await t.test('should not throw any error', (t, done) => {
      assert.ok(!err)
      done()
    })

    await t.test('should configure logger with custom name', (t, done) => {
      // Verify that the logger configuration includes the custom name
      assert.ok(fastify.log, 'Logger should be configured')

      // Check that the custom logger name is present in the pino chindings
      // Find the correct symbol key for chindings
      const symbols = Object.getOwnPropertySymbols(fastify.log)
      const chindingsSymbol = symbols.find(s => s.toString().includes('pino.chindings'))
      const chindings = chindingsSymbol ? fastify.log[chindingsSymbol] : null
      assert.ok(
        chindings && chindings.includes(`"name":"${customLoggerName}"`),
        `Logger chindings should contain custom name "${customLoggerName}". Got: ${chindings}`
      )

      // Test that a log message can be called without error
      assert.doesNotThrow(() => {
        fastify.log.info('Test message with custom logger name')
      }, 'Logger should work with custom name configuration')

      done()
    })

    done()
  })
})

test('basic bootstrapping with default except `prefix` being set', (t, done) => {
  const fastify = build(t, {
    prefix: '/api'
  })

  fastify.ready(async (err) => {
    await t.test('should not throw any error', (t, done) => {
      assert.ok(!err)
      done()
    })

    await t.test(
      'should provide openapi json on default url with custom prefix',
      (t, done) => {
        fastify.inject(
          {
            method: 'GET',
            url: '/api/docs/openapi.json'
          },
          (e, response) => {
            const body = JSON.parse(response.body)
            assert.ok(!e)
            assert.ok(body.openapi)
            done()
          }
        )
      }
    )

    await t.test(
      'should provide healthcheck on default url with custom prefix',
      (t, done) => {
        fastify.inject(
          {
            method: 'GET',
            url: '/api/health'
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
      }
    )

    done()
  })
})

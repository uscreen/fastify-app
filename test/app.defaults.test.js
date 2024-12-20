import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from './helper.js'

test('basic bootstrapping without custom config', (t, done) => {
  const fastify = build(t)

  fastify.ready(async (err) => {
    await t.test('should not throw any error', (t, done) => {
      assert.ok(!err)
      done()
    })

    await t.test('should expose some package.json details', (t, done) => {
      assert.ok(fastify.name)
      assert.ok(fastify.version)
      assert.ok(fastify.root)
      done()
    })

    await t.test(
      'should also expose some package.json details namespaced to fastify.app',
      (t, done) => {
        assert.ok(fastify.app.name)
        assert.ok(fastify.app.version)
        assert.ok(fastify.app.root)
        done()
      }
    )

    await t.test('should expose it`s config', (t, done) => {
      assert.equal(typeof fastify.config, 'object')
      assert.deepEqual(fastify.config.autoloads, [])
      assert.deepEqual(fastify.config.swagger, {
        exposeRoute: true,
        routePrefix: '/docs',
        openapi: {},
        scalar: {}
      })
      done()
    })

    await t.test('should provide openapi json url', (t, done) => {
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

    await t.test(
      'should decorate response with helmet security headers',
      (t, done) => {
        fastify.inject(
          {
            method: 'GET',
            url: '/'
          },
          (e, response) => {
            assert.ok(!e)
            const h = response.headers

            assert.equal(h['x-dns-prefetch-control'], 'off')
            assert.equal(h['x-frame-options'], 'SAMEORIGIN')
            assert.equal(
              h['x-powered-by'],
              `${fastify.name} ${fastify.version}`
            )
            assert.equal(
              h['strict-transport-security'],
              'max-age=15552000; includeSubDomains'
            )
            assert.equal(h['x-download-options'], 'noopen')
            assert.equal(h['x-content-type-options'], 'nosniff')
            assert.equal(h['x-xss-protection'], '1; mode=block')
            assert.ok(h['x-request-id'])
            done()
          }
        )
      }
    )

    await t.test(
      'should decorate application with sensible from fastify-sensible',
      (t, done) => {
        assert.ok(fastify.httpErrors)
        done()
      }
    )

    await t.test(
      'should decorate application with a healthcheck URL',
      (t, done) => {
        fastify.inject(
          {
            method: 'GET',
            url: '/health'
          },
          (e, response) => {
            assert.ok(!e)
            assert.equal(response.statusCode, 200)
            assert.deepEqual(JSON.parse(response.body), { status: 'ok' })
            done()
          }
        )
      }
    )

    done()
  })
})

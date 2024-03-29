import tap from 'tap'
import { build } from './helper.js'

tap.test('basic bootstrapping without custom config', (t) => {
  const fastify = build(t)

  fastify.ready((err) => {
    t.test('should not throw any error', (t) => {
      t.error(err)
      t.end()
    })

    t.test('should expose some package.json details', (t) => {
      t.ok(fastify.name)
      t.ok(fastify.version)
      t.ok(fastify.root)
      t.end()
    })

    t.test(
      'should also expose some package.json details namespaced to fastify.app',
      (t) => {
        t.ok(fastify.app.name)
        t.ok(fastify.app.version)
        t.ok(fastify.app.root)
        t.end()
      }
    )

    t.test('should expose it`s config', (t) => {
      t.type(fastify.config, 'object')
      t.same(fastify.config.autoloads, [])
      t.same(fastify.config.swagger, {
        exposeRoute: true,
        openapi: {},
        uiConfig: { validatorUrl: null }
      })
      t.end()
    })

    t.test('should provide openapi json url', (t) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/documentation/json'
        },
        (e, response) => {
          const body = JSON.parse(response.body)
          t.error(e)
          t.ok(body.openapi)
          t.end()
        }
      )
    })

    t.test('should decorate response with helmet security headers', (t) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/'
        },
        (e, response) => {
          t.error(e)
          const h = response.headers

          t.same(h['x-dns-prefetch-control'], 'off')
          t.same(h['x-frame-options'], 'SAMEORIGIN')
          t.same(h['x-powered-by'], `${fastify.name} ${fastify.version}`)
          t.same(
            h['strict-transport-security'],
            'max-age=15552000; includeSubDomains'
          )
          t.same(h['x-download-options'], 'noopen')
          t.same(h['x-content-type-options'], 'nosniff')
          t.same(h['x-xss-protection'], '1; mode=block')
          t.ok(h['x-request-id'])
          t.end()
        }
      )
    })

    t.test(
      'should decorate application with sensible from fastify-sensible',
      (t) => {
        t.ok(fastify.httpErrors)
        t.end()
      }
    )

    t.test('should decorate application with a healthcheck URL', (t) => {
      fastify.inject(
        {
          method: 'GET',
          url: '/status'
        },
        (e, response) => {
          t.error(e)
          t.same(response.statusCode, 200)
          t.same(JSON.parse(response.body), { status: 'ok' })
          t.end()
        }
      )
    })

    t.end()
  })
})

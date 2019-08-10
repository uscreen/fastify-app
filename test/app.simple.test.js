const tap = require('tap')
const { build } = require('./helper')

tap.test('basic bootstrapping without custom config', t => {
  const fastify = build(t)

  fastify.ready(err => {
    t.test('should not throw any error', t => {
      t.error(err)
      t.end()
    })

    t.test('should expose some package.json details', t => {
      t.ok(fastify.name)
      t.ok(fastify.version)
      t.ok(fastify.root)
      t.end()
    })

    t.test('should expose it`s config', t => {
      t.type(fastify.config, 'object')
      t.same(fastify.config.autoloads, [])
      t.same(fastify.config.swagger, { exposeRoute: true })
      t.end()
    })

    t.test('should provide openapi json url', t => {
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

    t.end()
  })
})

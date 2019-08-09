const tap = require('tap')
const { build } = require('./helper')

tap.test('basic bootstrapping', t => {
  const fastify = build(t)

  fastify.ready(() => {
    t.test('should expose some package.json details', t => {
      t.ok(fastify.name)
      t.ok(fastify.version)
      t.ok(fastify.root)
      t.end()
    })
    t.end()
  })
})

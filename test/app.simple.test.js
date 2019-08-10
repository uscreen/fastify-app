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
      t.same(Array.isArray(fastify.config.autoloads), true)
      t.end()
    })

    t.end()
  })
})

tap.test('basic bootstrapping with some custom config', t => {
  const fastify = build(t, {
    hazCustomConfig: true
  })

  fastify.ready(err => {
    t.test('should not throw any error', t => {
      t.error(err)
      t.end()
    })

    t.test('should expose it`s config', t => {
      t.type(fastify.config, 'object')
      t.same(fastify.config.autoloads, [])
      t.same(fastify.config.hazCustomConfig, true)
      t.end()
    })

    t.end()
  })
})

tap.test('basic bootstrapping with some overwrites', t => {
  const fastify = build(t, {
    autoloads: ['one', 'two', 'three'],
    hazCustomConfig: true
  })

  fastify.ready(err => {
    t.test('should not throw any error', t => {
      t.error(err)
      t.end()
    })

    t.test('should expose it`s config', t => {
      t.type(fastify.config, 'object')
      t.same(fastify.config.autoloads, ['one', 'two', 'three'])
      t.same(fastify.config.hazCustomConfig, true)
      t.end()
    })

    t.end()
  })
})

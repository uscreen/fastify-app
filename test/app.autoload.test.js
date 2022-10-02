import tap from 'tap'
import { join } from 'desm'
import { build } from './helper.js'

tap.test('basic bootstrapping with some custom config and overwrites', (t) => {
  const fastify = build(t, {
    haZcustOmOption: 'yap',
    autoloads: [
      join(import.meta.url, '/plugins'),
      join(import.meta.url, '/nonexitingervices')
    ]
  })

  fastify.ready((err) => {
    t.test('should not throw any error', (t) => {
      t.error(err)
      t.end()
    })

    t.test('autoloaded plugins should be usable', (t) => {
      const works = fastify.something()
      t.same(works, 'works')
      t.end()
    })

    t.test('autoloaded plugins should be configurable', (t) => {
      const options = fastify.getOptions()
      t.same(options.haZcustOmOption, 'yap')
      t.end()
    })

    t.test('autoloaded plugins should have access to global config', (t) => {
      const options = fastify.getOptions()
      t.same(options.swagger, {
        exposeRoute: true,
        openapi: {},
        uiConfig: { validatorUrl: null }
      })
      t.end()
    })

    t.end()
  })
})

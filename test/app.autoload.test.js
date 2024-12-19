import test from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'desm'
import { build } from './helper.js'

test('basic bootstrapping with some custom config and overwrites', (t, done) => {
  const fastify = build(t, {
    haZcustOmOption: 'yap',
    autoloads: [
      join(import.meta.url, '/plugins'),
      join(import.meta.url, '/nonexitingervices')
    ]
  })

  fastify.ready(async (err) => {
    await t.test('should not throw any error', (t, done) => {
      assert.ok(!err)
      done()
    })

    await t.test('autoloaded plugins should be usable', (t, done) => {
      const works = fastify.something()
      assert.equal(works, 'works')
      done()
    })

    await t.test('autoloaded plugins should be configurable', (t, done) => {
      const options = fastify.getOptions()
      assert.equal(options.haZcustOmOption, 'yap')
      done()
    })

    await t.test(
      'autoloaded plugins should have access to global config',
      (t, done) => {
        const options = fastify.getOptions()
        assert.deepEqual(options.swagger, {
          exposeRoute: true,
          openapi: {},
          scalar: {}
        })
        done()
      }
    )

    done()
  })
})

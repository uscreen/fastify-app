import test from 'node:test'
import assert from 'node:assert/strict'
import { readPackageUpSync } from 'read-package-up'
import { options } from '../index.js'

const pack = readPackageUpSync()
const { name, version } = pack.packageJson

test('options()', async (t) => {
  await t.test('should return an object', (t, done) => {
    const opts = options()
    assert.equal(typeof opts, 'object')
    done()
  })

  await t.test(
    'should return default settings if called without config',
    (t, done) => {
      const opts = options()

      assert.equal(typeof opts, 'object')
      assert.equal(opts.forceCloseConnections, true)
      assert.equal(opts.trustProxy, false)
      assert.equal(typeof opts.genReqId, 'function')
      assert.equal(opts.logger.level, 'debug')
      assert.equal(opts.logger.name, `${name}@v${version}`)
      assert.equal(opts.logger.transport.target, '@fastify/one-line-logger')
      assert.equal(typeof opts.logger.transport.options, 'object')
      assert.equal(opts.logger.transport.options.colorize, true)
      assert.equal(opts.ajv, undefined)
      done()
    }
  )

  await t.test(
    'should return custom settings if called with custom config',
    (t, done) => {
      const opts = options({
        ajv: { coerceTypes: true },
        logLevel: 'info',
        trustProxy: true
      })

      assert.equal(typeof opts, 'object')
      assert.equal(opts.forceCloseConnections, true)
      assert.equal(opts.trustProxy, true)
      assert.equal(typeof opts.genReqId, 'function')
      assert.equal(opts.logger.level, 'info')
      assert.equal(opts.logger.name, `${name}@v${version}`)
      assert.equal(opts.logger.transport.target, '@fastify/one-line-logger')
      assert.equal(typeof opts.logger.transport.options, 'object')
      assert.equal(opts.logger.transport.options.colorize, true)
      assert.equal(opts.ajv.coerceTypes, true)
      done()
    }
  )
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readPackageUpSync } from 'read-package-up'
import { options } from '../index.js'

const pack = readPackageUpSync()
const { name, version } = pack.packageJson

test('options()', async (t) => {
  t.afterEach(() => {
    delete process.env.NODE_ENV
  })

  await t.test('should return an object', (t, done) => {
    const opts = options()
    assert.equal(typeof opts, 'object')
    done()
  })

  await t.test('should return development settings by default', (t, done) => {
    delete process.env.NODE_ENV
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
    done()
  })

  await t.test('should return test settings', (t, done) => {
    process.env.NODE_ENV = 'test'
    const opts = options()

    assert.equal(typeof opts, 'object')
    assert.equal(opts.forceCloseConnections, true)
    assert.equal(opts.trustProxy, false)
    assert.equal(typeof opts.genReqId, 'function')
    assert.equal(opts.logger, false)
    done()
  })

  await t.test('should return production settings', (t, done) => {
    process.env.NODE_ENV = 'production'
    const opts = options()

    assert.equal(typeof opts, 'object')
    assert.equal(opts.forceCloseConnections, true)
    assert.equal(opts.trustProxy, false)
    assert.equal(typeof opts.genReqId, 'function')
    assert.equal(opts.logger.level, 'debug')
    assert.equal(opts.logger.name, `${name}@v${version}`)
    done()
  })

  await t.test('should return fallback settings', (t, done) => {
    process.env.NODE_ENV = 'foo'
    const opts = options()

    assert.equal(typeof opts, 'object')
    assert.equal(opts.forceCloseConnections, true)
    assert.equal(opts.trustProxy, false)
    assert.equal(typeof opts.genReqId, 'function')
    assert.equal(opts.logger, true)
    done()
  })

  await t.test('should return custom settings', (t, done) => {
    process.env.NODE_ENV = 'production'
    const opts = options({ logLevel: 'info', trustProxy: true })

    assert.equal(typeof opts, 'object')
    assert.equal(opts.forceCloseConnections, true)
    assert.equal(opts.trustProxy, true)
    assert.equal(typeof opts.genReqId, 'function')
    assert.equal(opts.logger.level, 'info')
    assert.equal(opts.logger.name, `${name}@v${version}`)
    done()
  })

  await t.test('should pass through ajv option if set', (t, done) => {
    const opts = options({ ajv: { coerceTypes: true } })

    assert.equal(typeof opts, 'object')
    assert.equal(opts.forceCloseConnections, true)
    assert.equal(opts.trustProxy, false)
    assert.equal(typeof opts.genReqId, 'function')
    assert.equal(opts.logger.level, 'debug')
    assert.equal(opts.logger.name, `${name}@v${version}`)
    assert.equal(opts.ajv.coerceTypes, true)
    done()
  })
})

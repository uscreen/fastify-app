import tap from 'tap'
import { readPackageUpSync } from 'read-pkg-up'
import { options } from '../index.js'

const pack = readPackageUpSync()
const { name, version } = pack.packageJson

tap.test('options()', (t) => {
  t.afterEach(() => {
    delete process.env.NODE_ENV
  })

  t.test('should return an object', (t) => {
    const opts = options()
    t.type(opts, 'object')
    t.end()
  })

  t.test('should return development settings by default', (t) => {
    delete process.env.NODE_ENV
    const opts = options()

    t.type(opts, 'object')
    t.same(opts.forceCloseConnections, true)
    t.type(opts.genReqId, 'function')
    t.same(opts.logger.level, 'debug')
    t.same(opts.logger.name, `${name}@v${version}`)
    t.same(opts.logger.transport.target, 'pino-pretty')
    t.type(opts.logger.transport.options, 'object')
    t.same(opts.logger.transport.options.sync, true)
    t.same(opts.logger.transport.options.translateTime, true)
    t.end()
  })

  t.test('should return test settings', (t) => {
    process.env.NODE_ENV = 'test'
    const opts = options()

    t.type(opts, 'object')
    t.same(opts.forceCloseConnections, true)
    t.type(opts.genReqId, 'function')
    t.same(opts.logger, false)
    t.end()
  })

  t.test('should return production settings', (t) => {
    process.env.NODE_ENV = 'production'
    const opts = options()

    t.type(opts, 'object')
    t.same(opts.forceCloseConnections, true)
    t.type(opts.genReqId, 'function')
    t.same(opts.logger.level, 'debug')
    t.same(opts.logger.name, `${name}@v${version}`)
    t.end()
  })

  t.test('should return fallback settings', (t) => {
    process.env.NODE_ENV = 'foo'
    const opts = options()

    t.type(opts, 'object')
    t.same(opts.forceCloseConnections, true)
    t.type(opts.genReqId, 'function')
    t.same(opts.logger, true)
    t.end()
  })

  t.test('should return custom settings', (t) => {
    process.env.NODE_ENV = 'production'
    const opts = options({ logLevel: 'info' })

    t.type(opts, 'object')
    t.same(opts.forceCloseConnections, true)
    t.type(opts.genReqId, 'function')
    t.same(opts.logger.level, 'info')
    t.same(opts.logger.name, `${name}@v${version}`)
    t.end()
  })

  t.test('should pass through ajv option if set', (t) => {
    const opts = options({ ajv: { coerceTypes: true } })

    t.type(opts, 'object')
    t.same(opts.forceCloseConnections, true)
    t.type(opts.genReqId, 'function')
    t.same(opts.logger.level, 'debug')
    t.same(opts.logger.name, `${name}@v${version}`)
    t.same(opts.ajv.coerceTypes, true)
    t.end()
  })

  t.end()
})

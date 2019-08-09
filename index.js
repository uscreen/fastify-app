'use strict'

const path = require('path')
const readPkgUp = require('read-pkg-up')
const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts, next) => {
  /**
   * read package information
   */
  const pack = readPkgUp.sync()
  const pkg = {
    name: pack.package.name,
    version: pack.package.version,
    root: path.dirname(pack.path)
  }

  /**
   * add package information
   */
  for (const [k, v] of Object.entries(pkg)) {
    fastify.decorate(k, v)
  }

  /**
   * post-treatment
   */
  fastify.ready(err => {
    if (err) throw err
    fastify.log.debug(
      `${fastify.name} (${fastify.version}) ready. pwd: ${fastify.root}`
    )
  })

  next()
})

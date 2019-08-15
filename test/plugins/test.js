'use strict'

const fp = require('fastify-plugin')

module.exports = fp(function(fastify, opts, next) {
  fastify.decorate('something', function() {
    return 'works'
  })
  fastify.decorate('getOptions', function() {
    return opts
  })
  next()
})

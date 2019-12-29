'use strict'

const fp = require('fastify-plugin')

module.exports = fp(function(fastify, opts, next) {
  fastify.decorate('something2', function() {
    return 'works2'
  })
  fastify.decorate('getOptions2', function() {
    return opts
  })
  next()
})

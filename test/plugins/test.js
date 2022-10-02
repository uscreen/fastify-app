import fp from 'fastify-plugin'

export default fp(function (fastify, opts, next) {
  fastify.decorate('something', function () {
    return 'works'
  })
  fastify.decorate('getOptions', function () {
    return opts
  })
  next()
})

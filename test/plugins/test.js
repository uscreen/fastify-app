import fp from 'fastify-plugin'

export default fp((fastify, opts, next) => {
  fastify.decorate('something', () => {
    return 'works'
  })
  fastify.decorate('getOptions', () => {
    return opts
  })
  next()
})

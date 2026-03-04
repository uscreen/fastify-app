import fp from 'fastify-plugin'

export default fp((fastify, opts, next) => {
  fastify.decorate('something2', () => {
    return 'works2'
  })
  fastify.decorate('getOptions2', () => {
    return opts
  })
  next()
})

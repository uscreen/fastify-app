// This file contains code that we reuse
// between our tests.

import Fastify from 'fastify'
import fp from 'fastify-plugin'
import App from '../index.js'

// automatically build and tear down our instance
export const build = (t, config = {}) => {
  const app = Fastify()

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  app.register(fp(App), config)

  // tear down our app after we are done
  t.teardown(app.close.bind(app))

  return app
}

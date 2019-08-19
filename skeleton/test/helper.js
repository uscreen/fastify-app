'use strict'

// This file contains code that we reuse
// between our tests.

const Fastify = require('fastify')
const fp = require('fastify-plugin')

// setup to require YOUR app
const App = require('../index')

// automatically build and tear down our instance
function build(t, config = {}) {
  const app = Fastify()

  // setup to register YOUR app
  app.register(fp(App), config)

  // tear down our app after we are done
  t.tearDown(app.close.bind(app))

  return app
}

module.exports = {
  build
}

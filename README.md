# fastify-app

[![Test CI](https://github.com/uscreen/fastify-app/actions/workflows/main.yml/badge.svg)](https://github.com/uscreen/fastify-app/actions/workflows/node.js.yml)
[![Test Coverage](https://coveralls.io/repos/github/uscreen/fastify-app/badge.svg?branch=main)](https://coveralls.io/github/uscreen/fastify-app?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/uscreen/fastify-app/badge.svg?targetFile=package.json)](https://snyk.io/test/github/uscreen/fastify-app?targetFile=package.json)
[![NPM Version](https://badge.fury.io/js/@uscreen.de%2Ffastify-app.svg)](https://badge.fury.io/js/@uscreen.de%2Ffastify-app)

> Opinionated feature pack (of packages) to bootstrap a fastify app

## Features

* decorates your app with __`name`__, __`version`__ and __`root`__-path read from package.json
* decorates your app with any given __`config`__
* provides __OpenAPI 3.0__ docs by use of [@fastify/swagger](https://github.com/fastify/fastify-swagger) & [Scalar](https://github.com/scalar/scalar)
* enables extra __security__ headers as provided by __helmet__ [@fastify/helmet](https://github.com/fastify/fastify-helmet)
* provides extra __sensible defaults__ provided by [@fastify/sensible](https://github.com/fastify/fastify-sensible)
* uses [@fastify/autoload](https://github.com/fastify/fastify-autoload) to __load plugins, models, services, whatever__ from configurable directories
* provides __monitoring healthcheck__ endpoint by use of [under-pressure](https://github.com/fastify/under-pressure)

All those features are ready setup with defaults, that may be customized further to your likings.

## Get Started (cli)

Easy start by `pnpm create` cli command to create a new fastify-app from scratch instead of manually setting up a new fastify instance, like so:

```bash
$ pnpm create @uscreen.de/fastify-app new-app
```

It will create a directory called `new-app` inside the current folder.
Inside that directory, it will generate the initial project structure:

```bash
new-app
├── .env
├── .env.example
├── .gitignore
├── README.md
├── app
│   ├── app.js
│   ├── config.js
│   ├── plugins
│   │   └── noop.js
│   ├── schemas.js
│   ├── server.js
│   └── services
│       └── noop.js
├── package.json
└── test
    ├── app
    │   └── noop.test.js
    └── helper.js
```

---

## Install (manual)

```sh
$ pnpm add @uscreen.de/fastify-app # or use npm -i
```

## Example (manual)

Minimal example:

```js
import defaultApp from '@uscreen.de/fastify-app'

// register with defaults
fastify.register(defaultApp)
```

With default server options for logging, etc.

```js
import Fastify from 'fastify'
import defaultApp, { options } from '@uscreen.de/fastify-app'

// create fastify instance with default options
const fastify = Fastify(options())

// register with defaults
fastify.register(defaultApp)
```

This enables all default features and exposes some extra routes, like:

* `GET /docs` - autogenerated OpenAPI 3.0 documentation of all endpoint
* `GET /health` - healthcheck endpoint return HTTP 200 `{"status":"ok"}`

---

## Options

All options get validated and defaulted to a defined json-schema you can check in [config.js](./config.js) Overview of options:

| option                    | Description                                                                                                                                                                                                                                                                                | Default                           | Example                                                           |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|-------------------------------------------------------------------|
| __autoloads__             | array of directories [@fastify/autoload](https://github.com/fastify/fastify-autoload) should load your fastify plugins from. Please consider reading [Loading order of your plugins](https://github.com/fastify/fastify/blob/master/docs/Getting-Started.md#loading-order-of-your-plugins) | `[]`                              | `['./plugins', './services']`                                     |
| __swagger__               | object configuring [@fastify/swagger](https://github.com/fastify/fastify-swagger) to generate Swagger2/OpenAPI3 docs from your routes                                                                                                                                                      | `{exposeRoute: true, openapi:{}}` | `{exposeRoute: '/docs'}`                                          |
| __swagger.scalar__        | object configuring [@scalar/fastify-api-reference](https://github.com/scalar/scalar/tree/main/packages/fastify-api-reference) to configure the scalar client. Read [Configuration](https://github.com/scalar/scalar/blob/main/documentation/configuration.md) for more details.            | `{}`                              | `{theme: 'solarized'}`                                            |
| __health__                | object configuring [under-pressure](https://github.com/fastify/under-pressure) to provide a monitoring healthcheck route for your app                                                                                                                                                      | `{exposeStatusRoute: true}`       | `{exposeStatusRoute: '/health'}`                                  |
| __contentSecurityPolicy__ | object configuring [helmet](https://github.com/helmetjs/helmet) to set CSR headers on each response                                                                                                                                                                                        | `{contentSecurityPolicy: false}`  | `{contentSecurityPolicy: {directives: {defaultSrc: ["'self'"]}}}` |

---

## Howto add custom healthchecks

decorate your `healthCheck` option with a custom function returning truthy on success, ie.:

```js
import fastifyApp from '@uscreen.de/fastify-app'
import fp from 'fastify-plugin'
import schemas from './schemas.js'

export default fp(async (fastify, opts, next) => {
  /**
   * add schemas
   */
  fastify.register(schemas)

  /**
   * configure healthcheck
   */
  opts.healthCheck = {
    ...opts.healthCheck,

    healthCheck: async () => {
      /**
       * check for proper mongo conenction
       */
      const collections = await fastify.mongo.db.collections()

      /**
       * check for proper nats connection
       */
      const natsConnected = await fastify.nats.testConnection()

      /**
       * check for proper redis connection
       */
      const redisConnected = await fastify.redis.ping()

      /**
       * true if all tests passed
       */
      return collections && natsConnected && redisConnected && true
    }
  }

  /**
   * register app
   */
  fastify.register(fastifyApp, opts)

  next()
})

```

## Roadmap

- TBD

## Changelog

### 3.1.0

#### Added

- config.logger.name to set logger name as config injection, ie: `config.logger.name = 'my-app'`

### 3.0.1

#### Changed

- update readme to changes in @uscreen.de/create-fastify-app

### 3.0.0

#### Added

- support for Node.js v22

#### Changed

- use Scalar instead of Swagger-UI
- use @fastify/one-line-logger instead of pino-pretty

#### Removed

- support for Swagger (OpenAPI v2)

### 2.1.0

#### Changed

- make `options` method pass through `trustProxy` property.

### 2.0.0

#### Changed

- upgrade to fastify@5.x

### 1.1.0

#### Changed

- make `options` method pass through `ajv` property.

### 1.0.0

#### Changed

- switch to __ESM only__
- upgrade to fastify@4.x

#### Added

- a server options factory providing defaults for logging and generateId __options([config])__

### 0.8.3

#### Changed

- replaced fastify-[module] with their scoped versions (@fastify/autoload, @fastify/helmet, @fastify/sensible, @fastify/swagger)

#### Fixed

- fixed deprecation warning
- fixed swagger /docs routes

### 0.8.0

#### Changed

- upgrade all deps including major versions, like fastify-helmet@4.x
- replace fastify-swagger with fastify-swagger
- upgrade node LTS (16)

### 0.7.0

#### Changed

- upgraded all deps including major versions, like fastify-plugin@3.x
- upgrade node LTS (14)

### 0.6.0

#### Changed

- upgraded all deps including major versions, like fastify@3.6.x, env-schem@2.0.0
- uses shared config @uscreen.de/eslint-config-prettystandard-node

### 0.5.1

#### Fixed

- fastify 3.6.x decorates `fastify.version` which broke

#### Added

- decorate `fastify.app.version`, `fastify.app.name`, and `fastify.app.root`

#### Changed

- skip decoration of any `fastify.<decorator>` if already declared

### 0.5.0

- upgraded to fastify 3.x with backward compatible defaults

### 0.4.0

- added alias of `health` <-> `healthCheck`

### 0.3.0

- moved cli to separate package `@uscreen.de/create-fastify-app`

### 0.2.0

- added cli

### 0.1.0

- added tests (100% coverage)

### 0.0.0

- project setup, linting, guidlines

---

## License

Licensed under [MIT](./LICENSE).

Published, Supported and Sponsored by [u|screen](https://uscreen.de)

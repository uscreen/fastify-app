# Agent Guidelines for @uscreen.de/fastify-app

This document provides comprehensive guidelines for AI coding agents working with this Fastify application framework. The codebase is an opinionated Fastify bootstrap package that combines best practices and essential plugins.

## Commands

### Package Manager
- **CRITICAL**: Use `pnpm` ONLY (enforced by preinstall hook)
- Never use `npm` or `yarn` - the preinstall hook will prevent it
- Package manager version: `pnpm@10.14.0`

### Testing
- **Run all tests**: `pnpm test`
- **Run single test file**: `node --test test/specific.test.js`
- **With coverage (HTML + text)**: `pnpm test:cov`
- **CI coverage (lcov + text)**: `pnpm test:ci`
- Test reporter: Uses Node.js built-in `--test-reporter spec`

### Linting
- **Lint and auto-fix**: `pnpm lint`
- Lints all `**/*.js` files with ESLint
- Auto-fixes issues when possible

### Development
- No build step required (pure ES modules)
- Example app: `node examples/defaults/example.js`

## Code Style & Conventions

### Module System
- **Type**: ES modules (`"type": "module"` in package.json)
- Always use `.js` extensions in imports
- Use `import`/`export`, never `require()`

### Import Organization
Organize imports in this order with blank lines between groups:
```javascript
// 1. Node.js built-ins
import fs from 'fs'
import path from 'path'

// 2. npm packages
import Fastify from 'fastify'
import fp from 'fastify-plugin'

// 3. Local files
import configure from './config.js'
```

### Naming Conventions
- **Variables/Functions**: `camelCase`
- **Constants**: `camelCase` (not SCREAMING_SNAKE_CASE unless true constants)
- **Files**: `kebab-case.js` (e.g., `app.defaults.test.js`)
- **Test files**: `*.test.js` pattern

### Indentation & Formatting
- **Indent**: 2 spaces (no tabs, except in Makefiles)
- **Quotes**: Single quotes for strings
- **Line endings**: LF (Unix-style)
- **Final newline**: Always include
- **Trailing whitespace**: Remove
- **ESLint**: `@uscreen.de/eslint-config-prettystandard-node`

### Functions & Documentation
- Use JSDoc comments for all exported functions
- JSDoc format:
```javascript
/**
 * Brief description of function
 * @param {Type} paramName - description
 * @returns {Type} description
 */
export const functionName = (paramName) => {
  // implementation
}
```

- Prefer `async/await` over Promise chains
- Use arrow functions for short callbacks
- Use named function expressions for complex logic

### Fastify Plugin Pattern
All plugins MUST follow this pattern:
```javascript
import fp from 'fastify-plugin'

export default fp(async (fastify, opts) => {
  // Plugin logic here
  // Access options via opts
  // Use fastify.decorate() for adding properties
})
```

- Always wrap plugins with `fastify-plugin` (fp)
- Use `async` functions (not callbacks with `next()`)
- Callback style with `next()` is acceptable for simple plugins

## Testing

### Test Framework
- **Framework**: Node.js built-in test runner (`node:test`)
- **Assertions**: `node:assert/strict`
- **No external dependencies**: No Jest, Mocha, etc.

### Test Structure
```javascript
import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from './helper.js'

test('description of test suite', (t, done) => {
  const fastify = build(t)

  fastify.ready(async (err) => {
    await t.test('nested test description', (t, done) => {
      assert.ok(!err)
      // assertions here
      done()
    })

    done()
  })
})
```

### Test Helpers
- Use `build(t, config)` from `test/helper.js` to create Fastify instances
- Use `buildWithOptions(t, config)` for custom Fastify options
- The helper automatically tears down instances via `t.after()`

### Test Conventions
- Test files in `test/` directory
- Use `fastify.inject()` for HTTP testing (no need to start server)
- Always check for errors: `assert.ok(!err)`
- Use `assert.equal()`, `assert.deepEqual()`, `assert.ok()`
- Clean up resources in `t.after()` callbacks

## Configuration & Environment

### Config Schema Validation
- Use `env-schema` to validate all configuration
- Define schemas in `config.js` with JSON Schema
- All options have defaults - nothing is required

### Config Merging
- Use `assign-deep` to merge configs (not Object.assign)
- Config is decorated on `fastify.config`

### Available Config Options
- `prefix`: Route prefix (default: '')
- `autoloads`: Array of directories for autoloading plugins
- `swagger`: OpenAPI/Scalar configuration
- `health`: Health check configuration
- `contentSecurityPolicy`: Helmet CSP config

## Error Handling

### HTTP Errors
- Use `fastify.httpErrors` from `@fastify/sensible`
- Example: `throw fastify.httpErrors.notFound('Resource not found')`
- Available: `badRequest`, `unauthorized`, `forbidden`, `notFound`, `internalServerError`, etc.

### Error Responses
- Let Fastify handle error serialization
- Don't manually construct error objects
- Use appropriate HTTP status codes

## Logging

### Logger Usage
- Access via `fastify.log`
- Log levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`
- Default level: `debug` (configurable via options)
- Examples:
  - `fastify.log.info('Server started')`
  - `fastify.log.error({ err }, 'Request failed')`
  - `fastify.log.debug({ userId }, 'User action')`

### Logger Configuration
- Transport: `@fastify/one-line-logger` with colorization
- Request ID automatically included via `hyperid`
- Never log sensitive data (passwords, tokens, API keys)

## Security

### Helmet
- Automatically configured via `@fastify/helmet`
- CSP disabled by default (enable via `contentSecurityPolicy` option)
- Custom headers added in `onSend` hook:
  - `X-Request-ID`: Request correlation ID
  - `X-Powered-By`: App name and version
  - `X-XSS-Protection`: XSS protection header

### Best Practices
- Trust proxy setting available via `trustProxy` option
- Don't expose sensitive data in logs or responses
- Validate all input with JSON Schema
- Use proper HTTP status codes

## Key Dependencies

### Core Fastify Plugins
- `@fastify/autoload`: Auto-load plugins from directories
- `@fastify/helmet`: Security headers
- `@fastify/sensible`: Sensible defaults & HTTP errors
- `@fastify/swagger`: OpenAPI 3.0 documentation
- `@fastify/under-pressure`: Health checks & monitoring
- `@scalar/fastify-api-reference`: API documentation UI

### Utilities
- `fastify-plugin`: Plugin wrapper (import as `fp`)
- `env-schema`: Config validation
- `assign-deep`: Deep object merging
- `hyperid`: Fast unique ID generation
- `read-package-up`: Read package.json

## Common Patterns

### Decorating Fastify Instance
```javascript
fastify.decorate('myProperty', value)
fastify.decorate('myMethod', () => {})
```

### Adding Schemas
```javascript
fastify.addSchema({
  $id: 'mySchema',
  type: 'object',
  properties: {
    // schema definition
  }
})
```

### Route Definitions
```javascript
fastify.get('/path', {
  schema: {
    response: {
      200: { type: 'object', properties: {} }
    }
  }
}, async (request, reply) => {
  return { data: 'value' }
})
```

## CI/CD

- **CI**: GitHub Actions
- **Node versions tested**: 20, 22, 24
- **Coverage**: Coveralls integration
- **Auto-merge**: Dependabot PRs auto-merge on success

## Important Files

- `index.js`: Main plugin export
- `config.js`: Configuration schema and validation
- `test/helper.js`: Test utilities
- `.eslintrc`: ESLint configuration
- `.editorconfig`: Editor settings
- `package.json`: Dependencies and scripts

## When Making Changes

1. Always run tests after changes: `pnpm test`
2. Fix linting issues: `pnpm lint`
3. Check coverage if adding features: `pnpm test:cov`
4. Follow existing code patterns and structure
5. Add tests for new functionality
6. Update JSDoc comments for public APIs
7. Don't commit sensitive data or credentials
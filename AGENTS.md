# Agent Guidelines for @uscreen.de/fastify-app

Opinionated Fastify bootstrap package: combines security headers, OpenAPI docs, health checks, autoloading, and sensible defaults into a single plugin.

## Commands

### Package Manager
- **CRITICAL**: Use `pnpm` ONLY (enforced by `only-allow` preinstall hook)
- Never use `npm` or `yarn`

### Testing
- **Run all tests**: `pnpm test`
- **Run single test file**: `node --test test/specific.test.js`
- **Coverage (HTML + text)**: `pnpm test:cov`
- **CI coverage (lcov + text)**: `pnpm test:ci`

### Linting
- **Check**: `pnpm lint`
- **Auto-fix**: `pnpm lint:fix`
- Config: `eslint.config.js` (flat config with `@antfu/eslint-config`)

### Development
- No build step (pure ES modules)
- Example app: `node examples/defaults/example.js`

## Code Style & Formatting

### Module System
- ES modules only (`"type": "module"` in package.json)
- Always use `.js` extensions in imports
- Use `import`/`export`, never `require()`

### Import Organization
Three groups separated by blank lines:
```javascript
// 1. Node.js built-ins (use node: prefix)
import fs from 'node:fs'
import path from 'node:path'

// 2. npm packages
import Fastify from 'fastify'
import fp from 'fastify-plugin'

// 3. Local files
import configure from './config.js'
```

### Formatting Rules
- **Indent**: 2 spaces (tabs only in Makefiles)
- **Quotes**: Single quotes
- **Trailing commas**: Never (enforced: `'style/comma-dangle': ['error', 'never']`)
- **Semicolons**: None (antfu default)
- **Line endings**: LF
- **Final newline**: Always
- **Trailing whitespace**: Remove
- **Curly braces**: Required for multi-line blocks (`'curly': ['error', 'multi-line', 'consistent']`)
- **Console**: Allowed (`'no-console': 'off'`)
- **Top-level functions**: Arrow functions allowed (`'antfu/top-level-function': 'off'`)

### Naming Conventions
- **Variables/Functions**: `camelCase`
- **Files**: `kebab-case.js` or `dot.separated.js` (e.g., `app.defaults.test.js`)
- **Test files**: `*.test.js` in `test/` directory

### Functions & Documentation
- Prefer `async/await` over Promise chains
- Arrow functions for short callbacks; named expressions for complex logic
- JSDoc for exported functions:
```javascript
/**
 * Brief description
 * @param {Type} paramName - description
 * @returns {Type} description
 */
export const functionName = (paramName) => {
  // implementation
}
```

## Fastify Plugin Pattern

Always wrap with `fastify-plugin`:
```javascript
import fp from 'fastify-plugin'

export default fp(async (fastify, opts) => {
  fastify.decorate('myProperty', value)
})
```

Callback style with `next()` is acceptable for simple plugins.

## Testing

### Framework
- **Test runner**: Node.js built-in (`node:test`)
- **Assertions**: `node:assert/strict`
- No external test frameworks (no Jest, Mocha, etc.)

### Test Structure
```javascript
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from './helper.js'

test('description of test suite', (t, done) => {
  const fastify = build(t)

  fastify.ready(async (err) => {
    await t.test('nested test', (t, done) => {
      assert.ok(!err)
      done()
    })

    await t.test('HTTP test', (t, done) => {
      fastify.inject({ method: 'GET', url: '/health' }, (e, response) => {
        assert.ok(!e)
        assert.equal(response.statusCode, 200)
        done()
      })
    })

    done()
  })
})
```

### Test Helpers (`test/helper.js`)
- `build(t, config)` — creates Fastify instance with the app plugin, auto-teardown
- `buildWithOptions(t, config)` — same but also applies `options()` factory for logger/server config
- Use `fastify.inject()` for HTTP testing (no server start needed)

## Error Handling
- Use `fastify.httpErrors` from `@fastify/sensible`:
  `throw fastify.httpErrors.notFound('Resource not found')`
- Let Fastify handle error serialization — don't construct error objects manually
- Validate all input with JSON Schema

## Configuration
- Config validated via `env-schema` in `config.js`
- Merged with `assign-deep` (not Object.assign) and decorated on `fastify.config`
- Key options: `prefix`, `autoloads`, `swagger`, `health`, `contentSecurityPolicy`
- All options have defaults — nothing is required

## Logging
- Access via `fastify.log` (levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`)
- Transport: `@fastify/one-line-logger` with colorization
- Request IDs generated via `hyperid`
- Never log sensitive data (passwords, tokens, API keys)

## Security
- `@fastify/helmet` auto-configured; CSP disabled by default
- Custom `onSend` hook adds: `X-Request-ID`, `X-Powered-By`, `X-XSS-Protection`

## Key Files
- `index.js` — Main plugin export + `options()` factory
- `config.js` — Configuration schema and validation
- `test/helper.js` — Test utilities (`build`, `buildWithOptions`)
- `eslint.config.js` — ESLint flat config
- `.editorconfig` — Editor formatting settings

## CI/CD
- GitHub Actions: Node.js 20, 22, 24
- Coverage: Coveralls integration
- Dependabot PRs auto-merge on success

## Workflow
1. Always run `pnpm test` after changes
2. Fix lint issues: `pnpm lint:fix`
3. Add tests for new functionality
4. Follow existing code patterns
5. Never commit secrets or credentials

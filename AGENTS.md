# Agent Guidelines for @uscreen.de/fastify-app

## Commands
- **Test**: `pnpm test` (all tests), `node --test test/specific.test.js` (single test)
- **Lint**: `pnpm lint` (auto-fixes with ESLint)
- **Coverage**: `pnpm test:cov` (HTML + text), `pnpm test:ci` (lcov + text)
- **Package Manager**: Use `pnpm` only (enforced by preinstall hook)

## Code Style
- **ESLint Config**: `@uscreen.de/eslint-config-prettystandard-node`
- **Module Type**: ES modules (`"type": "module"`)
- **Imports**: Use named imports, group by: Node.js built-ins, npm packages, local files
- **Functions**: Use JSDoc comments for exported functions
- **Testing**: Node.js built-in test runner with `node:test` and `node:assert/strict`
- **Error Handling**: Use `fastify.httpErrors` from `@fastify/sensible`

## Conventions
- **Naming**: camelCase for variables/functions, kebab-case for files
- **Exports**: Use `export default fp(async (fastify, opts) => {})` for plugins
- **Config**: Validate with `env-schema`, merge with `assign-deep`
- **Logging**: Use fastify's built-in logger with appropriate levels
- **Security**: Helmet is configured, avoid exposing sensitive data in logs
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@uscreen.de/fastify-app` — an opinionated Fastify bootstrap plugin that bundles security headers (helmet), OpenAPI docs (swagger + Scalar UI), health checks (under-pressure), sensible defaults, and plugin autoloading into a single registration.

## Commands

- **Package manager**: `pnpm` only (enforced via preinstall hook — never use npm/yarn)
- **Run all tests**: `pnpm test`
- **Run single test**: `node --test test/app.defaults.test.js`
- **Coverage**: `pnpm test:cov` (HTML + text)
- **Lint**: `pnpm lint` / `pnpm lint:fix`
- **No build step** — pure ESM, runs directly with Node.js

## Architecture

Two exports from `index.js`:
- **Default export** — Fastify plugin that registers all feature plugins and decorates the instance with `app.name`, `app.version`, `app.root`, and `config`
- **`options()` factory** — creates Fastify server options (logger via `@fastify/one-line-logger`, request ID via `hyperid`, `forceCloseConnections`, `trustProxy`)

`config.js` defines a JSON Schema validated by `env-schema`. All config options (`prefix`, `autoloads`, `swagger`, `health`, `contentSecurityPolicy`) have defaults — nothing is required.

Plugin registration order in the default export: swagger → Scalar UI → helmet → sensible → autoload (user plugins) → under-pressure. A custom `onSend` hook adds `X-Request-ID`, `X-Powered-By`, and `X-XSS-Protection` headers.

## Code Style

- ESM only with `.js` extensions in imports
- No semicolons, single quotes, no trailing commas, 2-space indent
- Imports ordered: `node:` builtins → npm packages → local files (blank lines between groups)
- Plugins wrapped with `fastify-plugin`
- See AGENTS.md for full style guide

## Testing

- Node.js built-in `node:test` + `node:assert/strict` (no external test frameworks)
- `test/helper.js` provides `build(t, config)` and `buildWithOptions(t, config)` — creates Fastify instances with auto-teardown
- Tests use callback pattern with `done()` and `fastify.inject()` for HTTP assertions
- CI runs on Node.js 20, 22, 24

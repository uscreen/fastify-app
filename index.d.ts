import type { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import type { FastifyHelmetOptions } from '@fastify/helmet'
import type { FastifyUnderPressureOptions } from '@fastify/under-pressure'

export interface FastifyAppConfig {
  /** Route prefix for all generated endpoints (docs, health) */
  prefix?: string

  /** Directories to autoload plugins from via @fastify/autoload */
  autoloads?: string[]

  /** Swagger / OpenAPI configuration */
  swagger?: FastifyAppSwaggerConfig

  /** Health check / under-pressure configuration */
  health?: FastifyAppHealthConfig

  /**
   * Alias for `health` — if provided and `health` is not set, this is used instead.
   * @deprecated Use `health` instead.
   */
  healthCheck?: FastifyAppHealthConfig

  /**
   * Helmet content security policy configuration.
   * Set to `false` to disable (default), `true` for helmet defaults,
   * or an object with CSP directives.
   */
  contentSecurityPolicy?: FastifyHelmetOptions['contentSecurityPolicy']
}

export interface FastifyAppSwaggerConfig {
  /** Route prefix for the docs endpoint (default: `${prefix}/docs`) */
  routePrefix?: string

  /** Whether to expose the Scalar API reference route (default: true) */
  exposeRoute?: boolean

  /** OpenAPI 3.0 specification object passed to @fastify/swagger (OpenAPI v3.x document) */
  openapi?: Record<string, unknown>

  /** Scalar API reference client configuration */
  scalar?: Record<string, unknown>
}

export interface FastifyAppHealthConfig {
  /**
   * Expose a status route.
   * `true` resolves to `${prefix}/health`, or pass a string for a custom path.
   * (default: true)
   */
  exposeStatusRoute?: boolean | string

  /** Max event loop delay in ms before the service is marked unhealthy (default: 1000) */
  maxEventLoopDelay?: number

  /** Max heap used bytes before the service is marked unhealthy (default: 128 MiB) */
  maxHeapUsedBytes?: number

  /** Max RSS bytes before the service is marked unhealthy (default: 256 MiB) */
  maxRssBytes?: number

  /** Retry-After header value in ms when unhealthy (default: 50) */
  retryAfter?: number

  /** Custom async health check function; should return true if healthy */
  healthCheck?: FastifyUnderPressureOptions['healthCheck']
}

export interface FastifyAppOptionsConfig {
  /** Ajv options passed through to Fastify */
  ajv?: FastifyServerOptions['ajv']

  /** Pino log level (default: 'debug') */
  logLevel?: string

  /** Whether to trust proxy headers (default: false) */
  trustProxy?: boolean | string | string[] | number

  /** Logger configuration */
  logger?: {
    /** Custom logger name (default: `${packageName}@v${packageVersion}`) */
    name?: string
  }
}

export interface FastifyAppPackageInfo {
  /** Package name from package.json */
  name: string
  /** Package version from package.json */
  version: string
  /** Package description from package.json */
  description: string
  /** Root directory of the package (dirname of package.json) */
  root: string
}

/**
 * Factory that creates Fastify server options with opinionated defaults
 * for logging (@fastify/one-line-logger), request ID generation (hyperid),
 * and connection handling.
 */
export declare const options: (config?: FastifyAppOptionsConfig) => FastifyServerOptions

/**
 * Opinionated Fastify plugin that bootstraps an app with security headers,
 * OpenAPI docs, health checks, sensible defaults, and plugin autoloading.
 */
declare const fastifyApp: FastifyPluginAsync<FastifyAppConfig>
export default fastifyApp

// Fastify instance decoration
declare module 'fastify' {
  interface FastifyInstance {
    /** Package name from package.json */
    name: string
    /** Package description from package.json */
    description: string
    /** Root directory of the package */
    root: string
    /** Namespaced package information */
    app: FastifyAppPackageInfo
    /** Merged plugin configuration */
    config: FastifyAppConfig & Record<string, unknown>
  }
}

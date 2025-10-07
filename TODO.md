implement another logger (one line pretty with objects as JSON)

/**
 * some simple logger
 */
const logger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true
    }
  },
  hooks: {
    logMethod(args, method, level) {
      const message = args
        .map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        )
        .join(' ')
      method.apply(this, [message])
    }
  }
})

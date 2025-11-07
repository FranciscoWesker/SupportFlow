import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  base: { pid: true },
  timestamp: pino.stdTimeFunctions ? pino.stdTimeFunctions.isoTime : undefined,
});

export default logger;

import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import winston from 'winston';
import { env } from './env.js';

const logDirectory = resolve(env.LOG_DIRECTORY);
mkdirSync(logDirectory, { recursive: true });

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
  defaultMeta: {
    service: 'school-erp-api',
  },
  transports: [
    new winston.transports.File({ filename: resolve(logDirectory, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: resolve(logDirectory, 'combined.log') }),
  ],
});

if (env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  );
}

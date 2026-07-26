import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';

async function startServer(): Promise<void> {
  await prisma.$connect();

  const server = app.listen(env.PORT, () => {
    logger.info('API server started', {
      port: env.PORT,
      environment: env.NODE_ENV,
    });
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    logger.info('Graceful shutdown requested', { signal });
    server.close((error) => {
      void prisma.$disconnect().finally(() => {
        if (error) {
          logger.error('API server shutdown failed', { signal });
          process.exit(1);
        }

        logger.info('API server stopped', { signal });
        process.exit(0);
      });
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

void startServer().catch((error: unknown) => {
  logger.error('API server could not start', {
    error: error instanceof Error ? error.message : 'Unknown startup error',
  });
  process.exit(1);
});

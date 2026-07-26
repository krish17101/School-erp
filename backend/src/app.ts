import cors, { type CorsOptions } from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';
import { requestContext } from './middlewares/request-context.middleware.js';
import { createApiV1Router } from './routes/v1.routes.js';
import type { DatabaseHealthChecker } from './services/database-health.service.js';
import { AppError } from './utils/app-error.js';

interface CreateAppOptions {
  databaseHealthChecker?: DatabaseHealthChecker;
}

function createCorsOptions(): CorsOptions {
  return {
    credentials: true,
    origin: (origin, callback) => {
      if (origin === undefined || env.CORS_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError(403, 'Origin is not allowed by the API CORS policy.', 'PERM_001'));
    },
  };
}

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestContext);
  app.use(helmet());
  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use('/api/v1', createApiV1Router(options.databaseHealthChecker));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();

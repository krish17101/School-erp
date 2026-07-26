import { Router } from 'express';
import { apiRateLimiter } from '../middlewares/rate-limit.middleware.js';
import type { DatabaseHealthChecker } from '../services/database-health.service.js';
import { createHealthRouter } from './health.routes.js';

export function createApiV1Router(checkDatabase?: DatabaseHealthChecker): Router {
  const router = Router();

  router.use(apiRateLimiter);
  router.use(createHealthRouter(checkDatabase));

  return router;
}

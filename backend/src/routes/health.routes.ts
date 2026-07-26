import { Router } from 'express';
import { createHealthController } from '../controllers/health.controller.js';
import type { DatabaseHealthChecker } from '../services/database-health.service.js';

export function createHealthRouter(checkDatabase?: DatabaseHealthChecker): Router {
  const router = Router();
  const healthController = checkDatabase ? createHealthController(checkDatabase) : createHealthController();

  router.get('/health', healthController);

  return router;
}

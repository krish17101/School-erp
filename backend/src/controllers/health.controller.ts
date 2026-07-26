import type { RequestHandler } from 'express';
import { checkDatabaseHealth, type DatabaseHealthChecker } from '../services/database-health.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export function createHealthController(checkDatabase: DatabaseHealthChecker = checkDatabaseHealth): RequestHandler {
  return asyncHandler(async (_request, response) => {
    await checkDatabase();

    sendSuccess(response, 200, 'Service is healthy.', {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  });
}

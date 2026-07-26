import { rateLimit } from 'express-rate-limit';
import { sendError } from '../utils/api-response.js';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1_000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_request, response) => {
    sendError(response, 429, 'Too many requests. Please try again later.', [
      {
        code: 'SYS_001',
        message: 'Rate limit exceeded.',
      },
    ]);
  },
});

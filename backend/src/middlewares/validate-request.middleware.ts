import type { Request, RequestHandler } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/async-handler.js';

export const requestValidationSchema = z.object({
  body: z.unknown(),
  params: z.record(z.string()),
  query: z.record(z.unknown()),
});

export type RequestValidationSchema = z.ZodType<z.infer<typeof requestValidationSchema>>;

export function validateRequest(schema: RequestValidationSchema): RequestHandler {
  return asyncHandler(async (request, _response, next) => {
    const validatedRequest = await schema.parseAsync({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    request.body = validatedRequest.body;
    request.params = validatedRequest.params;
    request.query = validatedRequest.query as Request['query'];
    next();
  });
}

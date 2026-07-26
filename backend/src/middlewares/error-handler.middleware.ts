import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import type { ApiErrorDetail } from '../types/api.js';
import { AppError } from '../utils/app-error.js';
import { sendError } from '../utils/api-response.js';

function createValidationError(error: ZodError): AppError {
  const errors: ApiErrorDetail[] = error.issues.map((issue) => ({
    code: 'VAL_001',
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return new AppError(422, 'Validation failed.', 'VAL_001', errors);
}

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return createValidationError(error);
  }

  if (error instanceof multer.MulterError) {
    return new AppError(400, 'File upload validation failed.', 'VAL_001');
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new AppError(409, 'A record with this value already exists.', 'DB_001');
    }

    if (error.code === 'P2003') {
      return new AppError(409, 'This operation violates a data relationship.', 'DB_001');
    }

    if (error.code === 'P2025') {
      return new AppError(404, 'The requested record was not found.', 'DB_001');
    }

    return new AppError(500, 'A database operation could not be completed.', 'DB_001');
  }

  return new AppError(500, 'An unexpected server error occurred.', 'SYS_001');
}

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const normalizedError = normalizeError(error);

  if (normalizedError.statusCode >= 500) {
    logger.error('Request failed', {
      requestId: request.requestId,
      method: request.method,
      path: request.path,
      statusCode: normalizedError.statusCode,
      code: normalizedError.code,
    });
  }

  sendError(response, normalizedError.statusCode, normalizedError.message, normalizedError.errors);
};

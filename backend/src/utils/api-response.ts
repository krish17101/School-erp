import type { Response } from 'express';
import type { ApiErrorDetail, ApiErrorResponse, ApiSuccessResponse } from '../types/api.js';

export function sendSuccess<TData>(
  response: Response,
  statusCode: number,
  message: string,
  data: TData,
  meta?: Record<string, unknown>,
): Response<ApiSuccessResponse<TData>> {
  const payload: ApiSuccessResponse<TData> = meta
    ? { success: true, message, data, meta }
    : { success: true, message, data };

  return response.status(statusCode).json(payload);
}

export function sendError(
  response: Response,
  statusCode: number,
  message: string,
  errors: ApiErrorDetail[] = [],
): Response<ApiErrorResponse> {
  return response.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

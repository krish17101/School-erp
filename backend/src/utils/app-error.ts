import type { ApiErrorDetail } from '../types/api.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors: ApiErrorDetail[];

  public constructor(statusCode: number, message: string, code: string, errors: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

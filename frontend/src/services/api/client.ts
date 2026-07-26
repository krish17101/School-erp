import { z } from 'zod';
import type { ApiResponse } from '@/types/api';

const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export class ApiClientError extends Error {
  public readonly statusCode: number;

  public constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

function getApiBaseUrl(): string {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new ApiClientError('VITE_API_BASE_URL is not configured.', 500);
  }

  return apiBaseUrl;
}

export async function apiClient<TData>(path: string, init?: RequestInit): Promise<TData> {
  const response = await fetch(new URL(path, `${getApiBaseUrl()}/`), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });
  const responseBody: unknown = await response.json();
  const envelope = apiResponseSchema.safeParse(responseBody);

  if (!envelope.success) {
    throw new ApiClientError('The API returned an invalid response.', response.status);
  }

  const apiResponse = responseBody as ApiResponse<TData>;

  if (!response.ok || !apiResponse.success) {
    throw new ApiClientError(apiResponse.message, response.status);
  }

  return apiResponse.data;
}

export interface ApiSuccessResponse<TData> {
  success: true;
  message: string;
  data: TData;
  meta?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  code: string;
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;

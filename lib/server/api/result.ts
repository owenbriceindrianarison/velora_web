export type ApiErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "UNAUTHORIZED"
  | "REFRESH_REUSED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "NETWORK"
  | "UNKNOWN"

export interface ApiError {
  code: ApiErrorCode
  message: string
  status?: number
}

export type ApiResult<T> =
  { ok: true; data: T } | { ok: false; error: ApiError }

export const Ok = <T>(data: T): ApiResult<T> => ({ ok: true, data })
export const Err = <T = never>(error: ApiError): ApiResult<T> => ({
  ok: false,
  error,
})

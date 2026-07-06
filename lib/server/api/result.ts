export type ApiErrorCode =
  // Domain (auth-service)
  | "INVALID_EMAIL"
  | "WEAK_PASSWORD"
  // Application (auth-service)
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "SESSION_NOT_FOUND"
  // Gateway structural validation
  | "EMAIL_REQUIRED"
  | "EMAIL_INVALID"
  | "PASSWORD_REQUIRED"
  | "REFRESH_TOKEN_REQUIRED"
  // HTTP-level / network
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
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

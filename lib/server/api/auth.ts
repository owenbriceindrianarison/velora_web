import "server-only"
import type { LoginInput, RegisterInput, TokenPair, User } from "./types"
import type { ApiResult } from "./result"
import { request } from "./http"

export function login(input: LoginInput): Promise<ApiResult<TokenPair>> {
  return request<TokenPair>("/auth/login", { method: "POST", body: input })
}

export function register(input: RegisterInput): Promise<ApiResult<TokenPair>> {
  return request<TokenPair>("/auth/register", { method: "POST", body: input })
}

export function refresh(refreshToken: string): Promise<ApiResult<TokenPair>> {
  return request<TokenPair>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  })
}

export function logout(refreshToken: string): Promise<ApiResult<void>> {
  return request<void>("/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
  })
}

export function me(accessToken: string): Promise<ApiResult<User>> {
  return request<User>("/me", { accessToken })
}

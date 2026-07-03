import "server-only"

import { Err, Ok, type ApiErrorCode, type ApiResult } from "./result"

const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:8080"

const TIMEOUT_MS = 10_000

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  accessToken?: string
  searchParams?: Record<string, string | number | undefined>
}

function mapErrorCode(raw: string | undefined, status: number): ApiErrorCode {
  switch (raw) {
    case "INVALID_CREDENTIALS":
    case "EMAIL_TAKEN":
    case "REFRESH_REUSED":
    case "VALIDATION":
      return raw
    default:
      if (status === 401) return "UNAUTHORIZED"
      if (status === 403) return "FORBIDDEN"
      if (status === 404) return "NOT_FOUND"
      if (status === 429) return "RATE_LIMITED"
      return "UNKNOWN"
  }
}

export async function request<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<ApiResult<T>> {
  const url = new URL(path, GATEWAY_URL)
  for (const [k, v] of Object.entries(opts.searchParams ?? {})) {
    if (v != undefined) url.searchParams.set(k, String(v))
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: {
        ...(opts.body !== undefined && {
          "content-type": "application/json",
        }),
        ...(opts.accessToken && {
          authorization: `Bearer ${opts.accessToken}`,
        }),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (e) {
    return Err({
      code: "NETWORK",
      message:
        e instanceof DOMException && e.name === "TimeoutError"
          ? "The gateway is not responding (timeout)."
          : "The gateway is unreachable.",
    })
  }

  // 204 : success without body (logout)
  if (res.status === 204) return Ok(undefined as T)

  let payload: unknown
  try {
    payload = await res.json()
  } catch {
    return Err({
      code: "UNKNOWN",
      message: "Non-JSON response from the gateway.",
      status: res.status,
    })
  }

  if (!res.ok) {
    const err = (payload as { error?: { code?: string; message?: string } })
      .error
    return Err({
      code: mapErrorCode(err?.code, res.status),
      message: err?.message ?? "Error ${res.status}",
      status: res.status,
    })
  }

  return Ok(payload as T)
}

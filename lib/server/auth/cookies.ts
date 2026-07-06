import "server-only"

import type { TokenPair } from "@/lib/server/api"

// export const ACCESS_COOKIE = process.env.COOKIE_ACCESS_NAME ?? "access_token"
// export const REFRESH_COOKIE = process.env.COOKIE_REFRESH_NAME ?? "refresh_token"

export const ACCESS_COOKIE = "access_token"
export const REFRESH_COOKIE = "refresh_token"

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30

const base = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
} as const

export interface CookieWriter {
  set(
    name: string,
    value: string,
    opts?: Partial<typeof base> & { maxAge?: number }
  ): unknown
}

export function setSessionCookies(store: CookieWriter, pair: TokenPair): void {
  store.set(ACCESS_COOKIE, pair.access_token, {
    ...base,
    maxAge: pair.expires_in,
  })
  store.set(REFRESH_COOKIE, pair.refresh_token, {
    ...base,
    maxAge: REFRESH_MAX_AGE,
  })
}

export function clearSessionCookies(store: CookieWriter): void {
  store.set(ACCESS_COOKIE, "", { ...base, maxAge: 0 })
  store.set(REFRESH_COOKIE, "", { ...base, maxAge: 0 })
}

import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"
import { cookies, headers } from "next/headers"
import { ACCESS_HEADER } from "@/proxy"
import { ACCESS_COOKIE } from "@/lib/server/auth/cookies"
import { User, SessionUser } from "@/lib/server/api/types"
import * as api from "@/lib/server/api"
import { isLocalVerifyAvailable, verifyAccessToken } from "./paseto"

export async function getAccessToken(): Promise<string | null> {
  const h = await headers()
  const fromHeader = h.get(ACCESS_HEADER)
  if (fromHeader) return fromHeader
  const c = await cookies()
  return c.get(ACCESS_COOKIE)?.value ?? null
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = await getAccessToken()
  if (!token) return null

  if (isLocalVerifyAvailable()) {
    const claims = verifyAccessToken(token)
    return claims ? { id: claims.sub } : null
  }

  const result = await api.auth.me(token)
  return result.ok ? { id: result.data.user_id } : null
})

export const getUser = cache(async (): Promise<User | null> => {
  const token = await getAccessToken()
  if (!token) return null
  const result = await api.auth.me(token)
  return result.ok ? result.data : null
})

export async function requireSession(): Promise<SessionUser> {
  const token = await getAccessToken()
  if (!token) redirect("/login")

  const user = await getSession()
  if (!user) redirect("/auth/clear")
  return user
}

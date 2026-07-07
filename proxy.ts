import { NextResponse, type NextRequest } from "next/server"
import {
  ACCESS_COOKIE,
  clearSessionCookies,
  REFRESH_COOKIE,
  setSessionCookies,
} from "@/lib/server/auth/cookies"
import * as api from "@/lib/server/api"

export const ACCESS_HEADER = "x-velora-access"
const AUTH_ROUTES = ["/login", "/register"]
const PUBLIC_ROUTES = [...AUTH_ROUTES]

function buildCsp(nonce: string): string {
  const dev = process.env.NODE_ENV !== "production"
  return [
    `default-src 'self'`,
    // strict-dynamic: nonce-ed scripts can load
    // others (Next's chunking depends on this) — TRUST
    // is propagated via the nonce, not via a list of origins.
    // unsafe-eval: only in dev mode, for HMR.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // Next injects inline styles without a nonce: unsafe-inline
    // on style-src is the standard compromise. The
    // dangerous vector (script-src), however, remains locked to the nonce.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' http://localhost:9000 blob: data:`,
    `connect-src 'self'`,
    `media-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join("; ")
}

function isProtected(pathname: string): boolean {
  return !PUBLIC_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

export async function proxy(req: NextRequest) {
  const headers = new Headers(req.headers)
  headers.delete(ACCESS_HEADER)
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const csp = buildCsp(nonce)
  headers.set("content-security-policy", csp)

  function withCsp(res: NextResponse): NextResponse {
    res.headers.set("content-security-policy", csp)
    return res
  }

  const access = req.cookies.get(ACCESS_COOKIE)?.value
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value
  const { pathname } = req.nextUrl

  if (access) {
    headers.set(ACCESS_HEADER, access)
    if (AUTH_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return withCsp(NextResponse.next({ request: { headers } }))
  }

  if (refresh) {
    const rotated = await api.auth.refresh(refresh)

    if (rotated.ok) {
      headers.set(ACCESS_HEADER, rotated.data.access_token)
      const res = NextResponse.next({ request: { headers } })
      setSessionCookies(res.cookies, rotated.data)
      return withCsp(res)
    }

    const res = isProtected(pathname)
      ? NextResponse.redirect(new URL("/login", req.url))
      : NextResponse.next({ request: { headers } })
    clearSessionCookies(res.cookies)
    return withCsp(res)
  }

  if (isProtected(pathname)) {
    const url = new URL("/login", req.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }
  return withCsp(NextResponse.next({ request: { headers } }))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}

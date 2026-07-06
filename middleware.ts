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

function isProtected(pathname: string): boolean {
  return !PUBLIC_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

export async function middleware(req: NextRequest) {
  const headers = new Headers(req.headers)
  headers.delete(ACCESS_HEADER)

  const access = req.cookies.get(ACCESS_COOKIE)?.value
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value
  const { pathname } = req.nextUrl

  if (access) {
    headers.set(ACCESS_HEADER, access)
    if (AUTH_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next({ request: { headers } })
  }

  if (refresh) {
    const rotated = await api.auth.refresh(refresh)

    if (rotated.ok) {
      headers.set(ACCESS_HEADER, rotated.data.access_token)
      const res = NextResponse.next({ request: { headers } })
      setSessionCookies(res.cookies, rotated.data)
      return res
    }

    const res = isProtected(pathname)
      ? NextResponse.redirect(new URL("/login", req.url))
      : NextResponse.next({ request: { headers } })
    clearSessionCookies(res.cookies)
    return res
  }

  if (isProtected(pathname)) {
    const url = new URL("/login", req.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}

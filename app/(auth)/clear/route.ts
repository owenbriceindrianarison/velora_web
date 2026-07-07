import { cookies } from "next/headers"
import { clearSessionCookies } from "../../../lib/server/auth/cookies"
import { redirect } from "next/navigation"

export async function GET() {
  clearSessionCookies(await cookies())
  redirect("/login")
}

"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import z from "zod"
import * as api from "@/lib/server/api"
import {
  clearSessionCookies,
  REFRESH_COOKIE,
  setSessionCookies,
} from "@/lib/server/auth/cookies"

export interface AuthFormState {
  error?: string
  fieldErrors?: Partial<Record<"email" | "password", string>>
  // fieldErrors?: Partial<Record<"email" | "password" | "display_name", string>>
  email?: string
}

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password required"),
})

const registerSchema = loginSchema.extend({
  password: z.string().min(8, "At least 8 characters"),
  // display_name: z.string().trim().min(1, "Name required").max(50, "50 max"),
})

function fieldErrors(err: z.ZodError): AuthFormState["fieldErrors"] {
  const out: AuthFormState["fieldErrors"] = {}
  for (const issue of err.issues) {
    const k = issue.path[0]
    if (k === "email" || k === "password") {
      out[k] ??= issue.message
    }
  }
  return out
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      fieldErrors: fieldErrors(parsed.error),
      email: String(formData.get("email") ?? ""),
    }
  }

  const result = await api.auth.login(parsed.data)
  console.log({ result, parsed })
  if (!result.ok) {
    return {
      error:
        result.error.code === "INVALID_CREDENTIALS"
          ? "Invalid email or password"
          : "Unable to connect. Please try again in a moment.",
      email: parsed.data.email,
    }
  }

  setSessionCookies(await cookies(), result.data)
  redirect("/")
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  console.log({ formData, parsed })
  if (!parsed.success) {
    return {
      fieldErrors: fieldErrors(parsed.error),
      email: String(formData.get("email") ?? ""),
    }
  }

  const result = await api.auth.register(parsed.data)
  console.log({ result })
  if (!result.ok) {
    return {
      error:
        result.error.code === "EMAIL_TAKEN"
          ? "An account already exists with this email address."
          : result.error.code === "INVALID_EMAIL" ||
              result.error.code === "WEAK_PASSWORD"
            ? result.error.message
            : "Unable to register. Please try again in a moment.",
      email: parsed.data.email,
    }
  }

  setSessionCookies(await cookies(), result.data)
  redirect("/")
}

export async function logoutAction(): Promise<void> {
  const store = await cookies()
  const refresh = store.get(REFRESH_COOKIE)?.value

  if (refresh) await api.auth.logout(refresh)
  clearSessionCookies(store)
  redirect("/login")
}

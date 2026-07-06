"use client"

import { AuthFormState, registerAction } from "@/lib/server/auth/actions"
import Link from "next/link"
import { useActionState } from "react"

const initial: AuthFormState = {}

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, initial)
  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-desctructive">
          {state.error}
        </p>
      )}
      {/* <div className="space-y-1">
        <label htmlFor="display_name" className="text-sm text_muted-foreground">
          Display Name
        </label>
        <input
          id="display_name"
          name="display_name"
          required
          className="w-full rounded-md border border-input bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
      </div> */}
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm text_muted-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          className="w-full rounded-md border border-input bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-desctructive">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm text_muted-foreground">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-input bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-desctructive">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-primary py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
      >
        {pending ? "Sign Up..." : "Sign Up"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        Already have account ?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  )
}

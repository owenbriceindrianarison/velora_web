import { logoutAction } from "@/lib/server/auth/actions"
import { getSession } from "@/lib/server/auth/session"
import Link from "next/link"
import React from "react"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <Link href="/" className="text-xl font-bold text-primary">
          Velora
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <form action={logoutAction}>
              <button className="rounded-md border border-border px-3 py-1 hover:bg-secondary">
                Logout
              </button>
            </form>
          </div>
        )}
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  )
}

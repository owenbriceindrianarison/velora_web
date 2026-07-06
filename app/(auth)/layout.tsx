import React from "react"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-4xl font-bold text-primary">
          Velora
        </h1>
        {children}
      </div>
    </main>
  )
}

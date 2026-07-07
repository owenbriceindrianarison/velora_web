"use client"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <html lang="fr">
      <body
        style={{ background: "#111", color: "#eee", fontFamily: "sans-serif" }}
      >
        <main style={{ textAlign: "center", paddingTop: "20vh" }}>
          <h1>Velora is unavailable</h1>
          {error.digest && <p>Reference : {error.digest}</p>}
        </main>
      </body>
    </html>
  )
}

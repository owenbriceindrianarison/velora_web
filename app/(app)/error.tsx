"use client"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h2 className="text-2xl font_semibold">Something went wrong</h2>
      <p className="text-muted-foreground">
        The error has been logged on our side.
        {error.digest && (
          <>
            {" "}
            Reference : <code className="text-foreground">{error.digest}</code>
          </>
        )}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        Retry
      </button>
    </div>
  )
}

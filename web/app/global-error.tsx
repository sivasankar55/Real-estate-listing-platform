"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-ink">
        <main className="mx-auto max-w-[720px] px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">Something went wrong.</h1>
          <button onClick={reset} className="mt-6 min-h-11 rounded-sm bg-brand px-5 font-semibold text-white">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

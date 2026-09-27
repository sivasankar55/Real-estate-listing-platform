"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-[720px] px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold text-danger">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-bold text-ink">We couldn’t load this page.</h1>
      <p className="mt-3 text-muted">Please try again, or return to the property search.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="min-h-11 rounded-sm bg-brand px-5 font-semibold text-white hover:bg-brand-hover">
          Try again
        </button>
        <Link href="/properties" className="inline-flex min-h-11 items-center rounded-sm border border-line px-5 font-semibold text-ink hover:bg-brand-subtle">
          Browse properties
        </Link>
      </div>
    </main>
  );
}

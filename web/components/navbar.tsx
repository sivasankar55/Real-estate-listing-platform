"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="border-b border-line bg-surface">
      <nav
        className="mx-auto flex min-h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/properties"
          className="inline-flex min-h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Image
            src="/nestora-logo.svg"
            alt="Nestora"
            width={160}
            height={40}
            priority
          />
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold">
          {loading ? (
            <span
              aria-hidden
              className="block h-11 w-36 animate-pulse rounded-sm bg-bg motion-reduce:animate-none"
            />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center px-3 text-ink hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                My listings
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex min-h-11 items-center px-3 text-ink hover:text-brand disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {signingOut ? "Logging out..." : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center px-3 text-ink hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Log in
              </Link>
              <Link
                href="/dashboard/properties/new"
                className="inline-flex min-h-11 items-center rounded-sm bg-brand px-4 text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Post listing
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

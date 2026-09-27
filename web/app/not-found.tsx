import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[720px] px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-semibold text-brand">404</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Property not found</h1>
        <p className="mt-3 text-muted">
          This listing may have been removed or the link may be incorrect.
        </p>
        <Link
          href="/properties"
          className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-brand px-5 font-semibold text-white hover:bg-brand-hover"
        >
          Browse properties
        </Link>
      </main>
    </>
  );
}

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-md px-4 py-12">
        <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">
            Log in to manage listings and contact owners.
          </p>
          <div className="mt-6">
            <AuthForm mode="login" />
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            New to Nestora?{" "}
            <Link
              href="/register"
              className="font-semibold text-brand hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

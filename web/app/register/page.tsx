import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-md px-4 py-12">
        <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-muted">
            Post a property or contact an owner.
          </p>
          <div className="mt-6">
            <AuthForm mode="register" />
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

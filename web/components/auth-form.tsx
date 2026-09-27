"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    try {
      if (mode === "login") await signIn(email, password);
      else
        await signUp(
          String(form.get("name") ?? ""),
          email,
          password,
          String(form.get("phone") ?? ""),
        );
      router.push(mode === "login" ? "/properties" : "/dashboard");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to continue.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {mode === "register" ? (
        <label className="block text-sm font-semibold text-ink">
          Name
          <input
            name="name"
            required
            minLength={2}
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
      ) : null}
      <label className="block text-sm font-semibold text-ink">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </label>
      {mode === "register" ? (
        <label className="block text-sm font-semibold text-ink">
          Phone (optional)
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          <span className="mt-1 block text-xs font-normal text-muted">
            10 digits, numbers only.
          </span>
        </label>
      ) : null}
      <label className="block text-sm font-semibold text-ink">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        {mode === "register" ? (
          <span className="mt-1 block text-xs font-normal text-muted">
            Use at least 8 characters.
          </span>
        ) : null}
      </label>
      {error ? (
        <p
          role="alert"
          className="rounded-sm bg-danger-subtle p-3 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}
      <button
        disabled={submitting}
        className="min-h-11 w-full rounded-sm bg-brand px-4 font-semibold text-white hover:bg-brand-hover disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {submitting
          ? "Please wait..."
          : mode === "login"
            ? "Log in"
            : "Create account"}
      </button>
    </form>
  );
}

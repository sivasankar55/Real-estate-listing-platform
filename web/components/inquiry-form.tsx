"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const { accessToken } = useAuth();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(
        `${apiUrl}/api/properties/${propertyId}/inquiries`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.get("name"),
            phone: form.get("phone"),
            message: form.get("message"),
            website: form.get("website"),
          }),
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(result?.error?.message ?? "Could not send inquiry.");
      setSent(true);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not send inquiry.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  if (sent)
    return (
      <p
        className="rounded-sm bg-brand-subtle p-4 text-sm font-semibold text-brand"
        role="status"
      >
        Inquiry sent. The owner can now contact you.
      </p>
    );
  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <label className="block text-sm font-semibold text-ink">
        Name
        <input
          name="name"
          required
          minLength={2}
          className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </label>
      <label className="block text-sm font-semibold text-ink">
        Phone
        <input
          name="phone"
          required
          inputMode="numeric"
          maxLength={10}
          className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <span className="mt-1 block text-xs font-normal text-muted">
          10 digits, numbers only.
        </span>
      </label>
      <label className="block text-sm font-semibold text-ink">
        Message
        <textarea
          name="message"
          required
          minLength={10}
          rows={4}
          className="mt-1 w-full rounded-sm border border-line px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </label>
      <label className="hidden" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {message ? (
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      ) : null}
      <button
        disabled={submitting}
        className="min-h-11 w-full rounded-sm bg-brand px-4 font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send inquiry"}
      </button>
    </form>
  );
}

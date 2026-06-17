"use client";

import { useState, useTransition } from "react";
import { submitBreakthroughCall } from "./actions";

export function BookingForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handle(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitBreakthroughCall(formData);
      if (result.ok && result.redirectTo) {
        window.location.href = result.redirectTo;
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form action={handle} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First name" name="firstName" required />
        <Field label="Last name" name="lastName" required />
      </div>
      <Field label="City" name="city" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="State" name="state" />
        <Field label="ZIP" name="zip" inputMode="numeric" />
      </div>
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone" name="phone" type="tel" inputMode="tel" />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-y text-paper font-display text-xl px-6 py-3 rounded-md hover:bg-ink transition-colors disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Continue to Book My Call →"}
      </button>
      <p className="text-xs opacity-60 text-center">
        After you submit, you&apos;ll go straight to Krystalore&apos;s calendar to pick a time.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  inputMode?: "numeric" | "tel";
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-display text-base mb-1.5">
        {label}
        {required && <span className="text-brand-y"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        inputMode={inputMode}
        className="w-full border-2 border-ink/20 focus:border-ink rounded-md px-4 py-3 bg-paper outline-none"
      />
    </div>
  );
}

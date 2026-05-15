"use client";

import { useState, useTransition } from "react";
import { submitLead } from "./actions";
import { Shyft } from "@/components/brand/Shyft";

interface LeadFormProps {
  affiliateRef: string | null;
}

export function LeadForm({ affiliateRef }: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handle(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitLead(formData);
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.error || "Something went wrong. Try again.");
      }
    });
  }

  if (submitted) {
    return (
      <div className="p-8 border-2 border-brand-teal rounded-xl bg-brand-teal/10">
        <h2 className="font-display text-3xl md:text-4xl mb-3">
          <Shyft>You&apos;re in. Now what?</Shyft>
        </h2>
        <p className="opacity-85 mb-6 text-lg">
          <Shyft>
            We received your info. Your next step: join the membership, or book a free call if
            you want to talk first.
          </Shyft>
        </p>
        <div className="flex gap-3 flex-wrap">
          <a
            href="/mastery/membership"
            className="inline-block bg-brand-y text-paper font-display text-lg px-6 py-3 rounded-md hover:bg-ink transition-colors"
          >
            <Shyft>Join Now — $497/month</Shyft>
          </a>
          <a
            href="/doctor/book"
            className="inline-block border-2 border-ink text-ink font-display text-lg px-6 py-3 rounded-md hover:bg-ink hover:text-paper transition-colors"
          >
            <Shyft>Book a Free Call Instead</Shyft>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={handle} className="space-y-5 max-w-lg">
      {affiliateRef && <input type="hidden" name="ref" value={affiliateRef} />}
      <Field label="Your Name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone (optional)" name="phone" type="tel" />
      <div>
        <label htmlFor="message" className="block font-display text-lg mb-1.5">
          <Shyft>What brought you here?</Shyft>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full border-2 border-ink/20 focus:border-ink rounded-md px-4 py-3 bg-paper outline-none"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-brand-y text-paper font-display text-xl px-8 py-4 rounded-md hover:bg-ink transition-colors disabled:opacity-50"
      >
        <Shyft>{isPending ? "Sending..." : "Send It"}</Shyft>
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-display text-lg mb-1.5">
        <Shyft>{label}</Shyft>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full border-2 border-ink/20 focus:border-ink rounded-md px-4 py-3 bg-paper outline-none"
      />
    </div>
  );
}

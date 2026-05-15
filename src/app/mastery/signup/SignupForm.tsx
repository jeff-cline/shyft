"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shyft } from "@/components/brand/Shyft";
import { signupAction } from "./actions";

export function SignupForm({
  prefilledEmail,
  prefilledName,
}: {
  prefilledEmail?: string;
  prefilledName?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handle(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signupAction(formData);
      if (result.ok) {
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setError(result.error || "Signup failed.");
      }
    });
  }

  return (
    <form action={handle} className="space-y-4">
      <Field label="Your Name" name="name" defaultValue={prefilledName ?? ""} required />
      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={prefilledEmail ?? ""}
        required
      />
      <Field label="Password" name="password" type="password" required />
      <Field label="Confirm Password" name="confirm" type="password" required />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-y text-paper font-display text-xl px-6 py-3 rounded-md hover:bg-ink transition-colors disabled:opacity-50"
      >
        <Shyft>{isPending ? "Creating..." : "Create Account"}</Shyft>
      </button>
      <div className="text-sm opacity-75 pt-2">
        <Link href="/mastery/login" className="hover:text-brand-y">
          <Shyft>Already have an account? Log in</Shyft>
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-display text-base mb-1.5">
        <Shyft>{label}</Shyft>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full border-2 border-ink/20 focus:border-ink rounded-md px-4 py-3 bg-paper outline-none"
      />
    </div>
  );
}

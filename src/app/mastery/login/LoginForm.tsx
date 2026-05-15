"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shyft } from "@/components/brand/Shyft";
import { loginAction } from "./actions";

export function LoginForm({
  callbackUrl,
  initialError,
}: {
  callbackUrl?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [isPending, startTransition] = useTransition();

  function handle(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.ok) {
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setError(result.error || "Login failed.");
      }
    });
  }

  return (
    <form action={handle} className="space-y-4">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-y text-paper font-display text-xl px-6 py-3 rounded-md hover:bg-ink transition-colors disabled:opacity-50"
      >
        <Shyft>{isPending ? "Signing in..." : "Sign In"}</Shyft>
      </button>
      <div className="text-sm opacity-75 pt-2 flex justify-between">
        <Link href="/mastery/signup" className="hover:text-brand-y">
          <Shyft>Need an account? Sign up</Shyft>
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
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
        className="w-full border-2 border-ink/20 focus:border-ink rounded-md px-4 py-3 bg-paper outline-none"
      />
    </div>
  );
}

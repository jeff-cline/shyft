"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Shyft } from "@/components/brand/Shyft";
import { forceResetAction } from "./actions";

export function ForceResetForm() {
  const router = useRouter();
  const { update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handle(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await forceResetAction(formData);
      if (result.ok) {
        await update();
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setError(result.error || "Could not reset password.");
      }
    });
  }

  return (
    <form action={handle} className="space-y-4">
      <Field label="New Password" name="password" type="password" required />
      <Field label="Confirm New Password" name="confirm" type="password" required />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-y text-paper font-display text-xl px-6 py-3 rounded-md hover:bg-ink transition-colors disabled:opacity-50"
      >
        <Shyft>{isPending ? "Saving..." : "Set Password"}</Shyft>
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
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

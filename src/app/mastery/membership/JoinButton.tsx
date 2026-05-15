"use client";

import { useState, useTransition } from "react";
import { Shyft } from "@/components/brand/Shyft";

export function JoinButton({
  tierKey,
  prefilledEmail,
  prefilledName,
}: {
  tierKey: string;
  prefilledEmail: string;
  prefilledName: string;
}) {
  const [email, setEmail] = useState(prefilledEmail);
  const [name, setName] = useState(prefilledName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function join() {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierKey, email: email.trim().toLowerCase(), name: name.trim() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Could not start checkout.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full border border-ink/20 rounded px-3 py-3 bg-paper outline-none focus:border-ink"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full border border-ink/20 rounded px-3 py-3 bg-paper outline-none focus:border-ink"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        onClick={join}
        disabled={isPending || !email.trim()}
        className="w-full bg-brand-y text-paper font-display text-xl px-6 py-4 rounded-md hover:bg-ink transition-colors disabled:opacity-50"
      >
        <Shyft>{isPending ? "Starting checkout..." : "Join Now"}</Shyft>
      </button>
    </div>
  );
}

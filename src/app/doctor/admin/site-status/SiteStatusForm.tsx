"use client";

import { useState, useTransition } from "react";
import { setDoctorLive } from "./actions";

export function SiteStatusForm({ initialLive }: { initialLive: boolean }) {
  const [live, setLive] = useState(initialLive);
  const [pending, start] = useTransition();

  function flip(next: boolean) {
    const msg = next
      ? "Go LIVE as shYft Doctor? shyftdoctor.com becomes public and shyftmaster.com will start redirecting here."
      : "Return to lockdown (in training)? shyftdoctor.com locks down and shyftmaster.com becomes the public site again.";
    if (!confirm(msg)) return;
    start(async () => {
      await setDoctorLive(next);
      setLive(next);
    });
  }

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-md border-2 ${live ? "border-brand-y bg-brand-y/10" : "border-ink/20 bg-paper"}`}>
        <div className="font-display text-2xl mb-1">
          {live ? "🎓 GRADUATED — shyftdoctor.com is public" : "🔒 IN TRAINING — locked down"}
        </div>
        <p className="opacity-70 text-sm">
          {live
            ? "Consumers see shyftdoctor.com. shyftmaster.com redirects here (301) preserving SEO."
            : "shyftdoctor.com shows the in-training gate. Ads run to shyftmaster.com."}
        </p>
      </div>
      <button
        disabled={pending}
        onClick={() => flip(!live)}
        className="bg-brand-y text-paper font-display text-xl px-6 py-3 rounded-md hover:bg-ink transition-colors disabled:opacity-50"
      >
        {pending ? "Saving…" : live ? "Return to Lockdown" : "Graduate → Go Live as Doctor"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Shyft } from "@/components/brand/Shyft";

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={link}
        className="flex-1 border border-ink/20 rounded px-3 py-2 bg-paper font-mono text-sm"
        onFocus={(e) => e.currentTarget.select()}
      />
      <button
        type="button"
        onClick={copy}
        className="bg-ink text-paper font-display px-4 py-2 rounded-md hover:bg-brand-y transition-colors"
      >
        <Shyft>{copied ? "Copied!" : "Copy"}</Shyft>
      </button>
    </div>
  );
}

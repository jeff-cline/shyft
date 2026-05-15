"use client";

import { useState, useTransition } from "react";
import { Shyft } from "@/components/brand/Shyft";
import { saveSettings } from "./actions";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [state, setState] = useState<Record<string, string>>(initial);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function set(key: string, value: string) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      await saveSettings(state);
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  return (
    <div className="space-y-8">
      <Section title="Booking">
        <TextField
          label="Booking iframe URL"
          help="Pasted from Calendly / Acuity / GHL / etc. Shown on /book pages."
          value={state.booking_iframe_url || ""}
          onChange={(v) => set("booking_iframe_url", v)}
        />
      </Section>

      <Section title="Payments (Stripe)">
        <ToggleField
          label="Payments Enabled"
          help="Off until you've set keys and Price IDs."
          checked={state.payments_enabled === "true"}
          onChange={(v) => set("payments_enabled", v ? "true" : "false")}
        />
        <TextField
          label="Stripe Publishable Key (pk_...)"
          value={state.stripe_pk || ""}
          onChange={(v) => set("stripe_pk", v)}
        />
        <TextField
          label="Stripe Secret Key (sk_...)"
          help="Stored server-side. Never exposed to the browser."
          value={state.stripe_sk || ""}
          onChange={(v) => set("stripe_sk", v)}
          masked
        />
        <TextField label="Mastery Price ID ($497/mo)" value={state.price_mastery_id || ""} onChange={(v) => set("price_mastery_id", v)} />
        <TextField label="Fitness Price ID ($99/mo)" value={state.price_fitness_id || ""} onChange={(v) => set("price_fitness_id", v)} />
        <TextField label="Private Price ID ($3,000/mo)" value={state.price_private_id || ""} onChange={(v) => set("price_private_id", v)} />
        <TextField label="Retreat Price ID ($7,500/yr)" value={state.price_retreat_id || ""} onChange={(v) => set("price_retreat_id", v)} />
      </Section>

      <Section title="Brand">
        <TextField
          label="Brand Y Color (hex)"
          help="The orange Y treatment. Leave at #D2691E unless you've picked a different shade."
          value={state.brand_y_hex || ""}
          onChange={(v) => set("brand_y_hex", v)}
        />
        <TextField
          label="Logo URL"
          help="Optional. Once set, replaces the placeholder app-wide."
          value={state.logo_url || ""}
          onChange={(v) => set("logo_url", v)}
        />
      </Section>

      <div className="flex items-center justify-between">
        <span className="text-sm opacity-60">
          {isPending ? "Saving..." : savedAt ? `Saved at ${savedAt}` : ""}
        </span>
        <button
          onClick={save}
          disabled={isPending}
          className="bg-brand-y text-paper font-display text-xl px-6 py-3 rounded-md hover:bg-ink transition-colors disabled:opacity-50"
        >
          <Shyft>{isPending ? "Saving..." : "Save All"}</Shyft>
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl">
        <Shyft>{title}</Shyft>
      </h2>
      <div className="space-y-3 p-4 border border-ink/10 rounded-md bg-paper">{children}</div>
    </section>
  );
}

function TextField({
  label,
  help,
  value,
  onChange,
  masked,
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  masked?: boolean;
}) {
  return (
    <div>
      <label className="block font-display text-base mb-1">
        <Shyft>{label}</Shyft>
      </label>
      <input
        type={masked ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
      />
      {help && <p className="text-xs opacity-60 mt-1">{help}</p>}
    </div>
  );
}

function ToggleField({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="font-display">
          <Shyft>{label}</Shyft>
        </div>
        {help && <p className="text-xs opacity-60 mt-1">{help}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-brand-y" : "bg-ink/20"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-paper transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

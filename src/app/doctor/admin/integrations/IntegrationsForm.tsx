"use client";

import { useState, useTransition } from "react";
import { Shyft } from "@/components/brand/Shyft";
import { saveIntegrations } from "./actions";

export function IntegrationsForm({ initial }: { initial: Record<string, string> }) {
  const [state, setState] = useState<Record<string, string>>(initial);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function set(key: string, value: string) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      await saveIntegrations(state);
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  return (
    <div className="space-y-8">
      <Section title="Leads → GoHighLevel">
        <Instructions>
          GoHighLevel → <strong>Automation → Workflows → Create Workflow</strong> → add the{" "}
          <strong>“Inbound Webhook”</strong> trigger → copy its URL and paste it below. In the
          workflow, map the incoming fields <code>email</code>, <code>firstName</code>,{" "}
          <code>lastName</code>, <code>phone</code>, and <code>tags</code> onto the contact, then
          add your drip/email actions. Every new lead captured on the site POSTs here
          automatically — no code needed.
        </Instructions>
        <TextField
          label="GHL Inbound Webhook URL"
          help="Looks like https://services.leadconnectorhq.com/hooks/.../webhook-trigger/..."
          value={state.ghl_inbound_webhook_url || ""}
          onChange={(v) => set("ghl_inbound_webhook_url", v)}
        />
      </Section>

      <Section title="Google Tracking">
        <Instructions>
          <strong>GA4:</strong> Google Analytics → Admin → Data Streams → your stream → copy the
          Measurement ID (<code>G-XXXXXXX</code>).{" "}
          <strong>Google Ads:</strong> Tools → Conversions → set up a conversion → copy the tag ID
          (<code>AW-XXXXXXXXX</code>) and the conversion label. Tags fire site-wide the moment you
          Save — no redeploy.
        </Instructions>
        <TextField
          label="GA4 Measurement ID"
          help="G-XXXXXXX"
          value={state.ga4_measurement_id || ""}
          onChange={(v) => set("ga4_measurement_id", v)}
        />
        <TextField
          label="Google Ads ID"
          help="AW-XXXXXXXXX"
          value={state.google_ads_id || ""}
          onChange={(v) => set("google_ads_id", v)}
        />
        <TextField
          label="Google Ads Conversion Label"
          help="From the conversion action's tag setup. Used when wiring conversion events."
          value={state.google_ads_conversion_label || ""}
          onChange={(v) => set("google_ads_conversion_label", v)}
        />
        <TextAreaField
          label="Extra <head> tracking snippet (optional)"
          help="Any additional pixel/tag HTML or JS. Injected site-wide. Leave blank if unused."
          value={state.head_tracking_snippet || ""}
          onChange={(v) => set("head_tracking_snippet", v)}
        />
      </Section>

      <Section title="Dynamic Keyword Headline (DKI)">
        <Instructions>
          Make the home H1 echo the exact phrase someone searched on Google. In Google Ads, set the
          campaign/ad <strong>Final URL suffix</strong> or <strong>Tracking template</strong> to
          append <code>?kw=&#123;keyword&#125;</code> (Google’s ValueTrack fills in the matched
          keyword). Turn the toggle on below. When a visitor arrives via that ad, the first line of
          the hero H1 becomes their keyword; when there’s no keyword, it falls back to the default
          line below (or the normal headline if that’s blank). This lifts conversion by matching the
          ad’s promise.
        </Instructions>
        <ToggleField
          label="Enable Dynamic Keyword Insertion"
          checked={state.dki_enabled === "true"}
          onChange={(v) => set("dki_enabled", v ? "true" : "false")}
        />
        <TextField
          label="Default H1 first line (fallback)"
          help="Shown when DKI is on but no keyword is passed. Leave blank to use the normal headline."
          value={state.dki_default_h1 || ""}
          onChange={(v) => set("dki_default_h1", v)}
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

function Instructions({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm opacity-80 leading-relaxed border-l-4 border-brand-y pl-3 [&_code]:bg-ink/10 [&_code]:px-1 [&_code]:rounded">
      {children}
    </div>
  );
}

function TextField({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block font-display text-base mb-1">
        <Shyft>{label}</Shyft>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
      />
      {help && <p className="text-xs opacity-60 mt-1">{help}</p>}
    </div>
  );
}

function TextAreaField({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block font-display text-base mb-1">
        <Shyft>{label}</Shyft>
      </label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink font-mono text-sm"
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

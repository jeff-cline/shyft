"use client";

import { useState, useTransition } from "react";
import { Shyft } from "@/components/brand/Shyft";
import { TIERS } from "@/lib/tiers";
import { updateUserControls } from "./actions";

interface Initial {
  role: string;
  status: string;
  currentTier: string;
  paid: boolean;
  upgradeShowMastery: boolean;
  upgradeShowPrivate: boolean;
  upgradeShowRetreat: boolean;
  upgradeShowFitness: boolean;
}

const STATUS_OPTIONS: Array<{ value: string; label: string; tone: string }> = [
  { value: "lead", label: "Lead", tone: "text-brand-coral" },
  { value: "prospect", label: "Prospect", tone: "text-brand-y" },
  { value: "customer", label: "Customer", tone: "text-brand-teal" },
  { value: "lost", label: "Lost", tone: "opacity-50" },
];

export function UserControls({ userId, initial }: { userId: string; initial: Initial }) {
  const [state, setState] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setState((s) => ({ ...s, [key]: value }));
    startTransition(async () => {
      await updateUserControls(userId, { ...state, [key]: value });
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  const statusTone =
    STATUS_OPTIONS.find((s) => s.value === state.status)?.tone ?? "";

  return (
    <section className="grid md:grid-cols-2 gap-6 p-6 border border-ink/10 rounded-md bg-paper">
      <div>
        <h3 className="font-display text-xl mb-3">
          <Shyft>Status</Shyft>
        </h3>

        <div className="space-y-3">
          <Row label="Funnel Status">
            <select
              value={state.status}
              onChange={(e) => set("status", e.target.value)}
              className={`border border-ink/20 rounded px-2 py-1 bg-paper font-display ${statusTone}`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Role (permissions)">
            <select
              value={state.role}
              onChange={(e) => set("role", e.target.value)}
              className="border border-ink/20 rounded px-2 py-1 bg-paper"
            >
              <option value="customer">customer</option>
              <option value="affiliate">affiliate</option>
              <option value="admin">admin</option>
            </select>
          </Row>
          <Row label="Current Tier">
            <select
              value={state.currentTier}
              onChange={(e) => set("currentTier", e.target.value)}
              className="border border-ink/20 rounded px-2 py-1 bg-paper"
            >
              {Object.values(TIERS).map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Paid (unlock dashboard)">
            <Toggle checked={state.paid} onChange={(v) => set("paid", v)} />
          </Row>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl mb-3">
          <Shyft>Offers Visible to This User</Shyft>
        </h3>
        <p className="text-sm opacity-70 mb-3">
          <Shyft>
            Flip a switch on to show that offer in the user&apos;s dashboard hero. Off by
            default — guide them manually.
          </Shyft>
        </p>
        <div className="space-y-3">
          <Row label={`Mastery (${TIERS.mastery.priceLabel}) — main`}>
            <Toggle
              checked={state.upgradeShowMastery}
              onChange={(v) => set("upgradeShowMastery", v)}
            />
          </Row>
          <Row label={`Private Client (${TIERS.private.priceLabel})`}>
            <Toggle
              checked={state.upgradeShowPrivate}
              onChange={(v) => set("upgradeShowPrivate", v)}
            />
          </Row>
          <Row label={`Annual Retreat (${TIERS.retreat.priceLabel})`}>
            <Toggle
              checked={state.upgradeShowRetreat}
              onChange={(v) => set("upgradeShowRetreat", v)}
            />
          </Row>
          <Row label={`Fitness (${TIERS.fitness.priceLabel}) — downsell`}>
            <Toggle
              checked={state.upgradeShowFitness}
              onChange={(v) => set("upgradeShowFitness", v)}
            />
          </Row>
        </div>
      </div>

      <div className="md:col-span-2 text-xs opacity-60">
        {isPending ? "Saving..." : savedAt ? `Last saved ${savedAt}` : "All changes auto-save."}
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
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
  );
}

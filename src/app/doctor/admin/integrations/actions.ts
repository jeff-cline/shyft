"use server";

import { randomBytes } from "node:crypto";
import { requireAdmin } from "@/lib/auth-helpers";
import { setSetting } from "@/lib/settings";

export async function saveIntegrations(values: Record<string, string>) {
  await requireAdmin();
  for (const [k, v] of Object.entries(values)) await setSetting(k, v ?? "");
  return { ok: true };
}

/** Generate, store, and return a fresh Lead API key. */
export async function generateLeadApiKey() {
  await requireAdmin();
  const key = "shyft_" + randomBytes(24).toString("hex");
  await setSetting("lead_api_key", key);
  return { ok: true, key };
}

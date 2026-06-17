"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { setSetting } from "@/lib/settings";

export async function saveIntegrations(values: Record<string, string>) {
  await requireAdmin();
  for (const [k, v] of Object.entries(values)) await setSetting(k, v ?? "");
  return { ok: true };
}

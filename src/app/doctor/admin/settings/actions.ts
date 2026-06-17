"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { setSetting } from "@/lib/settings";

export async function saveSettings(settings: Record<string, string>) {
  await requireAdmin();
  for (const [key, value] of Object.entries(settings)) {
    await setSetting(key, value ?? "");
  }
  return { ok: true };
}

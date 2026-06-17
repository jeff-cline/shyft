"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { setSetting, getSetting } from "@/lib/settings";

export async function setDoctorLive(live: boolean) {
  await requireAdmin();
  await setSetting("doctor_live", live ? "true" : "false");
  return { ok: true, live };
}

export async function getDoctorLive() {
  return (await getSetting("doctor_live")) === "true";
}

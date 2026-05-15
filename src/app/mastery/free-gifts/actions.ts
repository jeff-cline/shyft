"use server";

import { cookies } from "next/headers";
import { createLead } from "@/lib/leads";

export interface ClaimResult {
  ok: boolean;
  error?: string;
}

export async function claimGifts(formData: FormData): Promise<ClaimResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const ref = String(formData.get("ref") || "").trim();

  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "That email doesn't look right." };
  }

  try {
    await createLead({
      name,
      email,
      phone: phone || undefined,
      message: "Claimed free gifts bundle",
      affiliateRef: ref || undefined,
      source: "free_gifts",
    });
  } catch {
    return { ok: false, error: "Could not save your info. Try again." };
  }

  // Set a cookie so refresh keeps the gifts unlocked. 30 days.
  const cookieStore = await cookies();
  cookieStore.set("shyft_gifts_unlocked", "1", {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });

  return { ok: true };
}

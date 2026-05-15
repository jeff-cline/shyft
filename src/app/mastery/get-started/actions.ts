"use server";

import { redirect } from "next/navigation";
import { createLead } from "@/lib/leads";

export interface SubmitLeadResult {
  ok: boolean;
  error?: string;
}

export async function submitLead(formData: FormData): Promise<SubmitLeadResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();
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
      message: message || undefined,
      affiliateRef: ref || undefined,
      source: ref ? "affiliate_ref" : "mastery_form",
    });
  } catch {
    return { ok: false, error: "Could not save your info. Please try again." };
  }

  // Pass through to membership with email pre-filled
  const params = new URLSearchParams({ email, name });
  redirect(`/mastery/membership?${params.toString()}`);
}

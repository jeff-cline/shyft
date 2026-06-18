"use server";

import { createLead } from "@/lib/leads";
import { getSetting } from "@/lib/settings";

export interface BookingResult {
  ok: boolean;
  error?: string;
  redirectTo?: string;
}

const BOOKING_FALLBACK = "https://krystalore.com/book";

export async function submitBreakthroughCall(formData: FormData): Promise<BookingResult> {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const zip = String(formData.get("zip") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();

  if (!firstName || !lastName || !email) {
    return { ok: false, error: "First name, last name, and email are required." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "That email doesn't look right." };
  }

  const name = `${firstName} ${lastName}`.trim();
  const location = [city, state, zip].filter(Boolean).join(", ");
  const message = `Free Breakthrough Call request${location ? ` — ${location}` : ""}`;

  // 1. CRM (also forwards to GoHighLevel)
  await createLead({
    name,
    email,
    phone: phone || undefined,
    message,
    source: "Free Breakthrough Call",
  });

  // 2. Redirect to the real booking page (lead notification is handled centrally by createLead).
  const redirectTo = (await getSetting("booking_iframe_url"))?.trim() || BOOKING_FALLBACK;
  return { ok: true, redirectTo };
}

export interface LeadLike {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  source?: string | null;
  affiliateRef?: string | null;
}

/** Shape posted to a GoHighLevel inbound webhook for one lead. */
export function buildGhlPayload(lead: LeadLike) {
  const [firstName, ...rest] = (lead.name || "").trim().split(/\s+/);
  return {
    firstName: firstName || lead.name || "",
    lastName: rest.join(" "),
    email: lead.email,
    phone: lead.phone || undefined,
    tags: ["shyft-lead", `source:${lead.source || "unknown"}`],
    customField: { message: lead.message || "", affiliateRef: lead.affiliateRef || "" },
  };
}

/**
 * Fire-and-forget POST to the configured GHL inbound webhook. Never throws — a failed
 * forward must not break lead capture. Settings imported lazily to keep this module's
 * static graph free of Prisma for unit tests.
 */
export async function forwardLeadToGHL(lead: LeadLike): Promise<void> {
  try {
    const { getSetting } = await import("@/lib/settings");
    const url = await getSetting("ghl_inbound_webhook_url");
    if (!url) return;
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildGhlPayload(lead)),
    });
  } catch (err) {
    console.error("[GHL] lead forward failed:", err);
  }
}

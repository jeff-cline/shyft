import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { createLead } from "@/lib/leads";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * Public lead-intake endpoint for external sites.
 * Auth: `x-api-key` header (or `api_key` body field) must match the `lead_api_key`
 * configured in admin → Integrations. On success, runs the same createLead() pipeline
 * used by the on-site forms, which auto-forwards the lead to GoHighLevel.
 */
export async function POST(req: NextRequest) {
  const configuredKey = (await getSetting("lead_api_key"))?.trim();
  if (!configuredKey) {
    return NextResponse.json(
      { ok: false, error: "Lead API is not enabled. Set a Lead API Key in admin → Integrations." },
      { status: 503, headers: CORS }
    );
  }

  // Parse JSON or form-encoded body
  let data: Record<string, unknown> = {};
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      data = await req.json();
    } else {
      const form = await req.formData();
      data = Object.fromEntries(form.entries());
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not parse request body. Send JSON or form-encoded fields." },
      { status: 400, headers: CORS }
    );
  }

  const providedKey = (req.headers.get("x-api-key") || String(data.api_key || "")).trim();
  if (providedKey !== configuredKey) {
    return NextResponse.json(
      { ok: false, error: "Invalid or missing API key." },
      { status: 401, headers: CORS }
    );
  }

  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const phone = String(data.phone || "").trim();
  const message = String(data.message || "").trim();
  const source = String(data.source || "api").trim();

  if (!name || !email) {
    return NextResponse.json(
      { ok: false, error: "Both `name` and `email` are required." },
      { status: 422, headers: CORS }
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "`email` is not a valid email address." },
      { status: 422, headers: CORS }
    );
  }

  try {
    const { lead } = await createLead({
      name,
      email,
      phone: phone || undefined,
      message: message || undefined,
      source,
    });
    const forwardedToGHL = Boolean((await getSetting("ghl_inbound_webhook_url"))?.trim());
    return NextResponse.json(
      { ok: true, leadId: lead.id, forwardedToGHL },
      { status: 201, headers: CORS }
    );
  } catch (err) {
    console.error("[api/leads] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error creating lead." },
      { status: 500, headers: CORS }
    );
  }
}

import { getSettings } from "@/lib/settings";
import { sendViaZapmail, zapmailConfigured } from "@/lib/zapmail";

const DEFAULT_RECIPIENTS = "krystalore@thecrewscoach.com,jeff.cline@me.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Send a notification to the configured recipients via Zapmail (app.zapmail.ai) —
 * the same sender used across Jeff's other sites. Best-effort: returns false (never
 * throws) if Zapmail isn't configured or the send fails, so callers don't break.
 */
export async function sendNotificationEmail(subject: string, text: string): Promise<boolean> {
  const s = await getSettings(["notify_emails"]);
  const recipients = (s.notify_emails || DEFAULT_RECIPIENTS)
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  if (recipients.length === 0) return false;
  if (!zapmailConfigured()) {
    console.warn("[email] ZAPMAIL_API_KEY not set — skipping notification");
    return false;
  }

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#0a0a0a;line-height:1.6">
    <pre style="font-family:inherit;white-space:pre-wrap;margin:0">${escapeHtml(text)}</pre>
  </div>`;

  try {
    return await sendViaZapmail({
      to: recipients.join(", "),
      subject,
      html,
      fromName: "The shYft Master",
    });
  } catch (err) {
    console.error("[email] zapmail send failed:", err);
    return false;
  }
}

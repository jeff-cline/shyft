import nodemailer from 'nodemailer'

/**
 * Zapmail (app.zapmail.ai) — default transactional email sender across Jeff's sites.
 * Zapmail provisions Google/Microsoft mailboxes; its API lists each mailbox WITH its
 * app password, and we send over plain SMTP (user = mailbox email, pass = app password).
 *
 * Config is ENV-only (never commit the key — repos may be public):
 *   ZAPMAIL_API_KEY   (required to enable)
 *   ZAPMAIL_FROM_NAME (optional display name; defaults to "Krystalore")
 *   ZAPMAIL_FROM      (optional: force a specific mailbox address to send from)
 *
 * Admin override: a future settings store can supply these per-tenant; until then
 * the env var is the single source of truth.
 */
const BASE = 'https://api.zapmail.ai/api/v2'
const SMTP: Record<string, { host: string; port: number }> = {
  GOOGLE: { host: 'smtp.gmail.com', port: 465 },
  MICROSOFT: { host: 'smtp.office365.com', port: 587 },
}

type Mailbox = { email: string; pass: string; provider: 'GOOGLE' | 'MICROSOFT' }
let cached: { mb: Mailbox; at: number } | null = null

export function zapmailConfigured(): boolean {
  return !!process.env.ZAPMAIL_API_KEY
}

async function zm(path: string, key: string, ws: string | null, provider = 'GOOGLE'): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'x-auth-zapmail': key,
      ...(ws ? { 'x-workspace-key': ws } : {}),
      'x-service-provider': provider,
    },
  })
  if (!res.ok) throw new Error(`Zapmail API ${res.status}`)
  return res.json()
}

async function resolveMailbox(key: string): Promise<Mailbox | null> {
  if (cached && Date.now() - cached.at < 30 * 60_000) return cached.mb
  const ws = (await zm('/workspaces', key, null))?.data?.currentWorkspace?.id ?? null
  const forced = (process.env.ZAPMAIL_FROM || '').trim().toLowerCase()
  for (const provider of ['GOOGLE', 'MICROSOFT'] as const) {
    const l = await zm('/mailboxes/list', key, ws, provider).catch(() => null)
    const all: any[] = []
    for (const d of l?.data?.domains ?? []) for (const m of d.mailboxes ?? []) {
      if (String(m.email || '').includes('@')) all.push(m)
    }
    const pick =
      (forced && all.find((m) => String(m.email).toLowerCase() === forced)) ||
      all.find((m) => m.isWarmedUp) ||
      all[0]
    if (pick) {
      const mb: Mailbox = {
        email: String(pick.email).toLowerCase(),
        pass: String(pick.appPassword || '').replace(/\s+/g, ''),
        provider,
      }
      cached = { mb, at: Date.now() }
      return mb
    }
  }
  return null
}

/** Returns true if sent, false if Zapmail isn't configured/available (caller can fall back). */
export async function sendViaZapmail(msg: {
  to: string
  subject: string
  html: string
  fromName?: string
}): Promise<boolean> {
  const key = process.env.ZAPMAIL_API_KEY
  if (!key) return false
  const mb = await resolveMailbox(key)
  if (!mb) return false
  const s = SMTP[mb.provider]
  const transport = nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.port === 465,
    auth: { user: mb.email, pass: mb.pass },
  })
  await transport.sendMail({
    from: `"${msg.fromName || process.env.ZAPMAIL_FROM_NAME || 'Krystalore'}" <${mb.email}>`,
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
  })
  return true
}

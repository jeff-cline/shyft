# shYft Doctor Hub — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Turn shyftdoctor.com into a keyword-attributed lead-gen backend: capture which Google keyword produced each lead, join leads to Stripe enrollments (dollars), let the admin paste all Google credentials + connect via OAuth, sync per-keyword ad spend, and show Cost-per-Lead / Cost-per-Enroll down to the keyword.

**Architecture:** First-touch attribution cookie set on the marketing landing captures `kw/gclid/campaign/utm`; `createLead` and Stripe checkout persist it on `Lead` + `User`. A new `AdSpend` table holds spend per (date, campaign, keyword) from manual entry or the Google Ads API. Pure aggregation joins spend + leads + enrollments → CPL/CPE. Google Ads connects via the admin's own OAuth client (client id/secret/dev-token/customer-id pasted in the panel) with a refresh token stored server-side; a lean REST client runs GAQL.

**Tech Stack:** Next.js 15, Prisma, Stripe (existing), Google Ads API v17 over REST + OAuth2 (no heavy SDK), `node:test` for pure logic.

**Spec:** `docs/superpowers/specs/2026-06-17-shyftdoctor-hub-phase2-design.md`

**Defaults taken on the spec's open questions (proceeding per "start building"):**
1. CPE enrollment = first time `User.paid` becomes true (Stripe active). Revenue per enroll = the tier's `priceCents` from `tiers.ts`.
2. Manual spend entry supports both campaign- and keyword-level rows; API fills keyword-level.
3. I prep the Google Ads dev-token application text; Jeff submits it (it's tied to his MCC).

---

## Task 1: Schema — AdSpend, attribution columns, settings

**Files:** Modify `prisma/schema.prisma`, `prisma/seed.ts`

- [ ] **Step 1: Add attribution columns to `Lead` and `User`** in `schema.prisma`:
On `model Lead`, after `affiliateRef`:
```prisma
  adKeyword       String?
  adCampaign      String?
  gclid           String?
```
On `model User`, after `leadSource`:
```prisma
  adKeyword           String?
  adCampaign          String?
  gclid               String?
```

- [ ] **Step 2: Add the `AdSpend` model** at the end of `schema.prisma`:
```prisma
model AdSpend {
  id          String   @id @default(cuid())
  date        DateTime
  campaign    String   @default("")
  keyword     String   @default("")
  amountCents Int      @default(0)
  clicks      Int      @default(0)
  source      String   @default("manual") // manual | google_ads_api
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([date, campaign, keyword, source])
  @@index([date])
}
```

- [ ] **Step 3: Add settings defaults** in `prisma/seed.ts` `defaults` object:
```ts
    google_ads_developer_token: "",
    google_ads_oauth_client_id: "",
    google_ads_oauth_client_secret: "",
    google_ads_customer_id: "",
    google_ads_login_customer_id: "",
    google_ads_oauth_refresh_token: "",
    google_ads_cron_secret: "",
```

- [ ] **Step 4: Push + seed.**
Run: `npm run db:push && SEED_ADMIN_PASSWORD=TEMP!234 npm run db:seed`
Expected: succeeds; new columns/table created.

- [ ] **Step 5: Commit.**
```bash
git add prisma/schema.prisma prisma/seed.ts
git commit -m "feat(db): AdSpend table + keyword attribution columns + google ads settings"
```

---

## Task 2: First-touch attribution capture

**Files:** Create `src/lib/attribution.ts`, `src/lib/attribution.test.ts`, `src/components/site/AttributionTracker.tsx`; Modify `src/lib/leads.ts`, `src/lib/leads.ts` callers, `src/app/api/stripe/checkout/route.ts`, marketing layouts.

- [ ] **Step 1: Test `src/lib/attribution.test.ts` (failing).**
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAttribution, ATTRIBUTION_COOKIE } from "./attribution";

test("parses known ad params", () => {
  const a = parseAttribution(new URLSearchParams("kw=life+coach&gclid=abc&utm_campaign=brand"));
  assert.equal(a.adKeyword, "life coach");
  assert.equal(a.gclid, "abc");
  assert.equal(a.adCampaign, "brand");
});
test("returns nulls when absent", () => {
  const a = parseAttribution(new URLSearchParams(""));
  assert.equal(a.adKeyword, null);
  assert.equal(a.gclid, null);
  assert.equal(a.adCampaign, null);
});
test("cookie name is stable", () => {
  assert.equal(ATTRIBUTION_COOKIE, "shyft_attrib");
});
```

- [ ] **Step 2: Run — fail.** `node --import tsx --test src/lib/attribution.test.ts`

- [ ] **Step 3: Write `src/lib/attribution.ts`.**
```ts
export const ATTRIBUTION_COOKIE = "shyft_attrib";

export interface Attribution {
  adKeyword: string | null;
  adCampaign: string | null;
  gclid: string | null;
}

export function parseAttribution(params: URLSearchParams): Attribution {
  const kw = params.get("kw") || params.get("keyword");
  const campaign = params.get("utm_campaign") || params.get("campaign");
  const gclid = params.get("gclid");
  const clean = (v: string | null) => {
    if (!v) return null;
    const t = v.replace(/[<>]/g, "").trim().slice(0, 120);
    return t.length ? t : null;
  };
  return { adKeyword: clean(kw), adCampaign: clean(campaign), gclid: clean(gclid) };
}

export function hasAttribution(a: Attribution): boolean {
  return Boolean(a.adKeyword || a.adCampaign || a.gclid);
}

export function serializeAttribution(a: Attribution): string {
  return JSON.stringify(a);
}

export function deserializeAttribution(raw: string | undefined | null): Attribution {
  if (!raw) return { adKeyword: null, adCampaign: null, gclid: null };
  try {
    const o = JSON.parse(raw);
    return { adKeyword: o.adKeyword ?? null, adCampaign: o.adCampaign ?? null, gclid: o.gclid ?? null };
  } catch {
    return { adKeyword: null, adCampaign: null, gclid: null };
  }
}
```

- [ ] **Step 4: Run — pass.** `node --import tsx --test src/lib/attribution.test.ts`

- [ ] **Step 5: Client `src/components/site/AttributionTracker.tsx`.** First-touch: only writes if not already set.
```tsx
"use client";
import { useEffect } from "react";

export function AttributionTracker() {
  useEffect(() => {
    if (document.cookie.includes("shyft_attrib=")) return;
    const p = new URLSearchParams(window.location.search);
    const kw = p.get("kw") || p.get("keyword");
    const campaign = p.get("utm_campaign") || p.get("campaign");
    const gclid = p.get("gclid");
    if (!kw && !campaign && !gclid) return;
    const val = encodeURIComponent(
      JSON.stringify({ adKeyword: kw, adCampaign: campaign, gclid })
    );
    document.cookie = `shyft_attrib=${val}; max-age=2592000; path=/; samesite=lax`;
  }, []);
  return null;
}
```

- [ ] **Step 6: Mount it** in `src/app/doctor/(site)/layout.tsx` and `src/app/master/layout.tsx` (add `<AttributionTracker />` inside the fragment).

- [ ] **Step 7: Read the cookie in `createLead`.** In `src/lib/leads.ts`, add an optional `attribution` field to `LeadInput` (`adKeyword?`, `adCampaign?`, `gclid?`), persist on both the `user` create/update and the `lead` create, and pass it to `forwardLeadToGHL`. In `src/app/mastery/get-started/actions.ts` (and any other `createLead` caller), read the cookie server-side via `cookies()` and deserialize:
```ts
import { cookies } from "next/headers";
import { ATTRIBUTION_COOKIE, deserializeAttribution } from "@/lib/attribution";
// inside the action, before createLead:
const attrib = deserializeAttribution((await cookies()).get(ATTRIBUTION_COOKIE)?.value);
// pass ...attrib into createLead({ ... , adKeyword: attrib.adKeyword ?? undefined, ... })
```

- [ ] **Step 8: Persist attribution on Stripe checkout.** In `src/app/api/stripe/checkout/route.ts`, when creating/finding the user, read the same cookie and set `adKeyword/adCampaign/gclid` on the user if empty. (Stripe metadata already carries userId, so enrollment joins back to the user's keyword.)

- [ ] **Step 9: Typecheck + build.** `npm run typecheck && npm run build`

- [ ] **Step 10: Commit.**
```bash
git add -A
git commit -m "feat(attribution): first-touch keyword capture on leads + enrollments"
```

---

## Task 3: Acquisition aggregation (pure)

**Files:** Create `src/lib/acquisition.ts`, `src/lib/acquisition.test.ts`

- [ ] **Step 1: Test (failing) `src/lib/acquisition.test.ts`.**
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateByKeyword } from "./acquisition";

test("computes CPL and CPE per keyword", () => {
  const rows = aggregateByKeyword({
    spend: [{ keyword: "life coach", campaign: "brand", amountCents: 10000, clicks: 50 }],
    leads: [{ adKeyword: "life coach" }, { adKeyword: "life coach" }],
    enrollments: [{ adKeyword: "life coach", revenueCents: 49700 }],
  });
  const r = rows.find((x) => x.keyword === "life coach")!;
  assert.equal(r.leads, 2);
  assert.equal(r.enrollments, 1);
  assert.equal(r.spendCents, 10000);
  assert.equal(r.cplCents, 5000);     // 10000 / 2
  assert.equal(r.cpeCents, 10000);    // 10000 / 1
  assert.equal(r.revenueCents, 49700);
});

test("handles zero leads/enrolls without dividing by zero", () => {
  const rows = aggregateByKeyword({
    spend: [{ keyword: "cold", campaign: "x", amountCents: 5000, clicks: 10 }],
    leads: [], enrollments: [],
  });
  const r = rows.find((x) => x.keyword === "cold")!;
  assert.equal(r.cplCents, null);
  assert.equal(r.cpeCents, null);
});
```

- [ ] **Step 2: Run — fail.**

- [ ] **Step 3: Write `src/lib/acquisition.ts`.**
```ts
export interface SpendRow { keyword: string; campaign: string; amountCents: number; clicks: number; }
export interface LeadRow { adKeyword: string | null | undefined; }
export interface EnrollRow { adKeyword: string | null | undefined; revenueCents: number; }
export interface KeywordMetrics {
  keyword: string; spendCents: number; clicks: number;
  leads: number; enrollments: number; revenueCents: number;
  cplCents: number | null; cpeCents: number | null;
}

export function aggregateByKeyword(input: {
  spend: SpendRow[]; leads: LeadRow[]; enrollments: EnrollRow[];
}): KeywordMetrics[] {
  const map = new Map<string, KeywordMetrics>();
  const get = (kw: string) => {
    const key = kw || "(none)";
    if (!map.has(key))
      map.set(key, { keyword: key, spendCents: 0, clicks: 0, leads: 0, enrollments: 0, revenueCents: 0, cplCents: null, cpeCents: null });
    return map.get(key)!;
  };
  for (const s of input.spend) { const m = get(s.keyword); m.spendCents += s.amountCents; m.clicks += s.clicks; }
  for (const l of input.leads) get(l.adKeyword || "(none)").leads += 1;
  for (const e of input.enrollments) { const m = get(e.adKeyword || "(none)"); m.enrollments += 1; m.revenueCents += e.revenueCents; }
  for (const m of map.values()) {
    m.cplCents = m.leads > 0 ? Math.round(m.spendCents / m.leads) : null;
    m.cpeCents = m.enrollments > 0 ? Math.round(m.spendCents / m.enrollments) : null;
  }
  return [...map.values()].sort((a, b) => b.spendCents - a.spendCents);
}
```

- [ ] **Step 4: Run — pass.**

- [ ] **Step 5: Commit.**
```bash
git add src/lib/acquisition.ts src/lib/acquisition.test.ts
git commit -m "feat(acquisition): per-keyword CPL/CPE aggregation"
```

---

## Task 4: Acquisition dashboard page

**Files:** Create `src/lib/acquisition-data.ts` (DB queries), `src/app/doctor/admin/dashboard/page.tsx`, `DashboardTable.tsx`; Modify `AdminNav.tsx` (add "Dashboard").

- [ ] **Step 1: `src/lib/acquisition-data.ts`** — pull leads, enrollments (paid users → tier price), and spend in a date range, then call `aggregateByKeyword`.
```ts
import { prisma } from "@/lib/db";
import { TIERS, tierFromString } from "@/lib/tiers";
import { aggregateByKeyword } from "@/lib/acquisition";

export async function getAcquisition(since: Date, until: Date) {
  const [leads, paidUsers, spend] = await Promise.all([
    prisma.lead.findMany({ where: { createdAt: { gte: since, lte: until } }, select: { adKeyword: true } }),
    prisma.user.findMany({ where: { paid: true, updatedAt: { gte: since, lte: until } }, select: { adKeyword: true, currentTier: true } }),
    prisma.adSpend.findMany({ where: { date: { gte: since, lte: until } } }),
  ]);
  const enrollments = paidUsers.map((u) => ({
    adKeyword: u.adKeyword,
    revenueCents: TIERS[tierFromString(u.currentTier)].priceCents,
  }));
  const spendRows = spend.map((s) => ({ keyword: s.keyword, campaign: s.campaign, amountCents: s.amountCents, clicks: s.clicks }));
  const rows = aggregateByKeyword({ spend: spendRows, leads, enrollments });
  const totals = rows.reduce((t, r) => ({
    spendCents: t.spendCents + r.spendCents, leads: t.leads + r.leads,
    enrollments: t.enrollments + r.enrollments, revenueCents: t.revenueCents + r.revenueCents,
  }), { spendCents: 0, leads: 0, enrollments: 0, revenueCents: 0 });
  return { rows, totals };
}
```

- [ ] **Step 2: `page.tsx`** — default range last 30 days (accept `?from=&to=`), render totals (CPL = spend/leads, CPE = spend/enroll, revenue, ROAS = revenue/spend) + `<DashboardTable rows={rows} />`. Use `export const dynamic = "force-dynamic"`.

- [ ] **Step 3: `DashboardTable.tsx`** (client) — sortable table: Keyword | Spend | Clicks | Leads | Enrolls | Revenue | CPL | CPE. Format cents via `(c/100).toLocaleString(undefined,{style:'currency',currency:'USD'})`. Include a "Download CSV" button building a blob from rows.

- [ ] **Step 4: Add `{ href: "/doctor/admin/dashboard", label: "Dashboard" }`** to `AdminNav` items (after Overview).

- [ ] **Step 5: Typecheck + build.**

- [ ] **Step 6: Commit.**
```bash
git add -A
git commit -m "feat(dashboard): keyword CPL/CPE acquisition dashboard"
```

---

## Task 5: Manual spend entry + CSV import

**Files:** Create `src/app/doctor/admin/dashboard/spend/{page.tsx,SpendForm.tsx,actions.ts}`

- [ ] **Step 1: `actions.ts`** — `addSpend({date, campaign, keyword, amountCents, clicks})` and `importSpendCsv(text)` (parse Google Ads CSV: Day, Campaign, Keyword, Cost, Clicks). Upsert into `AdSpend` keyed by `(date, campaign, keyword, source:"manual")`. Guard with `requireAdmin()`.

- [ ] **Step 2: `SpendForm.tsx`** (client) — single-row add form + a textarea for CSV paste; calls the actions; shows saved confirmation.

- [ ] **Step 3: `page.tsx`** — renders the form with instructions: "Google Ads → Campaigns → Keywords → Download → CSV; paste here, or enter daily spend by hand."

- [ ] **Step 4: Typecheck + build. Commit.**
```bash
git add -A
git commit -m "feat(dashboard): manual + CSV ad-spend entry"
```

---

## Task 6: Google Ads credentials + OAuth connect

**Files:** Modify `IntegrationsForm.tsx`/`page.tsx` (Google Ads section); Create `src/lib/google-ads-oauth.ts`, `src/app/api/google-ads/oauth/start/route.ts`, `src/app/api/google-ads/oauth/callback/route.ts`

- [ ] **Step 1: Add a "Google Ads API" section** to the integrations panel with fields: `google_ads_developer_token`, `google_ads_oauth_client_id`, `google_ads_oauth_client_secret` (masked), `google_ads_customer_id`, `google_ads_login_customer_id`. Inline instructions:
  > 1. In Google Cloud Console create an OAuth 2.0 **Web application** client. Add redirect URI `https://shyftdoctor.com/api/google-ads/oauth/callback`. Paste its Client ID + Secret here.
  > 2. In Google Ads → Admin → API Center, copy your **Developer token** (apply for Basic access — approval can take days/weeks).
  > 3. Customer ID = your Ads account (10 digits, no dashes). Login Customer ID = your MCC if you use one.
  > 4. Save, then click **Connect Google Ads** to authorize.
Add a **Connect Google Ads** button linking to `/api/google-ads/oauth/start`, and show "Connected ✓" when `google_ads_oauth_refresh_token` is set.

- [ ] **Step 2: `src/lib/google-ads-oauth.ts`** — build the consent URL and exchange code→tokens.
```ts
import { getSetting, setSetting } from "@/lib/settings";

const SCOPE = "https://www.googleapis.com/auth/adwords";
const REDIRECT_PATH = "/api/google-ads/oauth/callback";

export async function buildConsentUrl(origin: string): Promise<string | null> {
  const clientId = await getSetting("google_ads_oauth_client_id");
  if (!clientId) return null;
  const p = new URLSearchParams({
    client_id: clientId, redirect_uri: `${origin}${REDIRECT_PATH}`,
    response_type: "code", scope: SCOPE, access_type: "offline", prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

export async function exchangeCode(origin: string, code: string): Promise<boolean> {
  const clientId = await getSetting("google_ads_oauth_client_id");
  const clientSecret = await getSetting("google_ads_oauth_client_secret");
  if (!clientId || !clientSecret) return false;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: `${origin}${REDIRECT_PATH}`, grant_type: "authorization_code",
    }),
  });
  if (!res.ok) return false;
  const json = await res.json();
  if (json.refresh_token) { await setSetting("google_ads_oauth_refresh_token", json.refresh_token); return true; }
  return false;
}

export async function getAccessToken(): Promise<string | null> {
  const [clientId, clientSecret, refreshToken] = await Promise.all([
    getSetting("google_ads_oauth_client_id"), getSetting("google_ads_oauth_client_secret"),
    getSetting("google_ads_oauth_refresh_token"),
  ]);
  if (!clientId || !clientSecret || !refreshToken) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
  });
  if (!res.ok) return null;
  return (await res.json()).access_token ?? null;
}
```

- [ ] **Step 3: `start/route.ts`** — `requireAdmin()`, then `redirect(await buildConsentUrl(req.nextUrl.origin))` (or back to integrations with an error if no client id).

- [ ] **Step 4: `callback/route.ts`** — `requireAdmin()`, read `code`, call `exchangeCode`, redirect to `/doctor/admin/integrations?gads=connected|failed`.

- [ ] **Step 5: Typecheck + build. Commit.**
```bash
git add -A
git commit -m "feat(google-ads): credentials panel + OAuth connect flow"
```

---

## Task 7: Google Ads spend sync (GAQL over REST)

**Files:** Create `src/lib/google-ads.ts`, `src/app/api/google-ads/sync/route.ts`; Modify the dashboard to show last-sync + a "Sync now" button.

- [ ] **Step 1: `src/lib/google-ads.ts`** — run a GAQL query for keyword spend over a date range, upsert into `AdSpend` with `source:"google_ads_api"`.
```ts
import { getSetting } from "@/lib/settings";
import { getAccessToken } from "@/lib/google-ads-oauth";
import { prisma } from "@/lib/db";

export async function syncGoogleAdsSpend(sinceISO: string, untilISO: string): Promise<{ ok: boolean; rows: number; error?: string }> {
  const token = await getAccessToken();
  const [dev, cid, login] = await Promise.all([
    getSetting("google_ads_developer_token"), getSetting("google_ads_customer_id"), getSetting("google_ads_login_customer_id"),
  ]);
  if (!token || !dev || !cid) return { ok: false, rows: 0, error: "Google Ads not fully configured/connected." };
  const query = `SELECT segments.date, campaign.name, ad_group_criterion.keyword.text, metrics.cost_micros, metrics.clicks
    FROM keyword_view WHERE segments.date BETWEEN '${sinceISO}' AND '${untilISO}'`;
  const res = await fetch(`https://googleads.googleapis.com/v17/customers/${cid}/googleAds:searchStream`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`, "developer-token": dev,
      ...(login ? { "login-customer-id": login } : {}), "content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) return { ok: false, rows: 0, error: `Ads API ${res.status}: ${await res.text()}` };
  const batches = await res.json();
  let count = 0;
  for (const batch of batches) {
    for (const row of batch.results ?? []) {
      const date = new Date(row.segments.date);
      const campaign = row.campaign?.name ?? "";
      const keyword = row.adGroupCriterion?.keyword?.text ?? "";
      const amountCents = Math.round(Number(row.metrics?.costMicros ?? 0) / 10000);
      const clicks = Number(row.metrics?.clicks ?? 0);
      await prisma.adSpend.upsert({
        where: { date_campaign_keyword_source: { date, campaign, keyword, source: "google_ads_api" } },
        update: { amountCents, clicks },
        create: { date, campaign, keyword, amountCents, clicks, source: "google_ads_api" },
      });
      count++;
    }
  }
  return { ok: true, rows: count };
}
```
Note: the `where` compound name is Prisma's `@@unique([date,campaign,keyword,source])` accessor `date_campaign_keyword_source`.

- [ ] **Step 2: `sync/route.ts`** — allow either `requireAdmin()` (button) OR a matching `?secret=` equal to `google_ads_cron_secret` (cron). Default range last 30 days. Return JSON `{ok, rows, error}`.

- [ ] **Step 3: Add a "Sync now" button** on the dashboard calling the route; show result. Document the cron URL `https://shyftdoctor.com/api/google-ads/sync?secret=...` for Hermes to schedule daily.

- [ ] **Step 4: Typecheck + build. Commit.**
```bash
git add -A
git commit -m "feat(google-ads): GAQL spend sync + on-demand/cron route"
```

---

## Task 8: Verify + merge

- [ ] **Step 1: Gate.** `node --import tsx --test src/lib/*.test.ts && npm run typecheck && npm run build` — all green.
- [ ] **Step 2: Manual checks.** Submit a lead with `?kw=life+coach` set → Lead row has `adKeyword`. Dashboard shows it under "life coach" with CPL once a manual spend row is added. Integrations shows the Google Ads section + Connect button; with no client id, Connect redirects back with an error (no crash).
- [ ] **Step 3: Merge to main + push.**
```bash
git checkout main && git merge --no-ff feat/shyftdoctor-hub-phase2 -m "feat: shYft Doctor hub Phase 2 (keyword acquisition + Google Ads)" && git push origin main
```
- [ ] **Step 4: Hand off:** the Google Cloud OAuth client redirect URI, the dev-token application note, and the daily sync cron URL.

---

## Self-Review

- **Spec coverage:** Stage A dashboard (Tasks 3-5) + attribution (Task 2) + credentials/OAuth (Task 6) + live API sync (Task 7) + schema (Task 1). Covered.
- **Type consistency:** `parseAttribution`/`deserializeAttribution`, `aggregateByKeyword`, `getAcquisition`, `getAccessToken`, `syncGoogleAdsSpend` consistent across tasks.
- **Known risk:** Google Ads API version (`v17`) and field casing (`costMicros` vs `cost_micros` in REST JSON) — REST returns camelCase; verified in Task 7 mapping. Dev-token approval is external and gates live sync only; manual spend keeps the dashboard useful meanwhile.

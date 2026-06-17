# shYft Doctor Hub — Phase 2 Design (Acquisition Dashboard + Google Ads)

**Date:** 2026-06-17
**Status:** Draft for review (Phase 1 shipped). Build after Jeff/Krystalore review.
**Depends on:** Phase 1 (`2026-06-17-shyftdoctor-hub-design.md`) — the integration panel,
`Setting` table, `Lead`/`User`/`Subscription` models, and GA4/Ads tags are already live.

---

## 1. Goal

Give Krystalore a backend dashboard at `shyftdoctor.com/doctor/admin/dashboard` that shows, in
near-real-time, what each marketing dollar buys:

- **Cost per Lead (CPL)** = ad spend ÷ leads, overall and per keyword/campaign.
- **Cost per Enroll (CPE)** = ad spend ÷ paid enrollments, overall and per keyword/campaign.
- A keyword-level table: spend, clicks, leads, enrolls, CPL, CPE, conversion rate.

This connects the money side (Google Ads spend) to the outcome side (leads + Stripe enrollments
already in our DB), so she can see which keywords actually produce paying clients — not just clicks.

---

## 2. The core challenge & the two-stage approach

"Real-time cost down to the keyword" requires the **Google Ads API**, which needs a **developer
token** that Google approves manually (often 1–6 weeks) plus OAuth. We don't want to block the
dashboard on that. So Phase 2 ships in two stages:

### Stage A — Dashboard live now (manual + attributed)
- **Attribution we already own:** every `Lead`/`User` carries a `leadSource`; we extend lead
  capture to also persist the **click's keyword + campaign + gclid** (from the `?kw=`/`?gclid=`
  URL params the ads already pass for DKI). Stripe webhooks already tell us who paid → enrollments.
  So **leads and enrollments are attributable to keyword from day one**, with zero Google API.
- **Spend entered manually:** a small admin form to enter ad spend per campaign/keyword per day
  (or paste a Google Ads CSV export). Combined with our attributed leads/enrolls → real CPL/CPE.
- This gives a working dashboard immediately while the dev token is pending.

### Stage B — Live Google Ads API (drop-in, after token approval)
- Admin connects their Google Ads account via OAuth from the integration panel.
- A scheduled sync pulls spend + clicks per keyword/campaign daily (and on-demand refresh).
- The manual-spend form becomes a fallback/override. No dashboard rework — Stage A already defined
  the data shape; Stage B just replaces the spend source.

---

## 3. Data model additions

```prisma
model AdSpend {
  id         String   @id @default(cuid())
  date       DateTime              // day bucket
  campaign   String   @default("")
  keyword    String   @default("")
  amountCents Int                   // spend in cents
  clicks     Int      @default(0)
  source     String   @default("manual") // manual | google_ads_api
  createdAt  DateTime @default(now())
  @@index([date, campaign, keyword])
}

// Lead gains attribution columns (also mirror onto User for enrollment join):
// Lead.adKeyword   String?
// Lead.adCampaign  String?
// Lead.gclid       String?
```

`AdSpend` is upserted by (date, campaign, keyword, source). Leads/enrollments are grouped by the
same (campaign, keyword) keys to compute CPL/CPE. New setting keys:
`google_ads_developer_token`, `google_ads_customer_id`, `google_ads_oauth_refresh_token`,
`google_ads_login_customer_id`.

---

## 4. Components

- `src/lib/attribution.ts` — extract `{ kw, gclid, campaign }` from request params; pure +
  unit-tested. Lead capture (`createLead`) persists these.
- `src/lib/acquisition.ts` — pure aggregation: given spend rows + leads + enrollments, compute
  overall and per-keyword CPL/CPE/conversion. Unit-tested with fixtures (no DB).
- `src/app/doctor/admin/dashboard/page.tsx` + client table — renders the metrics; date-range
  filter; CSV export.
- `src/app/doctor/admin/dashboard/spend/` — manual spend entry + Google Ads CSV import.
- `src/lib/google-ads.ts` (Stage B) — OAuth exchange + GAQL query for keyword spend; a daily
  sync route (`/api/google-ads/sync`) guarded by a cron secret.
- Integration panel gains a "Connect Google Ads" OAuth button + developer-token field.

---

## 5. Out of scope

- Multi-touch attribution / view-through. Phase 2 is last-click by keyword (matches Google Ads).
- Facebook/other ad networks (the same `AdSpend` shape can absorb them later via `source`).

---

## 6. Success criteria

1. Dashboard shows overall CPL and CPE from real attributed leads/enrolls + entered spend.
2. Per-keyword table sorts by spend/CPL/CPE and exports to CSV.
3. New leads persist keyword/campaign/gclid; Stripe enrollments join back to keyword.
4. Stage B: connecting Google Ads auto-populates `AdSpend` daily; manual entry becomes override.

---

## 7. Open questions for Jeff/Krystalore

1. **Enrollment definition for CPE** — count a "paid enrollment" as the first successful Stripe
   payment (`Subscription.status = active`), or first invoice paid? (Recommend: first active.)
2. **Spend granularity now** — will you enter spend per *keyword*, or per *campaign* and let us
   distribute by clicks? (Recommend: per campaign now; per keyword once the API lands.)
3. **Who owns the Google Ads dev-token application** — you, or should I prep the application text
   and account settings for you to submit? (Recommend: I prep, you submit — it's tied to your MCC.)

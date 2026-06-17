# shYft Doctor Hub — Phase 1 Design

**Date:** 2026-06-17
**Status:** Approved (brainstorming) → ready for implementation plan
**Scope:** Phase 1 (Foundation + drop-in integration panel). Phase 2 (acquisition-cost
dashboard + live Google Ads API) is a separate spec, written after ads are running.

---

## 1. Goal & Mental Model

There are **three domains**, all served by this one Next.js app via host-routing. Everything
is managed from **one admin/CRM that lives on shyftdoctor.com**.

| Domain | Role | Treatment in this work |
|---|---|---|
| **shyftdoctor.com** | The real main site **and** the backend (admin, CRM, leads, tracking, integrations). Where Jeff and Krystalore log in. | Becomes the hub. Its home is the canonical marketing home. Currently in **lockdown** (in training). |
| **shyftmaster.com** *(no "y")* | **New.** Structural duplicate of the shyftdoctor home, branded "Shyftmaster" (her name until she earns her Doctorate). **Paid ads point here now.** | Add host-routing + a `/master` route that renders the shared home with the "Shyftmaster" name. |
| **shyftmastery.com** *(with "y")* | Pre-existing, separate ad-buy funnel for a different flow (the `/mastery/*` membership pages). | **Do not touch its pages.** It only loses ownership of the admin (which moves to shyftdoctor). |

Krystalore is finishing a Doctorate. Until she graduates she is "Shyftmaster," and
**shyftmaster.com is the live consumer site** taking ad traffic while **shyftdoctor.com is
locked down**. When she graduates, Jeff/Krystalore flip **one toggle** in the admin and the
public face moves to shyftdoctor.com; shyftmaster.com redirects into it, preserving SEO.

**Non-negotiables:** one control panel, one admin, one tracking pixel set — all on shyftdoctor.

---

## 2. Architecture

### 2.1 Shared marketing home
- Extract the current `/doctor` home into a shared `MarketingHome` component that takes a
  `brand` prop: `{ name: "shYft Doctor" | "Shyftmaster", domain }`.
- `/doctor/page.tsx` renders `MarketingHome` with the **Doctor** name.
- New `/master/page.tsx` (+ `/master/layout.tsx`) renders the **same** `MarketingHome` with
  the **Shyftmaster** name. Same sections, same copy, only the name token differs.
- Editing the shared home updates **both** domains simultaneously — there is no second copy
  to keep in sync.

### 2.2 Host routing (`src/middleware.ts`)
- Add `shyftmaster.com` / `www.shyftmaster.com` → rewrite to `/master/*`.
- Keep `shyftdoctor.com` → `/doctor/*` and `shyftmastery.com` → `/mastery/*` unchanged.
- Middleware stays a pure host→path rewrite. The ON/OFF and graduation logic does **not**
  live in middleware (edge runtime can't use Prisma); it lives in server layouts (§2.3).

### 2.3 The Doctor ON/OFF toggle ("lockdown" ↔ "graduated")
- New setting **`doctor_live`** (`"true"` | `"false"`, default **`"false"`** = in training).
- A single toggle in the admin flips it. Read it in the `/doctor` and `/master` **server
  layouts** via `getSetting("doctor_live")`.
- **OFF (in training) — default today:**
  - **shyftdoctor.com:** render the home, covered by a full-screen **lockdown overlay**:
    Krystalore's photo, headline "Doctor In Training," subtext "Please visit Shyftmaster
    while in progress," and an **Admin Login** link (→ the relocated admin login). The
    overlay blocks consumer interaction with the page beneath.
  - **shyftmaster.com:** fully live, no overlay. Receives the ad traffic.
- **ON (graduated):**
  - **shyftdoctor.com:** lockdown lifts; public site live. Show a one-time dismissible
    "She graduated 🎓" welcome banner (cookie-suppressed after dismiss).
  - **shyftmaster.com home (`/`):** show a branded **"Graduated — visit me at
    Shyftdoctor.com"** splash with Krystalore's photo, then auto-redirect to
    shyftdoctor.com after a few seconds (also sets `rel=canonical` to shyftdoctor).
  - **shyftmaster.com any other path:** server **301 permanent redirect** to the matching
    shyftdoctor.com path, so SEO link equity transfers cleanly.
- Photos: Krystalore's image referenced from `public/` (e.g. `public/krystalore.jpg`),
  placeholder committed until the real asset is dropped in.

### 2.4 Admin/CRM relocation to shyftdoctor
- Move the admin tree from `/mastery/admin/*` to **`/doctor/admin/*`** (settings, leads,
  users, admins, calendar, chat, videos) — same server actions and `requireAdmin()` gate.
- Add an **admin login + forced-reset** flow on the doctor domain:
  `/doctor/login`, `/doctor/force-reset`, `/doctor/logout`. The lockdown overlay's "Admin
  Login" link points here.
- Update `AdminNav`, post-login redirects, and `auth.ts` `pages.signIn` to the doctor paths.
- The shyftmastery **member-facing funnel** (`/mastery/get-started`, `/signup`, `/login`,
  `/dashboard`, `/free-gifts`, `/membership`, `/affiliate`) stays exactly as-is — only the
  admin leaves `/mastery`.

### 2.5 God accounts
- Both `jeff.cline@me.com` and `krystalore@crewsbeyondlimitsconsulting.com` seeded as
  `role: "admin"`, password **`TEMP!234`**, `mustResetPassword: true` → forced reset on first
  login (existing flow, now on the doctor domain). No real password stored in the repo.
- Make `TEMP!234` the seed default so `npm run db:seed` reproduces this without extra env.

### 2.6 Brand-Y, favicon, copy
- **Brand-Y:** On the doctor/master marketing site, keep the orange `Y` treatment **only in
  H1/H2/H3**. Remove `<Shyft>` wrappers and inline `<span className="brand-y">Y</span>` from
  body paragraphs / stat values / FAQ answers. Headings keep `<Shyft>`. shyftmastery pages
  untouched.
- **Favicon:** Replace `public/favicon.svg` with the big brand-Y glyph (Anton "Y" in
  `#D2691E`). Layout metadata already points at `/favicon.svg`.
- **Promise copy:** the home "Promise" stat changes from `"No script. No pitch."` to
  **`"shYft will happen, guaranteed!"`** (brand spelling).

### 2.7 Integration panel — `/doctor/admin/integrations` (drop-in ready)
All values are `Setting`-backed (the existing key/value table) so they can be pasted in
anytime and take effect immediately. Each block carries on-page setup instructions.

- **Go High Level lead forwarding**
  - Setting: `ghl_inbound_webhook_url`.
  - On every `createLead()`, if set, POST the lead JSON (name, email, phone, message,
    source, affiliateRef) to the webhook (fire-and-forget, failures logged not fatal).
  - Inline instructions: GHL → Automation → create Workflow → Inbound Webhook trigger →
    copy URL → paste here → map fields → leads drive the GHL drip.
- **Google tracking**
  - Settings: `ga4_measurement_id`, `google_ads_id`, `google_ads_conversion_label`, and a
    raw `head_tracking_snippet` escape hatch.
  - Injected site-wide via the root layout (gtag bootstrap when IDs present; raw snippet
    appended to `<head>`). Fires on shyftdoctor + shyftmaster as soon as saved.
- **Dynamic Keyword → H1 (DKI)**
  - Settings: `dki_enabled` (bool), `dki_default_h1` (fallback first line).
  - The keyword from the ad click (URL param, e.g. `?kw=` populated by Google ValueTrack
    `{keyword}`) is sanitized and rendered as the **first line of the home H1**; when absent
    or DKI off, the normal headline shows (no layout shift).
  - Inline instructions: in Google Ads set Final URL suffix / tracking template to pass
    `{keyword}` into `?kw=`, enable DKI here, preview behavior.

---

## 3. Data Model Changes

No new tables in Phase 1 — everything rides the existing `Setting` key/value table and the
existing `User` / `Lead` models. New setting keys:

```
doctor_live                 = "false"
ghl_inbound_webhook_url     = ""
ga4_measurement_id          = ""
google_ads_id               = ""
google_ads_conversion_label = ""
head_tracking_snippet       = ""
dki_enabled                 = "false"
dki_default_h1              = ""
```

Seeded with empty defaults (mirrors existing settings seeding).

---

## 4. Out of Scope (Phase 2, separate spec)

- Acquisition dashboard: Cost-per-Lead and Cost-per-Enroll (starts with manual ad-spend
  entry, then live data).
- Live Google Ads API: OAuth connect from the admin, developer-token approval, real-time
  keyword-level cost sync. The §2.7 panel is built so these drop in without rework.
- Any change to shyftmastery.com's funnel.

---

## 5. Success Criteria

1. Ads can point at **shyftmaster.com** and it serves the live, shyftmaster-branded home.
2. **shyftdoctor.com** is locked down with the in-training overlay + working admin login.
3. Flipping `doctor_live` ON makes shyftdoctor public and 301s/splashes shyftmaster into it.
4. Admin/CRM is fully usable at **shyftdoctor.com/doctor/admin**; both god accounts log in
   with `TEMP!234` and are forced to reset.
5. Integration panel saves GHL webhook, Google tracking IDs, and DKI settings; a test lead
   reaches GHL, tracking tags render, and a `?kw=` param flows into the H1.
6. Brand-Y appears only in headings on the marketing site; favicon is the brand-Y; Promise
   stat reads "shYft will happen, guaranteed!".

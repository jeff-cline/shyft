---
title: shYft MVP — Two-Domain Platform Design
date: 2026-05-15
status: implemented (MVP)
owner: jeff.cline@me.com
---

> **Stack change vs. original proposal:** The DB+Auth+Storage layer was swapped from Supabase to **Prisma + SQLite (dev) / Postgres (prod) + Auth.js (credentials, JWT)** so the app runs the moment you clone it with zero external account setup. Same data model. Switch to Postgres in production by changing `DATABASE_URL` and the `provider` in `prisma/schema.prisma`.


# shYft MVP — Design

## Vision

Two domains share one app:
- **shyftdoctor.com** — pure marketing lander. Two CTAs: "Free Consultation / Breakthrough Call" → `/book` (iframe), or "I'm Ready to shYft" → shyftmastery.com/get-started.
- **shyftmastery.com** — marketing lander + lead-capture funnel (`/get-started`) + the entire authenticated app (customer dashboard, admin/CRM, affiliate portal).

A single login governs both sites. Doctor.com's "Member Login" link redirects to mastery's login. No authenticated backend lives on Doctor.com.

Goal: ad-ready landers + a working customer/admin loop end-to-end (lead → account → payment → notes/videos/chat) on first ship. Iterate from there.

## Architecture

**Single Next.js 15 (App Router) deployment serving both domains via host-based middleware.**

```
Next.js app (one deploy, two hosts)
├── (doctor) routes      ← Host = shyftdoctor.com / www.shyftdoctor.com
│   ├── /                ← lander
│   └── /book            ← iframe of admin-supplied booking URL
└── (mastery) routes     ← Host = shyftmastery.com / www.shyftmastery.com
    ├── /                ← lander
    ├── /get-started     ← lead-capture form
    ├── /login, /signup, /forgot
    ├── /dashboard       ← authenticated customer (videos, notes, chat, calendar, upgrade tiles)
    ├── /admin           ← role=admin
    ├── /affiliate       ← role=affiliate
    └── /blog            ← Phase 2 placeholder route
```

Middleware (`middleware.ts`) inspects request `Host` header and rewrites to the correct route group.

### Stack

| Layer | Pick | Reason |
|---|---|---|
| Framework | Next.js 15 + TypeScript | One codebase, two domains, server actions for forms |
| Styling | Tailwind CSS + shadcn/ui | Admin tables/forms cheap; tokenized design system |
| DB + Auth + Storage | Supabase | Postgres + auth + file storage in one — fastest MVP path |
| Payments | Stripe (Subscriptions API) | Industry standard; admin-supplied PK/SK |
| Email | Resend | Transactional (lead notifications, password reset) |
| Hosting | Vercel (default) | Hermes-swappable — see open items |

## Multi-Domain Auth Strategy

Auth UI lives only on shyftmastery.com. Session cookie scoped to `.shyftmastery.com`. Doctor.com has no logged-in surface — its "Member Login" link redirects to mastery's `/login`. Functionally "same login works for both" without cross-domain cookie complexity.

True cross-domain SSO (logged-in name visible on Doctor.com nav) is a v2 feature. Punted unless explicitly required.

## Data Model (Supabase / Postgres)

- **users** — id, email, password_hash (via Supabase Auth), role (`admin` | `customer` | `affiliate`), must_reset_password, current_tier (`mastery` | `private` | `retreat` | `fitness` | `none`), tier_upgrade_visible_private (bool), tier_upgrade_visible_retreat (bool), tier_upgrade_visible_fitness (bool), created_at
- **leads** — id, name, email, phone, source (`doctor` | `mastery_form` | `affiliate_ref`), affiliate_id?, disposition (`new` | `contacted` | `booked` | `joined` | `lost`), created_at
- **notes** — id, target_user_id, author_id, body, visibility (`private_admin` | `public_to_user`), created_at, updated_at
- **chat_messages** — id, thread_user_id (the customer side of the thread), author_id, body, read_at, created_at
- **videos** — id, title, source_kind (`upload` | `external_url`), url_or_path, tier_required, sort_order
- **calendar_events** — id, title, description, starts_at, ends_at, tier_visibility (set of tiers), color_code
- **affiliates** — id, user_id, referral_code, payout_email, created_at
- **referrals** — id, affiliate_id, lead_id, became_customer_at?, commission_due_on (15th of month after became_customer + 30d), commission_paid_at?
- **subscriptions** — id, user_id, stripe_subscription_id, status, tier, current_period_end (mirrored from Stripe webhook)
- **settings** — key/value (booking_iframe_url, stripe_pk, stripe_sk_encrypted, payments_enabled, logo_url, brand_y_hex, etc.)

Row-level security on every table. Admins bypass; customers see own data; affiliates see own referrals only.

## MVP Feature Checklist

### Public surface
- [ ] Doctor.com lander: hero "SHYFT HAPPENS! Now what?", two CTAs, logo placeholder (top-left small + hero-block large transparent)
- [ ] Doctor.com `/book`: iframe of admin-supplied URL; fallback "scheduling coming online" if not configured
- [ ] Mastery.com lander: hero, soft-answer value prop, two CTAs (free consult → `/book` proxy, or join → `/get-started`)
- [ ] Mastery.com `/get-started`: lead-capture form (name, email, phone, "what brought you here" textarea), captures `?ref=<affiliate_code>` from URL, writes to `leads`, emails admin via Resend, redirects to membership signup
- [ ] Membership signup: shows $497/mo offer. If payments enabled → Stripe Checkout. If disabled → "We'll be in touch" + free consult fallback CTA.

### Authenticated customer dashboard
- [ ] Force password reset on first login (any user with `must_reset_password=true`)
- [ ] Hero tile area: shows upgrade/downgrade tiles only when admin-toggled per user (private $3k, retreat $7.5k/yr, fitness $99)
- [ ] Notes panel: timestamped public notes from admin, newest first
- [ ] Chat-back panel: reply to admin; threads scoped to one customer
- [ ] Video catalog: filtered by user's current_tier
- [ ] Public calendar view: filtered by user's current_tier, tier-coded colors
- [ ] Lock screen for unpaid users: shows "N notes waiting" + payment CTA + free consult fallback; no content access

### Admin dashboard
- [ ] Leads board: list + filter by disposition / source / affiliate; click to convert to user
- [ ] User detail view: notes (toggle public/private), tier setter, three upgrade-visibility toggles, manual subscription override
- [ ] Chat inbox: most-recent-first list of customers who messaged; click into thread
- [ ] Video manager: add via URL or upload (Supabase Storage), set tier, reorder
- [ ] Calendar manager: add event, multi-select tier visibility, color picker
- [ ] Settings: booking_iframe_url, Stripe PK/SK (masked inputs), payments-enabled toggle, logo upload, brand-Y color override, admin invite (add admin by email)

### Affiliate portal
- [ ] Login (same `/login`, role-routed to `/affiliate`)
- [ ] View-only dashboard: your referral code + link, referral list with status, commission due/paid columns
- [ ] No editing — view-only

### Auth + onboarding
- [ ] Email/password signup
- [ ] Password reset via email (Resend)
- [ ] Seed admin accounts on first deploy: `jeff.cline@me.com`, `krystalore@crewsbeyondlimitsconsulting.com` — passwords set via env var `SEED_ADMIN_PASSWORD` at first deploy only, `must_reset_password=true` so both must reset on first login

### Payments
- [ ] Stripe Subscriptions: $497/mo (mastery), $99/mo (fitness), $3000/mo (private), $7500/yr (retreat)
- [ ] Admin enters PK/SK in settings; SK stored encrypted at rest
- [ ] Toggle "Payments Enabled" gates all checkout flows
- [ ] Stripe webhook handler: subscription.created / updated / deleted → mirror to `subscriptions` table → unlock/lock dashboard
- [ ] Unpaid users land on lock screen; reactivate via Stripe Customer Portal link

## Deferred to Phase 2

- WordPress `/blog` (you flagged this yourself)
- Go High Level OAuth (you said "if quick, otherwise don't worry" — not quick to do well)
- True websocket real-time chat (MVP polls every 30s on dashboard)
- Rich retreat-tier features (MVP treats it as another tier flag)
- True cross-domain SSO (only needed if Doctor.com gets logged-in UI)
- Affiliate auto-payout (MVP shows due dates; payout still manual)

## Brand System

### The Y rule

Every rendered `y`/`Y` becomes `<span class="brand-y">Y</span>` — forced uppercase, bold, in `--brand-y-color`. Applied via a `<Shyft>` text wrapper component used in headings, hero copy, and body content app-wide.

**Default `--brand-y-color`:** `#D2691E` (close to the orange-Y reference in the source image). Admin can override in settings.

**Rendering examples (with the universal rule):**
- "Shyft Happens" → "Sh**Y**ft Happens"
- "your journey" → "**Y**our journe**Y**"
- "Krystalore" → "Kr**Y**stalore"

If "every Y" is too aggressive (i.e., you only wanted it in brand words like "shYft", "WHY", "shYftmastery"), redirect and I'll scope to a curated word list instead.

### Typography
- **Display** (headings, brand marks): Anton (free, Google Fonts) — heavy condensed sans, matches the "IDENTITY SHYFT" reference screenshot
- **Body**: Inter

### Colors (Tailwind tokens)
- `brand-y`: `#D2691E` (dark orange Y)
- `brand-coral`: `#FF6B5B` (coral/red of "IDENTITY SHYFT" reference)
- `brand-teal`: `#4ECDC4` (teal subtitle accent)
- `ink`: `#0F1419` (near-black body text)
- `paper`: `#FAFAF7` (warm off-white background)

### Favicon
Standalone bold `Y` in `--brand-y-color` on transparent background. Generated at build time so admin color override regenerates it.

### Logo
Placeholder until upload: dashed-bordered box reading `[ LOGO ]` in display font. Admin uploads via settings → replaces app-wide. Top-left nav (small) + hero block (large transparent block).

## Open Items / Assumptions I'm Making

Defaults below. Tell me to flip any of them.

1. **Hermes** = your deployment automation. Default target: **Vercel** (Next.js native). If Hermes uses Netlify / Cloudflare Pages / a VPS, say so and I'll adjust build config.
2. **Booking URL** = configured via admin Settings after first login. `/book` falls back to a "scheduling coming online" message until set.
3. **Every Y treatment** = applied to all rendered `y`/`Y` universally (including inside ordinary words).
4. **Real-time chat** = polled every 30s in MVP, not websockets.
5. **Membership flow** = lead form → Stripe Checkout when payments are on. When off → "We'll be in touch" + free-consult fallback.
6. **Affiliate commissions** = reporting only in MVP; actual payout is manual.
7. **TEMP password handling** = seed admin passwords come from an env var at first deploy (`SEED_ADMIN_PASSWORD`), force-reset on first login. The literal `TEMP!234` from your message is never committed to the repo.
8. **No real customer data in the repo.** All secrets (Stripe SK, Resend key, Supabase service role key) live in Vercel env, never in source.

## Testing Strategy

- **Vitest** for service-layer unit tests (lead creation, tier toggle logic, commission date math, Y-rule renderer)
- **Playwright** for E2E happy paths:
  - lead submission on `/get-started` (with and without `?ref=` affiliate tag)
  - signup + login + force-reset
  - admin toggles upgrade-visibility → customer dashboard shows the tile
  - Stripe Checkout (test mode) → webhook → dashboard unlocks
  - affiliate referral lands in affiliate portal
- RLS policies verified by tests that connect as each role and confirm allowed/denied reads

## Project Setup

- Repo: https://github.com/jeff-cline/shyft (empty — will scaffold under `/`)
- Local dir: `/Users/jeffcline/Desktop/shYft`
- Deploy: Hermes-managed push to live; auto-deploy on push to main

## What I Need From You

Nothing immediately. Everything that needs human input — booking URL, Stripe keys, logo file, brand-Y hex override, admin invites — is captured behind admin Settings and you'll provide it via the UI on first login. The build itself needs no external secrets to run locally.

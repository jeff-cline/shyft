# shYft

Two-domain platform: **shyftdoctor.com** (marketing lander) + **shyftmastery.com** (lander + program backend), one Next.js app, host-routed.

See `docs/superpowers/specs/2026-05-15-shyft-mvp-design.md` for the full design.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind v4 + custom brand tokens
- Prisma + SQLite (dev) / Postgres (prod — switch via `DATABASE_URL`)
- Auth.js v5 (credentials, JWT sessions)
- Stripe Subscriptions (admin-supplied keys)
- bcryptjs for password hashing

## Run locally

```bash
npm install
cp .env.example .env.local      # then edit to taste (or leave defaults)
npm run db:push                 # creates SQLite DB from prisma/schema.prisma
SEED_ADMIN_PASSWORD="TEMP!234" npm run db:seed  # seeds admins + default settings
npm run dev
```

Open **http://localhost:3000/** for a dev index linking to both sites.

### Seeded admin logins (force-reset on first sign-in)

- `jeff.cline@me.com`
- `krystalore@crewsbeyondlimitsconsulting.com`
- Password = whatever you set in `SEED_ADMIN_PASSWORD` (default suggested: `TEMP!234`)

Both accounts have `mustResetPassword=true` — first login routes to `/mastery/force-reset` where you set a real password.

### Reset the dev DB

```bash
npm run db:reset
```

## Routes (local preview)

| URL | Purpose |
|---|---|
| `/` | Dev index (links to both sites + login) |
| `/doctor` | shYft Doctor lander |
| `/doctor/book` | Free Breakthrough Call (iframe — set URL via admin Settings) |
| `/mastery` | shYft Mastery lander |
| `/mastery/get-started` | Lead capture form |
| `/mastery/signup` | Customer signup |
| `/mastery/login` | Login (all roles) |
| `/mastery/force-reset` | Forced password reset |
| `/mastery/membership` | $497/mo offer (Stripe Checkout when payments enabled) |
| `/mastery/dashboard` | Customer dashboard (notes, chat, videos, calendar, upgrade tiles, lock screen) |
| `/mastery/admin` | Admin chat inbox |
| `/mastery/admin/leads` | Lead pipeline |
| `/mastery/admin/users` | User list |
| `/mastery/admin/users/[id]` | User detail — tier/upgrade toggles, notes, chat |
| `/mastery/admin/videos` | Video catalog management |
| `/mastery/admin/calendar` | Public calendar management |
| `/mastery/admin/settings` | Booking URL, Stripe keys, payments toggle, brand color, logo |
| `/mastery/admin/admins` | Manage admin accounts |
| `/mastery/affiliate` | Affiliate referral dashboard |

## Production routing

`src/middleware.ts` inspects the `Host` header:
- `shyftdoctor.com` / `www.shyftdoctor.com` → rewrites to `/doctor/*`
- `shyftmastery.com` / `www.shyftmastery.com` → rewrites to `/mastery/*`

Set `NEXT_PUBLIC_DOCTOR_URL=https://shyftdoctor.com` and `NEXT_PUBLIC_MASTERY_URL=https://shyftmastery.com` in production so cross-domain links resolve to the right host.

## Deploy (Hermes)

This repo expects to be pushed to **https://github.com/jeff-cline/shyft** and deployed via Hermes (your automation). Here's what Hermes needs to do:

1. **Build**: `npm install && npm run build`
2. **Apply schema**: `npx prisma db push` (first deploy only, or whenever `schema.prisma` changes)
3. **Seed admins** (first deploy only): `npm run db:seed` with `SEED_ADMIN_PASSWORD` set to a real temp password
4. **Set environment variables** in the production host:
   - `DATABASE_URL` — Postgres URL for production (swap from SQLite). Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma` and re-push.
   - `AUTH_SECRET` — a strong random string (`openssl rand -base64 32`)
   - `AUTH_TRUST_HOST=true`
   - `NEXTAUTH_URL=https://shyftmastery.com`
   - `NEXT_PUBLIC_DOCTOR_URL=https://shyftdoctor.com`
   - `NEXT_PUBLIC_MASTERY_URL=https://shyftmastery.com`
   - `SEED_ADMIN_PASSWORD=...` (first deploy only)
5. **DNS**: both `shyftdoctor.com` and `shyftmastery.com` (apex + www) point to the same deployment.
6. **Stripe webhook**: once payments are enabled in admin Settings, the Stripe webhook URL is `https://shyftmastery.com/api/stripe/webhook`. Configure it in Stripe Dashboard, then paste the signing secret into the `stripe_webhook_secret` setting (add the row in Settings → Stripe section, or insert directly).

### What to tell Hermes (copy-paste)

> Pull from `https://github.com/jeff-cline/shyft` (main branch). On Next.js host (Vercel-compatible). Build with `npm install && npm run build`. After first deploy, run `npx prisma db push` and `npm run db:seed`. Set env vars `AUTH_SECRET`, `DATABASE_URL` (Postgres), `AUTH_TRUST_HOST=true`, `NEXTAUTH_URL=https://shyftmastery.com`, `NEXT_PUBLIC_DOCTOR_URL=https://shyftdoctor.com`, `NEXT_PUBLIC_MASTERY_URL=https://shyftmastery.com`, `SEED_ADMIN_PASSWORD=<temp>` (first deploy only). Point both `shyftdoctor.com` and `shyftmastery.com` DNS to the deployment. Host header routing happens inside the app.

## Phase 2 (deferred)

- WordPress `/blog`
- Go High Level OAuth integration
- True websocket chat (currently 30s poll)
- Email-based password reset for non-seed users
- Video uploads (currently URL-based; admin pastes YouTube/Vimeo/Loom links)
- Cross-domain SSO for logged-in nav on Doctor.com

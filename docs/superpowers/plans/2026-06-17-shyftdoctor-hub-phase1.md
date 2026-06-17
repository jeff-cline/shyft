# shYft Doctor Hub — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make shyftdoctor.com the single hub (admin/CRM/tracking) with a locked-down public face, stand up shyftmaster.com as the live ad-facing duplicate, add a one-toggle graduation switch, and ship a drop-in integration panel (GHL + Google tracking + keyword-into-H1).

**Architecture:** One Next.js app, host-routed in `src/middleware.ts`. A shared `MarketingHome` component renders under both `/doctor` (name "shYft Doctor") and a new `/master` (name "Shyftmaster"). A `doctor_live` setting, read in server layouts (not edge middleware, so Prisma works), drives lockdown↔graduated behavior. Admin/CRM relocates from `/mastery/admin` to `/doctor/admin` with doctor-side login; the shyftmastery member funnel stays put. All integration config rides the existing `Setting` key/value table.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4, Prisma + SQLite (Postgres in prod), Auth.js v5, `node:test` for pure-logic unit tests (no new deps).

**Spec:** `docs/superpowers/specs/2026-06-17-shyftdoctor-hub-design.md`

**Testing note:** The repo has no test framework. Rather than add one, pure-logic units (redirect mapping, DKI keyword sanitizer, GHL payload builder) get `node:test` tests run via `node --test`. UI/routing/auth changes are verified with `npm run typecheck` and `npm run build`, plus the manual checks called out per task.

---

## File Structure

**Create:**
- `src/components/site/MarketingHome.tsx` — shared marketing home, takes a `brand` prop
- `src/lib/brand.ts` — brand identity per domain (`doctor` | `master`) + `getBrandY` helper
- `src/lib/site-status.ts` — read `doctor_live`; map a shyftmaster path → shyftdoctor URL
- `src/lib/site-status.test.ts` — node:test for the path mapper
- `src/lib/dki.ts` — sanitize a raw keyword for safe H1 insertion
- `src/lib/dki.test.ts` — node:test for the sanitizer
- `src/lib/integrations.ts` — GHL payload builder + `forwardLeadToGHL`
- `src/lib/integrations.test.ts` — node:test for the payload builder
- `src/components/site/LockdownOverlay.tsx` — OFF-state overlay (doctor)
- `src/components/site/GraduatedSplash.tsx` — ON-state splash on master home
- `src/components/site/GraduatedBanner.tsx` — ON-state one-time banner on doctor
- `src/components/site/TrackingTags.tsx` — injects GA4 / Ads / raw head snippet
- `src/app/master/layout.tsx`, `src/app/master/page.tsx` — shyftmaster route
- `src/app/doctor/login/page.tsx` + `LoginForm.tsx` + `actions.ts` — admin login
- `src/app/doctor/force-reset/page.tsx` + `ForceResetForm.tsx` + `actions.ts` — admin reset
- `src/app/doctor/logout/route.ts` — admin logout
- `src/app/doctor/admin/**` — moved from `src/app/mastery/admin/**`
- `src/app/doctor/admin/integrations/page.tsx` + `IntegrationsForm.tsx` + `actions.ts`
- `src/app/doctor/admin/site-status/page.tsx` + `SiteStatusForm.tsx` + `actions.ts`
- `public/favicon.svg` (overwrite) and `public/krystalore.jpg` (placeholder)

**Modify:**
- `src/middleware.ts` — add shyftmaster.com hosts + `/master` passthrough
- `src/app/doctor/page.tsx`, `src/app/doctor/layout.tsx` — use MarketingHome + lockdown/banner
- `src/app/layout.tsx` — render `<TrackingTags/>`
- `src/lib/auth-helpers.ts` — add `requireAdmin` redirecting to doctor auth paths
- `src/components/admin/AdminNav.tsx` — `/doctor/admin/*` links, `/doctor/logout`
- `src/auth.ts` — `pages.signIn = "/doctor/login"`
- `src/lib/leads.ts` — fire `forwardLeadToGHL` after creating a lead
- `prisma/seed.ts` — new setting defaults + `TEMP!234`

---

## Task 1: Settings, seed, and brand assets

**Files:**
- Modify: `prisma/seed.ts`
- Create: `public/krystalore.jpg` (placeholder)
- Overwrite: `public/favicon.svg`

- [ ] **Step 1: Add new setting defaults + temp password in `prisma/seed.ts`.**
In the `defaults` object add these keys:
```ts
    doctor_live: "false",
    ghl_inbound_webhook_url: "",
    ga4_measurement_id: "",
    google_ads_id: "",
    google_ads_conversion_label: "",
    head_tracking_snippet: "",
    dki_enabled: "false",
    dki_default_h1: "",
    krystalore_photo_url: "/krystalore.jpg",
```
Change the seed password line to default to the agreed temp password:
```ts
  const seedPassword = process.env.SEED_ADMIN_PASSWORD || "TEMP!234";
```
Both seed admins already have `mustResetPassword: true` on create — leave that. (Re-seed of an existing DB won't reset an already-claimed password; that's correct.)

- [ ] **Step 2: Create the brand-Y favicon `public/favicon.svg` (overwrite).**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="12" fill="#0f0f0f"/>
  <text x="32" y="46" text-anchor="middle" font-family="Arial Black, Arial, sans-serif"
        font-weight="900" font-size="46" fill="#D2691E">Y</text>
</svg>
```

- [ ] **Step 3: Add a placeholder photo so layouts don't 404.**
Run: `printf '' > public/krystalore.jpg` (real photo dropped in later; the `krystalore_photo_url` setting lets her change the path without code).

- [ ] **Step 4: Apply schema/settings locally and verify.**
Run: `npm run db:push && SEED_ADMIN_PASSWORD=TEMP!234 npm run db:seed`
Expected: "Seeded admin: jeff.cline@me.com", "Seeded admin: krystalore@...", "Seeded default settings."

- [ ] **Step 5: Commit.**
```bash
git add prisma/seed.ts public/favicon.svg public/krystalore.jpg
git commit -m "feat(settings): hub setting keys, TEMP!234 seed, brand-Y favicon"
```

---

## Task 2: Brand identity + shared MarketingHome (Y in headings only)

**Files:**
- Create: `src/lib/brand.ts`, `src/components/site/MarketingHome.tsx`
- Modify: `src/app/doctor/page.tsx`

- [ ] **Step 1: Create `src/lib/brand.ts`.**
```ts
export type BrandKey = "doctor" | "master";

export interface Brand {
  key: BrandKey;
  /** Display name used in the eyebrow + nav, e.g. "shYft Doctor" vs "Shyftmaster". */
  name: string;
  /** Origin used for cross-domain links/redirects. */
  origin: string;
}

export const BRANDS: Record<BrandKey, Brand> = {
  doctor: { key: "doctor", name: "shYft Doctor", origin: "https://shyftdoctor.com" },
  master: { key: "master", name: "Shyftmaster", origin: "https://shyftmaster.com" },
};
```

- [ ] **Step 2: Create `src/components/site/MarketingHome.tsx`.**
Move the entire JSX currently in `src/app/doctor/page.tsx` into this component, with three changes:
1. Signature: `export function MarketingHome({ brand, kw }: { brand: Brand; kw?: string }) { ... }`.
2. **Headings keep `<Shyft>`. Body loses it:** in every `<p>`, FAQ answer, `Stat` value, and the eyebrow label, replace `<Shyft>...</Shyft>` with the plain string. Keep `<Shyft>` only inside `<h1>/<h2>/<h3>` and the `Stat` `value`/`Faq` `q` (those render in `font-display` headings — keep Y). Concretely: remove `<Shyft>` from all `<p className=...>` blocks and from the inline `<span className="brand-y text-3xl">Y</span>` in the hero paragraph (delete that span and the surrounding split so the sentence reads "…The next one starts with you." as plain text).
3. **Brand name + DKI H1:** the eyebrow uses `{brand.name}`. The hero `<h1>` first line becomes `{kw ? <span className="text-brand-coral"><Shyft>{kw}</Shyft></span> : <span className="text-brand-coral"><Shyft>SHYFT HAPPENS!</Shyft></span>}` (DKI wired in Task 7; `kw` undefined for now → default).
4. **Promise copy:** the `Stat` with `label="Promise"` changes `value` to `"shYft will happen, guaranteed!"`.
Keep the `Stat`, `Faq` helper functions in this file.

- [ ] **Step 3: Replace `src/app/doctor/page.tsx` body to use the component.**
```tsx
import { MarketingHome } from "@/components/site/MarketingHome";
import { BRANDS } from "@/lib/brand";

export default function DoctorLanding() {
  return <MarketingHome brand={BRANDS.doctor} />;
}
```
(Lockdown wrapping is added in Task 4 — keep it plain here for now.)

- [ ] **Step 4: Typecheck + build.**
Run: `npm run typecheck && npm run build`
Expected: passes; `/doctor` renders with Y only in headings, Promise stat reads "shYft will happen, guaranteed!".

- [ ] **Step 5: Commit.**
```bash
git add src/lib/brand.ts src/components/site/MarketingHome.tsx src/app/doctor/page.tsx
git commit -m "feat(home): shared MarketingHome, Y in headings only, Promise copy"
```

---

## Task 3: shyftmaster.com routing + /master route

**Files:**
- Modify: `src/middleware.ts`
- Create: `src/app/master/layout.tsx`, `src/app/master/page.tsx`

- [ ] **Step 1: Add master hosts + passthrough in `src/middleware.ts`.**
Add constant and rewrite branch; add `/master` to the early-return passthrough list:
```ts
const MASTER_HOSTS = new Set(["shyftmaster.com", "www.shyftmaster.com"]);
```
In the early-return `if`, add `pathname.startsWith("/master") ||` next to the `/doctor` check. After the DOCTOR_HOSTS branch, add:
```ts
  if (MASTER_HOSTS.has(host)) {
    const url = req.nextUrl.clone();
    url.pathname = `/master${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }
```

- [ ] **Step 2: Create `src/app/master/layout.tsx`.**
```tsx
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav loginHref="https://shyftdoctor.com/login" homeHref="/" />
      {children}
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 3: Create `src/app/master/page.tsx`.**
```tsx
import { MarketingHome } from "@/components/site/MarketingHome";
import { BRANDS } from "@/lib/brand";

export default function MasterLanding() {
  return <MarketingHome brand={BRANDS.master} />;
}
```
(Graduated splash/redirect added in Task 4.)

- [ ] **Step 4: Build + manual host check.**
Run: `npm run build && npm run start &` then
`curl -s -H "Host: shyftmaster.com" http://localhost:3000/ | grep -o "Shyftmaster" | head -1`
Expected: prints `Shyftmaster`. Kill the server after.

- [ ] **Step 5: Commit.**
```bash
git add src/middleware.ts src/app/master
git commit -m "feat(routing): add shyftmaster.com host + /master duplicate"
```

---

## Task 4: Doctor ON/OFF — lockdown, graduated splash, 301, banner

**Files:**
- Create: `src/lib/site-status.ts`, `src/lib/site-status.test.ts`
- Create: `src/components/site/LockdownOverlay.tsx`, `GraduatedSplash.tsx`, `GraduatedBanner.tsx`
- Modify: `src/app/doctor/layout.tsx`, `src/app/master/layout.tsx`

- [ ] **Step 1: Write `src/lib/site-status.test.ts` (failing).**
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { masterPathToDoctorUrl } from "./site-status.ts";

test("maps a master deep path to the doctor origin", () => {
  assert.equal(
    masterPathToDoctorUrl("/book?x=1"),
    "https://shyftdoctor.com/book?x=1"
  );
});

test("maps root to doctor origin root", () => {
  assert.equal(masterPathToDoctorUrl("/"), "https://shyftdoctor.com/");
});
```

- [ ] **Step 2: Run it — expect failure.**
Run: `node --test src/lib/site-status.test.ts`
Expected: FAIL (module/function not found).

- [ ] **Step 3: Write `src/lib/site-status.ts`.**
```ts
import { getSetting } from "@/lib/settings";
import { BRANDS } from "@/lib/brand";

export async function isDoctorLive(): Promise<boolean> {
  return (await getSetting("doctor_live")) === "true";
}

/** Map a path on shyftmaster.com to the equivalent absolute shyftdoctor.com URL. */
export function masterPathToDoctorUrl(pathWithQuery: string): string {
  const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  return `${BRANDS.doctor.origin}${path}`;
}
```
Note: the test imports with an explicit `.ts` extension and `@/` won't resolve under bare `node --test`. To keep the pure function importable, the test file re-declares the import from a relative path AND we keep `masterPathToDoctorUrl` free of `@/` at call sites it tests. Since `site-status.ts` imports `@/lib/brand`, run the test with the loader: `node --import tsx --test src/lib/site-status.test.ts` (tsx is already a devDependency and resolves `@/`). Update Step 2/4 commands accordingly.

- [ ] **Step 4: Run the test — expect pass.**
Run: `node --import tsx --test src/lib/site-status.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Create `src/components/site/LockdownOverlay.tsx`.**
```tsx
import { getSetting } from "@/lib/settings";

export async function LockdownOverlay() {
  const photo = (await getSetting("krystalore_photo_url")) || "/krystalore.jpg";
  return (
    <div className="fixed inset-0 z-[100] bg-ink/95 text-paper flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="Krystalore" className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-brand-y" />
        <h1 className="font-display text-4xl">Doctor In Training</h1>
        <p className="opacity-85">Please visit Shyftmaster while this is in progress.</p>
        <div className="flex flex-col gap-3">
          <a href="https://shyftmaster.com" className="bg-brand-y text-paper font-display text-lg px-6 py-3 rounded-md">Visit Shyftmaster</a>
          <a href="/login" className="underline opacity-70 hover:opacity-100 text-sm">Admin login</a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `src/components/site/GraduatedSplash.tsx` (client, master home only).**
```tsx
"use client";
import { useEffect } from "react";

export function GraduatedSplash({ photo, doctorUrl }: { photo: string; doctorUrl: string }) {
  useEffect(() => {
    const t = setTimeout(() => { window.location.href = doctorUrl; }, 4000);
    return () => clearTimeout(t);
  }, [doctorUrl]);
  return (
    <div className="fixed inset-0 z-[100] bg-ink text-paper flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="Krystalore" className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-brand-y" />
        <h1 className="font-display text-4xl">She Graduated 🎓</h1>
        <p className="opacity-85">Visit me at <span className="text-brand-y">Shyftdoctor.com</span> — taking you there now…</p>
        <a href={doctorUrl} className="bg-brand-y text-paper font-display text-lg px-6 py-3 rounded-md inline-block">Go now</a>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create `src/components/site/GraduatedBanner.tsx` (client, dismissible).**
```tsx
"use client";
import { useEffect, useState } from "react";

export function GraduatedBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(!document.cookie.includes("grad_seen=1")); }, []);
  if (!show) return null;
  return (
    <div className="bg-brand-y text-paper text-center py-2 px-4 text-sm">
      🎓 Krystalore graduated — welcome to the shYft Doctor.
      <button
        onClick={() => { document.cookie = "grad_seen=1; max-age=31536000; path=/"; setShow(false); }}
        className="ml-3 underline"
      >Dismiss</button>
    </div>
  );
}
```

- [ ] **Step 8: Wire the doctor layout (`src/app/doctor/layout.tsx`).**
```tsx
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { isDoctorLive } from "@/lib/site-status";
import { LockdownOverlay } from "@/components/site/LockdownOverlay";
import { GraduatedBanner } from "@/components/site/GraduatedBanner";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const live = await isDoctorLive();
  return (
    <>
      {live && <GraduatedBanner />}
      <SiteNav loginHref="/login" homeHref="/doctor" />
      {children}
      <SiteFooter />
      {!live && <LockdownOverlay />}
    </>
  );
}
```
Note: the lockdown is rendered in the doctor layout so it covers `/doctor` and `/doctor/book` consumer pages. Admin/login/force-reset live under `/doctor/admin`, `/doctor/login`, etc. — those have their **own** layouts and are NOT wrapped by this marketing layout, so the overlay never blocks the admin. Verify route grouping: ensure `login`, `force-reset`, `logout`, and `admin` are siblings of `page.tsx`/`layout.tsx` under `app/doctor` and that this `layout.tsx` only wraps the marketing pages. Since Next nests layouts, this `DoctorLayout` WOULD wrap children including `/doctor/login`. To prevent that, place the marketing pages in a route group: move `app/doctor/page.tsx`, `app/doctor/book/` and this layout into `app/doctor/(site)/` so the overlay layout only wraps `(site)`. Keep `app/doctor/login`, `/force-reset`, `/logout`, `/admin` directly under `app/doctor` (outside the group). Middleware rewrite to `/doctor/...` still matches because route groups don't affect the URL.

- [ ] **Step 9: Wire the master home for graduated splash/redirect.**
Edit `src/app/master/page.tsx` to branch on live state:
```tsx
import { MarketingHome } from "@/components/site/MarketingHome";
import { BRANDS } from "@/lib/brand";
import { isDoctorLive } from "@/lib/site-status";
import { getSetting } from "@/lib/settings";
import { GraduatedSplash } from "@/components/site/GraduatedSplash";

export default async function MasterLanding() {
  const live = await isDoctorLive();
  if (live) {
    const photo = (await getSetting("krystalore_photo_url")) || "/krystalore.jpg";
    return <GraduatedSplash photo={photo} doctorUrl="https://shyftdoctor.com/" />;
  }
  return <MarketingHome brand={BRANDS.master} />;
}
```
Add a deep-path 301 in `src/app/master/layout.tsx` for any non-root master path when live:
```tsx
import { redirect, permanentRedirect } from "next/navigation";
// inside MasterLayout, before returning — but layout has no pathname; do it per-segment instead.
```
Because layouts lack the pathname, implement the deep-path 301 in `src/app/master/[...slug]/page.tsx`:
```tsx
import { permanentRedirect } from "next/navigation";
import { isDoctorLive } from "@/lib/site-status";
import { masterPathToDoctorUrl } from "@/lib/site-status";

export default async function MasterCatchAll({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + (slug?.join("/") ?? "");
  if (await isDoctorLive()) permanentRedirect(masterPathToDoctorUrl(path));
  // When not live, master has no other pages yet → 404 is correct.
  return null;
}
```

- [ ] **Step 10: Typecheck, build, run the test.**
Run: `node --import tsx --test src/lib/site-status.test.ts && npm run typecheck && npm run build`
Expected: all pass.

- [ ] **Step 11: Manual toggle check.**
With `npm run start`: set `doctor_live=false` (default) →
`curl -s -H "Host: shyftdoctor.com" localhost:3000/ | grep -c "Doctor In Training"` → ≥1.
Flip via SQL `update Setting set value='true' where key='doctor_live';` (or wait for Task 6 UI) →
`curl -s -H "Host: shyftmaster.com" localhost:3000/ | grep -c "She Graduated"` → ≥1. Reset to false.

- [ ] **Step 12: Commit.**
```bash
git add src/lib/site-status.ts src/lib/site-status.test.ts src/components/site src/app/doctor src/app/master
git commit -m "feat(toggle): lockdown overlay, graduated splash/301, welcome banner"
```

---

## Task 5: Relocate admin/CRM to /doctor + doctor-side auth

**Files:**
- Move: `src/app/mastery/admin/**` → `src/app/doctor/admin/**`
- Create: `src/app/doctor/login/{page.tsx,LoginForm.tsx,actions.ts}`, `src/app/doctor/force-reset/{page.tsx,ForceResetForm.tsx,actions.ts}`, `src/app/doctor/logout/route.ts`
- Modify: `src/lib/auth-helpers.ts`, `src/components/admin/AdminNav.tsx`, `src/auth.ts`

- [ ] **Step 1: Move the admin tree (preserves git history).**
```bash
git mv src/app/mastery/admin src/app/doctor/admin
```
The admin tree is now OUTSIDE the `(site)` group, so the lockdown overlay never covers it.

- [ ] **Step 2: Update internal admin links to `/doctor/admin`.**
In `src/components/admin/AdminNav.tsx`: replace every `/mastery/admin` with `/doctor/admin`, and the logout form `action="/mastery/logout"` → `action="/doctor/logout"`.
Then `grep -rn "/mastery/admin" src/app/doctor/admin` and replace any remaining occurrences (redirects in `actions.ts`, `page.tsx` links) with `/doctor/admin`.

- [ ] **Step 3: Add a doctor-side admin guard in `src/lib/auth-helpers.ts`.**
Replace `requireAdmin` so it routes to the doctor auth pages (members keep `requireUser` → `/mastery/*`):
```ts
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/doctor/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/doctor/login");
  if (user.mustResetPassword) redirect("/doctor/force-reset");
  if (user.role !== "admin") redirect("/doctor/login");
  return user;
}
```
Leave `requireUser`/`requireAffiliate` (member funnel) untouched.

- [ ] **Step 4: Create `src/app/doctor/login/` by copying the mastery login and retargeting.**
```bash
mkdir -p src/app/doctor/login
cp src/app/mastery/login/page.tsx src/app/doctor/login/page.tsx
cp src/app/mastery/login/LoginForm.tsx src/app/doctor/login/LoginForm.tsx
cp src/app/mastery/login/actions.ts src/app/doctor/login/actions.ts
```
In `src/app/doctor/login/actions.ts`: change all `redirectTo` `/mastery/...` values to doctor equivalents — `/mastery/login` → `/doctor/login`, `/mastery/force-reset` → `/doctor/force-reset`, and the post-login `dest` to `"/doctor/admin"` for admins. Non-admin members shouldn't use this page; if `user.role !== "admin"`, set `redirectTo: "/mastery/dashboard"` (they get bounced to their member area). Change the page heading from "Member Login" to "Admin Login" and remove the "Need an account? Sign up" link in `LoginForm.tsx`.

- [ ] **Step 5: Create `src/app/doctor/force-reset/` by copying the mastery force-reset.**
```bash
cp -r src/app/mastery/force-reset src/app/doctor/force-reset
```
In `src/app/doctor/force-reset/actions.ts`: change any post-reset redirect of `/mastery/...` to `/doctor/admin`. In its `page.tsx`, ensure the success path points to `/doctor/admin`. (Open the files and adjust the literal paths; logic is unchanged.)

- [ ] **Step 6: Create `src/app/doctor/logout/route.ts`.**
```ts
import { signOut } from "@/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await signOut({ redirect: false });
  return NextResponse.redirect(new URL("/doctor/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
```
(Mirror the existing `src/app/mastery/logout/route.ts` shape — open it first and match its style exactly, just changing the redirect target to `/doctor/login`.)

- [ ] **Step 7: Point Auth.js default sign-in page at the doctor login in `src/auth.ts`.**
Change `pages: { signIn: "/mastery/login" }` → `pages: { signIn: "/doctor/login" }`.
(Member pages call `loginAction` directly and pass explicit redirects, so they're unaffected.)

- [ ] **Step 8: Typecheck + build.**
Run: `npm run typecheck && npm run build`
Expected: passes; no dangling `/mastery/admin` imports.
Run: `grep -rn "/mastery/admin" src/` → expect no results (all moved).

- [ ] **Step 9: Manual auth check.**
`npm run start`; visit `http://localhost:3000/doctor/login` with Host `shyftdoctor.com` (use a browser or curl with cookies). Log in as `jeff.cline@me.com` / `TEMP!234` → forced to `/doctor/force-reset` → set new password → lands on `/doctor/admin`.

- [ ] **Step 10: Commit.**
```bash
git add -A
git commit -m "feat(admin): relocate admin/CRM to /doctor with doctor-side auth"
```

---

## Task 6: Site-status toggle UI in admin

**Files:**
- Create: `src/app/doctor/admin/site-status/{page.tsx,SiteStatusForm.tsx,actions.ts}`
- Modify: `src/components/admin/AdminNav.tsx` (add nav item)

- [ ] **Step 1: Create `actions.ts`.**
```ts
"use server";
import { requireAdmin } from "@/lib/auth-helpers";
import { setSetting, getSetting } from "@/lib/settings";

export async function setDoctorLive(live: boolean) {
  await requireAdmin();
  await setSetting("doctor_live", live ? "true" : "false");
  return { ok: true, live };
}
export async function getDoctorLive() {
  return (await getSetting("doctor_live")) === "true";
}
```

- [ ] **Step 2: Create `SiteStatusForm.tsx` (client) with a confirm step.**
```tsx
"use client";
import { useState, useTransition } from "react";
import { setDoctorLive } from "./actions";

export function SiteStatusForm({ initialLive }: { initialLive: boolean }) {
  const [live, setLive] = useState(initialLive);
  const [pending, start] = useTransition();
  function flip(next: boolean) {
    const msg = next
      ? "Go LIVE as shYft Doctor? shyftmaster.com will start redirecting here."
      : "Return to lockdown (in training)? shyftmaster.com becomes the public site again.";
    if (!confirm(msg)) return;
    start(async () => { await setDoctorLive(next); setLive(next); });
  }
  return (
    <div className="space-y-4">
      <p className="opacity-75">Current status:{" "}
        <strong>{live ? "GRADUATED — shyftdoctor.com is public" : "IN TRAINING — locked down"}</strong>
      </p>
      <button disabled={pending} onClick={() => flip(!live)}
        className="bg-brand-y text-paper font-display text-xl px-6 py-3 rounded-md hover:bg-ink transition-colors disabled:opacity-50">
        {live ? "Return to Lockdown" : "Graduate → Go Live as Doctor"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create `page.tsx`.**
```tsx
import { Shyft } from "@/components/brand/Shyft";
import { getDoctorLive } from "./actions";
import { SiteStatusForm } from "./SiteStatusForm";

export default async function SiteStatusAdmin() {
  const live = await getDoctorLive();
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl mb-2"><Shyft>Site Status</Shyft></h1>
      <p className="opacity-70 mb-8">Flip between “in training” (locked down) and “graduated” (shyftdoctor public).</p>
      <SiteStatusForm initialLive={live} />
    </main>
  );
}
```

- [ ] **Step 4: Add nav item** in `AdminNav.tsx` items array: `{ href: "/doctor/admin/site-status", label: "Site Status" }` (place first, after Overview).

- [ ] **Step 5: Typecheck + build.**
Run: `npm run typecheck && npm run build` — expect pass.

- [ ] **Step 6: Commit.**
```bash
git add src/app/doctor/admin/site-status src/components/admin/AdminNav.tsx
git commit -m "feat(admin): site-status graduation toggle"
```

---

## Task 7: Integration panel (GHL + Google tracking + DKI)

**Files:**
- Create: `src/lib/dki.ts`, `src/lib/dki.test.ts`, `src/lib/integrations.ts`, `src/lib/integrations.test.ts`
- Create: `src/components/site/TrackingTags.tsx`
- Create: `src/app/doctor/admin/integrations/{page.tsx,IntegrationsForm.tsx,actions.ts}`
- Modify: `src/lib/leads.ts`, `src/app/layout.tsx`, `src/components/site/MarketingHome.tsx`, `src/app/doctor/(site)/page.tsx`, `src/app/master/page.tsx`, `src/components/admin/AdminNav.tsx`

- [ ] **Step 1: DKI sanitizer test `src/lib/dki.test.ts` (failing).**
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeKeyword } from "./dki.ts";

test("strips html and trims, title-cases", () => {
  assert.equal(sanitizeKeyword("  life <b>coach</b>  "), "Life Coach");
});
test("rejects overly long / empty", () => {
  assert.equal(sanitizeKeyword(""), null);
  assert.equal(sanitizeKeyword("x".repeat(90)), null);
});
```

- [ ] **Step 2: Run — expect fail.** `node --import tsx --test src/lib/dki.test.ts` → FAIL.

- [ ] **Step 3: Write `src/lib/dki.ts`.**
```ts
/** Sanitize a raw ad keyword for safe insertion as the first line of the H1. */
export function sanitizeKeyword(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const stripped = raw.replace(/<[^>]*>/g, "").replace(/[^\p{L}\p{N}\s'&-]/gu, " ").replace(/\s+/g, " ").trim();
  if (stripped.length < 2 || stripped.length > 60) return null;
  return stripped.replace(/\b\w/g, (c) => c.toUpperCase());
}
```

- [ ] **Step 4: Run — expect pass.** `node --import tsx --test src/lib/dki.test.ts` → PASS.

- [ ] **Step 5: GHL payload test `src/lib/integrations.test.ts` (failing).**
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGhlPayload } from "./integrations.ts";

test("builds a GHL contact payload from a lead", () => {
  const p = buildGhlPayload({ name: "A B", email: "a@b.com", phone: "5551212", message: "hi", source: "doctor", affiliateRef: null });
  assert.equal(p.email, "a@b.com");
  assert.equal(p.firstName, "A");
  assert.equal(p.lastName, "B");
  assert.equal(p.phone, "5551212");
  assert.deepEqual(p.tags, ["shyft-lead", "source:doctor"]);
});
```

- [ ] **Step 6: Run — expect fail.** `node --import tsx --test src/lib/integrations.test.ts` → FAIL.

- [ ] **Step 7: Write `src/lib/integrations.ts`.**
```ts
import { getSetting } from "@/lib/settings";

export interface LeadLike {
  name: string; email: string; phone?: string | null; message?: string | null;
  source?: string | null; affiliateRef?: string | null;
}

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

/** Fire-and-forget POST to the configured GHL inbound webhook. Never throws. */
export async function forwardLeadToGHL(lead: LeadLike): Promise<void> {
  try {
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
```

- [ ] **Step 8: Run — expect pass.** `node --import tsx --test src/lib/integrations.test.ts` → PASS.

- [ ] **Step 9: Hook lead forwarding into `src/lib/leads.ts`.**
At the top add `import { forwardLeadToGHL } from "@/lib/integrations";`. In `createLead`, immediately before `return { lead, user };`, add:
```ts
  await forwardLeadToGHL({
    name: input.name, email, phone: input.phone, message: input.message,
    source, affiliateRef: input.affiliateRef,
  });
```

- [ ] **Step 10: Create `src/components/site/TrackingTags.tsx`.**
```tsx
import Script from "next/script";
import { getSettings } from "@/lib/settings";

export async function TrackingTags() {
  const s = await getSettings(["ga4_measurement_id", "google_ads_id", "head_tracking_snippet"]);
  const gaId = s.ga4_measurement_id?.trim();
  const adsId = s.google_ads_id?.trim();
  const raw = s.head_tracking_snippet?.trim();
  const tagId = gaId || adsId;
  return (
    <>
      {tagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);} gtag('js', new Date());
            ${gaId ? `gtag('config', '${gaId}');` : ""}
            ${adsId ? `gtag('config', '${adsId}');` : ""}
          `}</Script>
        </>
      )}
      {raw && <Script id="raw-head-tracking" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: raw }} />}
    </>
  );
}
```

- [ ] **Step 11: Render tracking in `src/app/layout.tsx`.**
Add `import { TrackingTags } from "@/components/site/TrackingTags";` and place `<TrackingTags />` just inside `<body>` before `<SessionWrapper>`. Make the component call awaited by marking the default export `async` (RootLayout becomes `export default async function RootLayout`).

- [ ] **Step 12: Wire DKI into the home H1.**
In `MarketingHome.tsx` the `kw` prop already feeds the H1 (Task 2 Step 2.3). Now pass it from the pages by reading `searchParams` + the `dki_enabled` setting:
`src/app/doctor/(site)/page.tsx`:
```tsx
import { MarketingHome } from "@/components/site/MarketingHome";
import { BRANDS } from "@/lib/brand";
import { getSettings } from "@/lib/settings";
import { sanitizeKeyword } from "@/lib/dki";

export default async function DoctorLanding({ searchParams }: { searchParams: Promise<{ kw?: string }> }) {
  const { kw } = await searchParams;
  const s = await getSettings(["dki_enabled", "dki_default_h1"]);
  const keyword = s.dki_enabled === "true" ? (sanitizeKeyword(kw) ?? (s.dki_default_h1 || undefined)) : undefined;
  return <MarketingHome brand={BRANDS.doctor} kw={keyword} />;
}
```
Apply the identical `searchParams`/DKI logic to `src/app/master/page.tsx` (in the non-live branch, pass `kw={keyword}` to `MarketingHome`).

- [ ] **Step 13: Create the integrations admin `actions.ts`.**
```ts
"use server";
import { requireAdmin } from "@/lib/auth-helpers";
import { setSetting } from "@/lib/settings";

export async function saveIntegrations(values: Record<string, string>) {
  await requireAdmin();
  for (const [k, v] of Object.entries(values)) await setSetting(k, v ?? "");
  return { ok: true };
}
```

- [ ] **Step 14: Create `IntegrationsForm.tsx`** (client). Mirror the existing `SettingsForm.tsx` structure (reuse its `Section`/`TextField` patterns inline) with fields: `ghl_inbound_webhook_url`, `ga4_measurement_id`, `google_ads_id`, `google_ads_conversion_label`, `head_tracking_snippet` (textarea), `dki_enabled` (toggle), `dki_default_h1`. Include the inline instructions as `help` text:
  - GHL: "GoHighLevel → Automation → Workflows → Create → trigger ‘Inbound Webhook’ → copy the URL → paste here → add an action mapping email/firstName/lastName/phone/tags. Every new lead POSTs here automatically."
  - Google tracking: "GA4: Admin → Data Streams → copy ‘G-XXXX’. Google Ads: Tools → Conversions → tag setup → copy ‘AW-XXXX’ and the conversion label. Tags fire site-wide as soon as you Save."
  - DKI: "In Google Ads set the campaign Tracking template / Final URL suffix to append `?kw={keyword}`. Enable this toggle; the searched keyword becomes the first line of the home H1, falling back to the default below (or the normal headline) when absent."
Submit calls `saveIntegrations(state)`.

- [ ] **Step 15: Create the integrations `page.tsx`.**
```tsx
import { Shyft } from "@/components/brand/Shyft";
import { getSettings } from "@/lib/settings";
import { IntegrationsForm } from "./IntegrationsForm";

const KEYS = ["ghl_inbound_webhook_url","ga4_measurement_id","google_ads_id","google_ads_conversion_label","head_tracking_snippet","dki_enabled","dki_default_h1"];

export default async function IntegrationsAdmin() {
  const settings = await getSettings(KEYS);
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl mb-2"><Shyft>Integrations</Shyft></h1>
      <p className="opacity-70 mb-8">Lead routing to GoHighLevel, Google tracking, and dynamic keyword headlines.</p>
      <IntegrationsForm initial={settings} />
    </main>
  );
}
```

- [ ] **Step 16: Add nav item** in `AdminNav.tsx`: `{ href: "/doctor/admin/integrations", label: "Integrations" }`.

- [ ] **Step 17: Run all tests + typecheck + build.**
Run: `node --import tsx --test src/lib/*.test.ts && npm run typecheck && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 18: Manual DKI + tracking check.**
`npm run start`; `curl -s -H "Host: shyftmaster.com" "localhost:3000/?kw=life+coach"` after setting `dki_enabled=true` → H1 contains "Life Coach". Set a fake `ga4_measurement_id=G-TEST` → page source includes `gtag/js?id=G-TEST`.

- [ ] **Step 19: Commit.**
```bash
git add -A
git commit -m "feat(integrations): GHL forwarding, Google tracking tags, DKI keyword H1 + admin panel"
```

---

## Task 8: Final verification + go live

**Files:** none (verification + merge)

- [ ] **Step 1: Full gate.**
Run: `node --import tsx --test src/lib/*.test.ts && npm run lint && npm run typecheck && npm run build`
Expected: all green. Fix anything that isn't.

- [ ] **Step 2: Smoke the three hosts against `npm run start`.**
- `curl -s -H "Host: shyftdoctor.com" localhost:3000/ | grep -c "Doctor In Training"` → ≥1 (locked down)
- `curl -s -H "Host: shyftmaster.com" localhost:3000/ | grep -c "Shyftmaster"` → ≥1 (live)
- `curl -s -H "Host: shyftmastery.com" localhost:3000/ | grep -c "shYft"` → ≥1 (untouched)

- [ ] **Step 3: Merge to main (Hermes deploys main).**
```bash
git checkout main
git merge --no-ff feat/shyftdoctor-hub -m "feat: shYft Doctor hub Phase 1"
git push origin main
```

- [ ] **Step 4: Hand off the go-live checklist (manual, outside this repo).**
Produce the two-switch checklist for the user: (a) point `shyftmaster.com` + `www` DNS at the same deployment as shyftdoctor; (b) in Hermes/host env, ensure `NEXT_PUBLIC_DOCTOR_URL=https://shyftdoctor.com`, add `NEXT_PUBLIC_MASTER_URL=https://shyftmaster.com`, run `npx prisma db push` + `npm run db:seed` with `SEED_ADMIN_PASSWORD=TEMP!234` on first deploy. Confirm `doctor_live` is `false` (lockdown) until graduation.

---

## Self-Review

- **Spec coverage:** §2.1 shared home → Task 2; §2.2 routing → Task 3; §2.3 toggle/lockdown/splash/301/banner → Task 4 (+UI Task 6); §2.4 admin relocation + doctor auth → Task 5; §2.5 god accounts/TEMP!234 → Task 1; §2.6 brand-Y/favicon/Promise → Tasks 1+2; §2.7 GHL/tracking/DKI → Task 7; §3 setting keys → Task 1; §5 success criteria → Task 8 smoke. All covered.
- **Placeholders:** none — every code step has concrete code; the one structural subtlety (route group for the lockdown layout) is spelled out in Task 4 Step 8.
- **Type consistency:** `sanitizeKeyword`, `masterPathToDoctorUrl`, `isDoctorLive`, `buildGhlPayload`, `forwardLeadToGHL`, `MarketingHome({brand, kw})`, `BRANDS` used consistently across tasks.
- **Known risk:** moving `app/doctor/page.tsx` into `app/doctor/(site)/` (Task 4) must be reflected in Task 7 Step 12's path (`src/app/doctor/(site)/page.tsx`) — already aligned.

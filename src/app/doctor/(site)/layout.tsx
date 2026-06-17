import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { isDoctorLive } from "@/lib/site-status";
import { LockdownOverlay } from "@/components/site/LockdownOverlay";
import { GraduatedBanner } from "@/components/site/GraduatedBanner";

// The lockdown/graduated state is read from the DB per request — never prerender it.
export const dynamic = "force-dynamic";

/**
 * Marketing layout for shyftdoctor.com. Only wraps the (site) group — the admin,
 * login, force-reset and logout routes live outside it, so the lockdown overlay
 * never blocks the admin while in training.
 */
export default async function DoctorSiteLayout({ children }: { children: React.ReactNode }) {
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

import { MarketingHome } from "@/components/site/MarketingHome";
import { BRANDS } from "@/lib/brand";
import { isDoctorLive } from "@/lib/site-status";
import { getSetting, getSettings } from "@/lib/settings";
import { sanitizeKeyword } from "@/lib/dki";
import { GraduatedSplash } from "@/components/site/GraduatedSplash";

// Graduated state is read from the DB per request — never prerender it.
export const dynamic = "force-dynamic";

export default async function MasterLanding({
  searchParams,
}: {
  searchParams: Promise<{ kw?: string }>;
}) {
  const live = await isDoctorLive();
  if (live) {
    const photo = (await getSetting("krystalore_photo_url")) || "/krystalore.jpg";
    return <GraduatedSplash photo={photo} doctorUrl="https://shyftdoctor.com/" />;
  }
  const { kw } = await searchParams;
  const s = await getSettings(["dki_enabled", "dki_default_h1"]);
  const keyword =
    s.dki_enabled === "true" ? sanitizeKeyword(kw) ?? (s.dki_default_h1 || undefined) : undefined;
  return <MarketingHome brand={BRANDS.master} kw={keyword} />;
}

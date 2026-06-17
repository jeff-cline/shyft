import { MarketingHome } from "@/components/site/MarketingHome";
import { BRANDS } from "@/lib/brand";
import { isDoctorLive } from "@/lib/site-status";
import { getSetting } from "@/lib/settings";
import { GraduatedSplash } from "@/components/site/GraduatedSplash";

// Graduated state is read from the DB per request — never prerender it.
export const dynamic = "force-dynamic";

export default async function MasterLanding() {
  const live = await isDoctorLive();
  if (live) {
    const photo = (await getSetting("krystalore_photo_url")) || "/krystalore.jpg";
    return <GraduatedSplash photo={photo} doctorUrl="https://shyftdoctor.com/" />;
  }
  return <MarketingHome brand={BRANDS.master} />;
}

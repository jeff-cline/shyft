import { MarketingHome } from "@/components/site/MarketingHome";
import { BRANDS } from "@/lib/brand";
import { getSettings } from "@/lib/settings";
import { sanitizeKeyword } from "@/lib/dki";
import { recordKeywordHit } from "@/lib/keywords";

export default async function DoctorLanding({
  searchParams,
}: {
  searchParams: Promise<{ kw?: string }>;
}) {
  const { kw } = await searchParams;
  const sanitized = sanitizeKeyword(kw);
  if (sanitized) await recordKeywordHit(sanitized);
  const s = await getSettings(["dki_enabled", "dki_default_h1"]);
  const keyword =
    s.dki_enabled === "true" ? sanitized ?? (s.dki_default_h1 || undefined) : undefined;
  return <MarketingHome brand={BRANDS.doctor} kw={keyword} />;
}

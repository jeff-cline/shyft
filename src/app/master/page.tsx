import { MarketingHome } from "@/components/site/MarketingHome";
import { BRANDS } from "@/lib/brand";

export default function MasterLanding() {
  return <MarketingHome brand={BRANDS.master} />;
}

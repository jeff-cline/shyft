import { MarketingHome } from "@/components/site/MarketingHome";
import { BRANDS } from "@/lib/brand";

export default function DoctorLanding() {
  return <MarketingHome brand={BRANDS.doctor} />;
}

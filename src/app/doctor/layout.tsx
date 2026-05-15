import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MASTERY_BASE } from "@/lib/urls";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav loginHref={`${MASTERY_BASE}/login`} homeHref="/doctor" />
      {children}
      <SiteFooter />
    </>
  );
}

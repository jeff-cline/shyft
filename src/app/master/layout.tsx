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

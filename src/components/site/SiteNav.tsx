import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Shyft } from "@/components/brand/Shyft";

interface SiteNavProps {
  loginHref?: string;
  homeHref?: string;
}

export function SiteNav({ loginHref, homeHref = "/" }: SiteNavProps) {
  return (
    <header className="border-b border-ink/10 bg-paper/85 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={homeHref} aria-label="Home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {loginHref && (
            <Link href={loginHref} className="font-display text-base hover:text-brand-y transition-colors">
              <Shyft>Member Login</Shyft>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

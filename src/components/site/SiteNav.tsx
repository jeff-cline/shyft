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
      {/* ~1 inch tall; the Y-mark fills the full nav height in the upper-left */}
      <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-between">
        <Link href={homeHref} aria-label="Home" className="h-full py-1.5 block">
          <Logo variant="mark" />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {loginHref && (
            <Link
              href={loginHref}
              className="font-display text-base hover:text-brand-y transition-colors"
            >
              <Shyft>Member Login</Shyft>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

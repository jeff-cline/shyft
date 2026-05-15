import Link from "next/link";
import { Shyft } from "@/components/brand/Shyft";
import { Logo } from "@/components/brand/Logo";
import { requireAffiliate } from "@/lib/auth-helpers";

export default async function AffiliateLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAffiliate();
  return (
    <>
      <header className="border-b border-ink/10 bg-paper sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/mastery/affiliate" className="flex items-center gap-3" aria-label="Home">
            <Logo />
            <span className="font-display text-lg opacity-70">
              <Shyft>Affiliate</Shyft>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="opacity-60 hidden sm:inline">{user.email}</span>
            {user.role === "admin" && (
              <Link href="/mastery/admin" className="font-display hover:text-brand-y">
                <Shyft>Admin</Shyft>
              </Link>
            )}
            <form action="/mastery/logout" method="post">
              <button type="submit" className="font-display hover:text-brand-y">
                <Shyft>Sign Out</Shyft>
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}

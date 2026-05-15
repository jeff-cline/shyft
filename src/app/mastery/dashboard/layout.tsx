import Link from "next/link";
import { Shyft } from "@/components/brand/Shyft";
import { Logo } from "@/components/brand/Logo";
import { requireUser } from "@/lib/auth-helpers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <>
      <header className="border-b border-ink/10 bg-paper sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/mastery/dashboard" aria-label="Home" className="flex items-center gap-3">
            <Logo />
            <span className="hidden sm:inline font-display text-lg opacity-70">
              <Shyft>Dashboard</Shyft>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="opacity-60 hidden sm:inline">
              <Shyft>{user.email}</Shyft>
            </span>
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

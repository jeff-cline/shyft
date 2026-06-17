import Link from "next/link";
import { Shyft } from "@/components/brand/Shyft";
import { Logo } from "@/components/brand/Logo";

const items = [
  { href: "/doctor/admin", label: "Overview" },
  { href: "/doctor/admin/site-status", label: "Site Status" },
  { href: "/doctor/admin/integrations", label: "Integrations" },
  { href: "/doctor/admin/leads", label: "Leads" },
  { href: "/doctor/admin/users", label: "Users" },
  { href: "/doctor/admin/chat", label: "Chat" },
  { href: "/doctor/admin/videos", label: "Videos" },
  { href: "/doctor/admin/calendar", label: "Calendar" },
  { href: "/doctor/admin/admins", label: "Admins" },
  { href: "/doctor/admin/settings", label: "Settings" },
];

export function AdminNav({ email }: { email: string }) {
  return (
    <header className="border-b border-ink/10 bg-paper sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <Link href="/doctor/admin" className="flex items-center gap-3" aria-label="Admin home">
          <Logo />
          <span className="font-display text-lg opacity-70">
            <Shyft>Admin</Shyft>
          </span>
        </Link>
        <nav className="flex items-center gap-1 flex-wrap">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="px-3 py-1.5 font-display text-sm rounded hover:bg-ink hover:text-paper transition-colors"
            >
              <Shyft>{it.label}</Shyft>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="opacity-60 hidden md:inline">
            <Shyft>{email}</Shyft>
          </span>
          <form action="/doctor/logout" method="post">
            <button type="submit" className="font-display hover:text-brand-y">
              <Shyft>Sign Out</Shyft>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

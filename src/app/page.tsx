import Link from "next/link";
import { Shyft } from "@/components/brand/Shyft";

export default function DevIndex() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 max-w-3xl mx-auto text-center">
      <h1 className="font-display text-6xl md:text-8xl leading-none">
        <Shyft>shYft</Shyft>
      </h1>
      <p className="text-lg opacity-70">
        Local dev index. In production, traffic is routed by host. Preview each site below.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <Link
          href="/doctor"
          className="p-8 border-2 border-ink hover:bg-ink hover:text-paper transition-colors rounded-lg"
        >
          <div className="font-display text-3xl mb-2">
            <Shyft>The shYft Doctor</Shyft>
          </div>
          <div className="opacity-70 text-sm">shyftdoctor.com</div>
        </Link>
        <Link
          href="/mastery"
          className="p-8 border-2 border-ink hover:bg-ink hover:text-paper transition-colors rounded-lg"
        >
          <div className="font-display text-3xl mb-2">
            <Shyft>shYft Mastery</Shyft>
          </div>
          <div className="opacity-70 text-sm">shyftmastery.com</div>
        </Link>
      </div>
      <div className="flex gap-4 text-sm">
        <Link href="/mastery/login" className="font-display hover:text-brand-y">
          <Shyft>Member Login</Shyft>
        </Link>
        <span className="opacity-30">·</span>
        <Link href="/mastery/admin" className="font-display hover:text-brand-y">
          <Shyft>Admin</Shyft>
        </Link>
      </div>
      <div className="text-xs opacity-50 pt-4 max-w-md">
        <Shyft>
          Seeded admins: jeff.cline@me.com · krystalore@crewsbeyondlimitsconsulting.com — password
          is whatever you set in SEED_ADMIN_PASSWORD (default TEMP!234). Force-reset on first
          login.
        </Shyft>
      </div>
    </main>
  );
}

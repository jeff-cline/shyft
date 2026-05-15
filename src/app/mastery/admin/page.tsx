import Link from "next/link";
import { Shyft } from "@/components/brand/Shyft";
import { getAdminStats, formatUSD } from "@/lib/stats";
import { backfillOrphanLeads } from "@/lib/backfill";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  lead: { label: "Lead", tone: "bg-brand-coral/15 text-brand-coral" },
  prospect: { label: "Prospect", tone: "bg-brand-y/15 text-brand-y" },
  customer: { label: "Customer", tone: "bg-brand-teal/15 text-ink" },
  lost: { label: "Lost", tone: "bg-ink/10 opacity-60" },
};

const SOURCE_LABEL: Record<string, string> = {
  free_gifts: "Free Gifts",
  mastery_form: "Get Started",
  doctor: "Doctor",
  affiliate_ref: "Affiliate",
  direct: "Direct",
};

const STATUS_BAR_COLOR: Record<string, string> = {
  lead: "bg-brand-coral",
  prospect: "bg-brand-y",
  customer: "bg-brand-teal",
  lost: "bg-ink/30",
};

export default async function AdminOverview() {
  await backfillOrphanLeads();
  const stats = await getAdminStats();

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">
            <Shyft>Overview</Shyft>
          </h1>
          <p className="opacity-70 mt-1">
            <Shyft>Snapshot of the funnel, today.</Shyft>
          </p>
        </div>
        <Link
          href="/mastery/admin/chat"
          className="font-display text-sm px-4 py-2 rounded-md border-2 border-ink hover:bg-ink hover:text-paper transition-colors"
        >
          <Shyft>Open Chat Inbox →</Shyft>
        </Link>
      </div>

      {/* Top-line tiles */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Leads"
          value={String(stats.totalLeads)}
          accent="brand-coral"
          href="/mastery/admin/leads"
        />
        <StatTile
          label="Customers (paid)"
          value={String(stats.totalCustomers)}
          accent="brand-teal"
          sublabel={`${stats.conversionRate}% conversion`}
        />
        <StatTile
          label="MRR"
          value={formatUSD(stats.mrrCents)}
          accent="brand-y"
          sublabel={`${stats.activeSubscriptions} active subscriptions`}
        />
        <StatTile
          label="Revenue this month"
          value={formatUSD(stats.revenueThisMonthCents)}
          accent="ink"
        />
      </section>

      {/* Funnel pipeline */}
      <section>
        <h2 className="font-display text-2xl mb-4">
          <Shyft>Funnel</Shyft>
        </h2>
        <div className="p-5 border border-ink/10 rounded-md bg-paper">
          {stats.byStatus.every((s) => s.count === 0) ? (
            <p className="opacity-60">
              <Shyft>No people in the system yet.</Shyft>
            </p>
          ) : (
            <div className="space-y-3">
              {stats.byStatus.map((row) => (
                <div key={row.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-display">
                      <Shyft>{row.label}</Shyft>
                    </span>
                    <span className="opacity-70">
                      {row.count} {row.count === 1 ? "person" : "people"} ·{" "}
                      {Math.round(row.percent)}%
                    </span>
                  </div>
                  <div className="h-3 bg-ink/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR_COLOR[row.status]}`}
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sources + Tiers row */}
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-2xl mb-4">
            <Shyft>Lead Sources</Shyft>
          </h2>
          <div className="p-5 border border-ink/10 rounded-md bg-paper">
            {stats.bySource.length === 0 ? (
              <p className="opacity-60">
                <Shyft>No sources logged yet.</Shyft>
              </p>
            ) : (
              <div className="space-y-3">
                {stats.bySource.map((row) => (
                  <div key={row.source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-display">
                        <Shyft>{row.label}</Shyft>
                      </span>
                      <span className="opacity-70">
                        {row.count} · {Math.round(row.percent)}%
                      </span>
                    </div>
                    <div className="h-3 bg-ink/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-y"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4">
            <Shyft>Paid Customers by Tier</Shyft>
          </h2>
          <div className="p-5 border border-ink/10 rounded-md bg-paper">
            {stats.byTier.length === 0 ? (
              <p className="opacity-60">
                <Shyft>No paid customers yet.</Shyft>
              </p>
            ) : (
              <ul className="space-y-2">
                {stats.byTier.map((row) => (
                  <li key={row.tier} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-display">
                        <Shyft>{row.label}</Shyft>
                      </span>
                    </span>
                    <span className="font-display text-xl">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-2xl mb-4">
            <Shyft>Recent Leads</Shyft>
          </h2>
          <div className="border border-ink/10 rounded-md bg-paper overflow-hidden">
            {stats.recentLeads.length === 0 ? (
              <p className="p-5 opacity-60">
                <Shyft>No leads yet.</Shyft>
              </p>
            ) : (
              <ul className="divide-y divide-ink/10">
                {stats.recentLeads.map((u) => {
                  const status = STATUS_LABEL[u.status] ?? { label: u.status, tone: "bg-ink/10" };
                  return (
                    <li key={u.id}>
                      <Link
                        href={`/mastery/admin/users/${u.id}`}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-ink/5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{u.name || u.email}</div>
                          <div className="text-xs opacity-60 truncate">
                            {u.email} ·{" "}
                            {u.leadSource ? SOURCE_LABEL[u.leadSource] ?? u.leadSource : "direct"}
                          </div>
                        </div>
                        <span className={`text-xs font-display px-2 py-0.5 rounded-full ${status.tone}`}>
                          <Shyft>{status.label}</Shyft>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4">
            <Shyft>Recent Subscriptions</Shyft>
          </h2>
          <div className="border border-ink/10 rounded-md bg-paper overflow-hidden">
            {stats.recentSubscriptions.length === 0 ? (
              <p className="p-5 opacity-60">
                <Shyft>No subscriptions yet. Enable Stripe in Settings to start collecting.</Shyft>
              </p>
            ) : (
              <ul className="divide-y divide-ink/10">
                {stats.recentSubscriptions.map((s) => (
                  <li key={s.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{s.userName || s.userEmail}</div>
                      <div className="text-xs opacity-60 truncate">
                        {s.tier} · {s.status}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatTile({
  label,
  value,
  sublabel,
  accent,
  href,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent: "brand-y" | "brand-coral" | "brand-teal" | "ink";
  href?: string;
}) {
  const accentClass = {
    "brand-y": "border-brand-y",
    "brand-coral": "border-brand-coral",
    "brand-teal": "border-brand-teal",
    ink: "border-ink",
  }[accent];

  const inner = (
    <div className={`p-5 border-l-4 ${accentClass} border-y border-r border-ink/10 rounded-r-md bg-paper`}>
      <div className="text-xs uppercase tracking-widest opacity-60 mb-1">
        <Shyft>{label}</Shyft>
      </div>
      <div className="font-display text-3xl md:text-4xl">{value}</div>
      {sublabel && (
        <div className="text-xs opacity-60 mt-1">
          <Shyft>{sublabel}</Shyft>
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

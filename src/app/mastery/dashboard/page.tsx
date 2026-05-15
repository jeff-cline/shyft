import Link from "next/link";
import { Shyft } from "@/components/brand/Shyft";
import { CTAButton } from "@/components/brand/CTAButton";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { TIERS, tierFromString } from "@/lib/tiers";
import { ChatPanel } from "./ChatPanel";

export default async function DashboardPage() {
  const user = await requireUser();

  const [publicNotes, videos, upcoming, unreadAdminMessageCount] = await Promise.all([
    prisma.note.findMany({
      where: { targetUserId: user.id, visibility: "public_to_user" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.video.findMany({
      where: user.currentTier !== "none" ? { tierRequired: user.currentTier } : { id: "__none__" },
      orderBy: { sortOrder: "asc" },
      take: 12,
    }),
    prisma.calendarEvent.findMany({
      where: { startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 10,
    }),
    prisma.chatMessage.count({
      where: { threadUserId: user.id, readAt: null, authorId: { not: user.id } },
    }),
  ]);

  const visibleEvents = upcoming.filter((ev) => {
    const tiers = ev.tierVisibility.split(",").map((t) => t.trim());
    return tiers.includes(user.currentTier);
  });

  // Lock screen — paid=false customers see a teaser
  if (user.role === "customer" && !user.paid) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="p-10 border-2 border-brand-y rounded-xl bg-brand-y/5">
          <h1 className="font-display text-4xl md:text-5xl mb-3">
            <Shyft>You&apos;re almost in.</Shyft>
          </h1>
          <p className="text-lg opacity-85 mb-6">
            <Shyft>
              You have{" "}
              <span className="text-brand-y font-bold">{publicNotes.length}</span> note
              {publicNotes.length === 1 ? "" : "s"} waiting and{" "}
              <span className="text-brand-y font-bold">{unreadAdminMessageCount}</span> message
              {unreadAdminMessageCount === 1 ? "" : "s"} from your guide. Start your membership to
              unlock everything.
            </Shyft>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <CTAButton href="/mastery/membership" variant="primary">
              Start Membership — $497/mo
            </CTAButton>
            <CTAButton href="/doctor/book" variant="secondary">
              Talk First — Free Call
            </CTAButton>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="font-display text-4xl md:text-6xl">
          <Shyft>Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}.</Shyft>
        </h1>
        <p className="opacity-70 mt-2">
          <Shyft>
            Current tier: <strong>{TIERS[tierFromString(user.currentTier)].label}</strong>
          </Shyft>
        </p>
      </div>

      {/* Upgrade tiles — only admin-toggled ones */}
      <UpgradeTiles user={user} />

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="font-display text-2xl mb-4">
            <Shyft>Notes from your guide</Shyft>
          </h2>
          {publicNotes.length === 0 ? (
            <p className="opacity-60">
              <Shyft>No notes yet. They&apos;ll appear here.</Shyft>
            </p>
          ) : (
            <ul className="space-y-3">
              {publicNotes.map((n) => (
                <li key={n.id} className="p-4 border border-ink/10 rounded-md bg-paper">
                  <div className="text-xs opacity-50 mb-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                  <div className="whitespace-pre-wrap">{n.body}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl mb-4">
            <Shyft>Chat with your guide</Shyft>
          </h2>
          <ChatPanel userId={user.id} userRole="customer" />
        </section>
      </div>

      <section>
        <h2 className="font-display text-2xl mb-4">
          <Shyft>Videos</Shyft>
        </h2>
        {videos.length === 0 ? (
          <p className="opacity-60">
            <Shyft>Your video library will appear here as your guide adds content for your tier.</Shyft>
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => (
              <a
                key={v.id}
                href={v.urlOrPath}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-ink/10 rounded-md hover:border-brand-y transition-colors bg-paper block"
              >
                <div className="font-display text-lg mb-1">
                  <Shyft>{v.title}</Shyft>
                </div>
                <div className="text-xs opacity-50">{v.sourceKind === "external_url" ? "Link" : "Upload"}</div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">
          <Shyft>Upcoming on the calendar</Shyft>
        </h2>
        {visibleEvents.length === 0 ? (
          <p className="opacity-60">
            <Shyft>Nothing scheduled yet for your tier.</Shyft>
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleEvents.map((ev) => (
              <li
                key={ev.id}
                className="p-4 border-l-4 border border-ink/10 rounded-r-md flex items-start justify-between gap-4"
                style={{ borderLeftColor: ev.colorCode }}
              >
                <div>
                  <div className="font-display text-lg">
                    <Shyft>{ev.title}</Shyft>
                  </div>
                  {ev.description && (
                    <div className="text-sm opacity-70 mt-1">{ev.description}</div>
                  )}
                </div>
                <div className="text-sm opacity-70 whitespace-nowrap">
                  {new Date(ev.startsAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

async function UpgradeTiles({
  user,
}: {
  user: {
    upgradeShowMastery: boolean;
    upgradeShowPrivate: boolean;
    upgradeShowRetreat: boolean;
    upgradeShowFitness: boolean;
  };
}) {
  const shown: Array<"mastery" | "private" | "retreat" | "fitness"> = [];
  if (user.upgradeShowMastery) shown.push("mastery");
  if (user.upgradeShowPrivate) shown.push("private");
  if (user.upgradeShowRetreat) shown.push("retreat");
  if (user.upgradeShowFitness) shown.push("fitness");

  if (shown.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl mb-4">
        <Shyft>Available next steps</Shyft>
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {shown.map((key) => {
          const tier = TIERS[key];
          return (
            <Link
              key={key}
              href={`/mastery/membership?upgrade=${key}`}
              className="p-6 border-2 rounded-xl hover:shadow-lg transition-all block"
              style={{ borderColor: tier.color }}
            >
              <div className="font-display text-xl mb-1" style={{ color: tier.color }}>
                <Shyft>{tier.label}</Shyft>
              </div>
              <div className="font-display text-2xl mb-2">
                <Shyft>{tier.priceLabel}</Shyft>
              </div>
              <div className="text-sm opacity-75">
                <Shyft>{tier.blurb}</Shyft>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

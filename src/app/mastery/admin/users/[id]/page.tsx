import Link from "next/link";
import { notFound } from "next/navigation";
import { Shyft } from "@/components/brand/Shyft";
import { prisma } from "@/lib/db";
import { TIERS, tierFromString } from "@/lib/tiers";
import { UserControls } from "./UserControls";
import { NotesEditor } from "./NotesEditor";
import { ChatPanel } from "@/app/mastery/dashboard/ChatPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

const SOURCE_LABEL: Record<string, string> = {
  free_gifts: "Free Gifts",
  mastery_form: "Get Started",
  doctor: "Doctor",
  affiliate_ref: "Affiliate",
  direct: "Direct",
};

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  lead: { label: "Lead", tone: "bg-brand-coral text-paper" },
  prospect: { label: "Prospect", tone: "bg-brand-y text-paper" },
  customer: { label: "Customer", tone: "bg-brand-teal text-ink" },
  lost: { label: "Lost", tone: "bg-ink/30 text-ink" },
};

export default async function UserDetail({ params }: PageProps) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      notesAboutMe: { orderBy: { createdAt: "desc" }, take: 50 },
      subscription: true,
      affiliate: true,
    },
  });
  if (!user) notFound();

  const statusInfo = STATUS_LABEL[user.status] ?? { label: user.status, tone: "bg-ink/20" };
  const sourceLabel = user.leadSource ? SOURCE_LABEL[user.leadSource] ?? user.leadSource : null;
  const tier = TIERS[tierFromString(user.currentTier)];

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div>
        <Link href="/mastery/admin/leads" className="text-sm opacity-70 hover:text-brand-y">
          ← Back to leads
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <h1 className="font-display text-4xl md:text-5xl">
            <Shyft>{user.name || user.email}</Shyft>
          </h1>
          <span className={`font-display text-sm px-3 py-1 rounded-full ${statusInfo.tone}`}>
            <Shyft>{statusInfo.label}</Shyft>
          </span>
          <span className="text-sm opacity-70">
            <Shyft>Tier: {tier.label}</Shyft>
          </span>
          {user.paid && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-teal/20 text-ink">
              <Shyft>Paid</Shyft>
            </span>
          )}
        </div>
        <p className="opacity-70 mt-1">{user.email}</p>
      </div>

      <section className="grid md:grid-cols-4 gap-3">
        <InfoTile label="Phone" value={user.phone || "—"} />
        <InfoTile label="Lead Source" value={sourceLabel || "—"} />
        <InfoTile label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
        <InfoTile
          label="Subscription"
          value={user.subscription?.status ?? "none"}
        />
        {user.intakeMessage && (
          <div className="md:col-span-4 p-4 border-l-4 border-brand-y bg-brand-y/5 rounded-r-md">
            <div className="text-xs uppercase tracking-widest opacity-60 mb-1">
              <Shyft>Intake Message</Shyft>
            </div>
            <div className="whitespace-pre-wrap">{user.intakeMessage}</div>
          </div>
        )}
      </section>

      <UserControls
        userId={user.id}
        initial={{
          role: user.role,
          status: user.status,
          currentTier: user.currentTier,
          paid: user.paid,
          upgradeShowMastery: user.upgradeShowMastery,
          upgradeShowPrivate: user.upgradeShowPrivate,
          upgradeShowRetreat: user.upgradeShowRetreat,
          upgradeShowFitness: user.upgradeShowFitness,
        }}
      />

      <section>
        <h2 className="font-display text-2xl mb-4">
          <Shyft>Notes</Shyft>
        </h2>
        <NotesEditor
          targetUserId={user.id}
          notes={user.notesAboutMe.map((n) => ({
            id: n.id,
            body: n.body,
            visibility: n.visibility,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">
          <Shyft>Chat</Shyft>
        </h2>
        <ChatPanel userId={user.id} userRole="admin" />
      </section>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 border border-ink/10 rounded-md bg-paper">
      <div className="text-xs uppercase tracking-widest opacity-60 mb-1">
        <Shyft>{label}</Shyft>
      </div>
      <div className="font-display text-lg">{value}</div>
    </div>
  );
}

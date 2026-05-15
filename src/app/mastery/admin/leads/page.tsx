import { Shyft } from "@/components/brand/Shyft";
import { prisma } from "@/lib/db";
import { backfillOrphanLeads } from "@/lib/backfill";
import { LeadRow } from "./LeadRow";

const DISPOSITIONS = ["new", "contacted", "booked", "joined", "lost"] as const;

const SOURCE_LABEL: Record<string, string> = {
  free_gifts: "Free Gifts",
  mastery_form: "Get Started",
  doctor: "Doctor",
  affiliate_ref: "Affiliate",
  direct: "Direct",
};

export default async function LeadsPage() {
  await backfillOrphanLeads();
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  // Build map: email -> userId for pre-conversion lookup (in case convertedUserId missing on old rows)
  const emails = Array.from(new Set(leads.map((l) => l.email.toLowerCase())));
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true },
  });
  const userIdByEmail = new Map(users.map((u) => [u.email, u.id]));

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl mb-2">
        <Shyft>Leads</Shyft>
      </h1>
      <p className="opacity-70 mb-8">
        <Shyft>
          {leads.length} total. Click a name to open the full profile — notes, tier toggles,
          status, chat.
        </Shyft>
      </p>

      {leads.length === 0 ? (
        <div className="p-8 border border-dashed border-ink/30 rounded-md text-center opacity-60">
          <Shyft>No leads yet. They show up here the moment someone submits a form.</Shyft>
        </div>
      ) : (
        <div className="border border-ink/10 rounded-md bg-paper overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 font-display">
              <tr>
                <Th>When</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Source</Th>
                <Th>Disposition</Th>
                <Th>Message</Th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <LeadRow
                  key={l.id}
                  lead={{
                    id: l.id,
                    createdAt: l.createdAt.toISOString(),
                    name: l.name,
                    email: l.email,
                    phone: l.phone,
                    source: l.source,
                    sourceLabel: SOURCE_LABEL[l.source] ?? l.source.replace(/_/g, " "),
                    disposition: l.disposition,
                    message: l.message,
                    userId: l.convertedUserId ?? userIdByEmail.get(l.email.toLowerCase()) ?? null,
                  }}
                  dispositions={[...DISPOSITIONS]}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 border-b border-ink/10 whitespace-nowrap">{children}</th>;
}

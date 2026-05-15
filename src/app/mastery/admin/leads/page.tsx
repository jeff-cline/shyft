import { Shyft } from "@/components/brand/Shyft";
import { prisma } from "@/lib/db";
import { LeadRow } from "./LeadRow";

const DISPOSITIONS = ["new", "contacted", "booked", "joined", "lost"] as const;

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl mb-2">
        <Shyft>Leads</Shyft>
      </h1>
      <p className="opacity-70 mb-8">
        <Shyft>{leads.length} total. Newest first. Click disposition to update.</Shyft>
      </p>

      {leads.length === 0 ? (
        <div className="p-8 border border-dashed border-ink/30 rounded-md text-center opacity-60">
          <Shyft>No leads yet. They show up here the moment someone submits the form.</Shyft>
        </div>
      ) : (
        <div className="border border-ink/10 rounded-md bg-paper overflow-hidden">
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
                <LeadRow key={l.id} lead={{
                  id: l.id,
                  createdAt: l.createdAt.toISOString(),
                  name: l.name,
                  email: l.email,
                  phone: l.phone,
                  source: l.source,
                  disposition: l.disposition,
                  message: l.message,
                }} dispositions={[...DISPOSITIONS]} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 border-b border-ink/10">{children}</th>;
}

import { Shyft } from "@/components/brand/Shyft";
import { prisma } from "@/lib/db";
import { TIERS } from "@/lib/tiers";
import { CalendarManager } from "./CalendarManager";

export default async function CalendarAdmin() {
  const events = await prisma.calendarEvent.findMany({ orderBy: { startsAt: "asc" } });

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-4xl md:text-5xl mb-2">
          <Shyft>Calendar</Shyft>
        </h1>
        <p className="opacity-70">
          <Shyft>Schedule events. Pick which tiers can see them. Each tier has its own color.</Shyft>
        </p>
      </div>
      <CalendarManager
        tierOptions={Object.values(TIERS)
          .filter((t) => t.key !== "none")
          .map((t) => ({ key: t.key, label: t.label, color: t.color }))}
        initial={events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          startsAt: e.startsAt.toISOString(),
          endsAt: e.endsAt.toISOString(),
          tierVisibility: e.tierVisibility,
          colorCode: e.colorCode,
        }))}
      />
    </main>
  );
}

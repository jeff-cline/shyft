"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

export async function createEvent(input: {
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  tierVisibility: string;
  colorCode: string;
}) {
  await requireAdmin();
  if (!input.title.trim()) return { ok: false };
  const event = await prisma.calendarEvent.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      tierVisibility: input.tierVisibility,
      colorCode: input.colorCode,
    },
  });
  return {
    ok: true,
    event: {
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      tierVisibility: event.tierVisibility,
      colorCode: event.colorCode,
    },
  };
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  await prisma.calendarEvent.delete({ where: { id } });
  return { ok: true };
}

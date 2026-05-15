"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateLeadDisposition(leadId: string, disposition: string) {
  await requireAdmin();
  const allowed = ["new", "contacted", "booked", "joined", "lost"];
  if (!allowed.includes(disposition)) return { ok: false };
  await prisma.lead.update({ where: { id: leadId }, data: { disposition } });
  revalidatePath("/mastery/admin/leads");
  return { ok: true };
}

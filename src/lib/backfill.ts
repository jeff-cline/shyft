import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

/**
 * Self-healing: any Lead row without a linked User (from before the schema
 * migration) gets a User row created and the Lead.convertedUserId set.
 * Idempotent — does nothing once all leads are linked. Capped at 100 per call
 * so it doesn't stall a page render on a huge backlog.
 */
export async function backfillOrphanLeads(): Promise<void> {
  const orphans = await prisma.lead.findMany({
    where: { convertedUserId: null },
    take: 100,
  });
  if (orphans.length === 0) return;

  for (const lead of orphans) {
    const email = lead.email.toLowerCase().trim();
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const unguessable = randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(unguessable, 10);
      user = await prisma.user.create({
        data: {
          email,
          name: lead.name,
          phone: lead.phone,
          role: "customer",
          status: "lead",
          leadSource: lead.source,
          intakeMessage: lead.message,
          passwordHash: hash,
          mustResetPassword: false,
          currentTier: "none",
          paid: false,
        },
      });
      if (lead.message?.trim()) {
        await prisma.note.create({
          data: {
            targetUserId: user.id,
            authorId: user.id,
            body: `[Intake / ${lead.source}] ${lead.message.trim()}`,
            visibility: "private_admin",
          },
        });
      }
    }
    await prisma.lead.update({
      where: { id: lead.id },
      data: { convertedUserId: user.id },
    });
  }
}

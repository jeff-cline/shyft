import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  affiliateRef?: string;
}

/**
 * Create a Lead row AND upsert a User row for the same email so that all the
 * existing notes / tier / chat / dashboard UI works for leads from day one.
 *
 * If a User with that email already exists:
 *   - keep their existing password/role/status/etc.
 *   - just refresh phone, leadSource, name if those were empty.
 * If not, create a new User in status='lead' with an unguessable password hash
 * (they can't log in until they claim the account via signup or pay via Stripe).
 *
 * Returns { lead, user } so callers can chain (e.g., write an intake note).
 */
export async function createLead(input: LeadInput) {
  const email = input.email.toLowerCase().trim();
  const source = input.source ?? "mastery_form";

  // Upsert the user
  const existing = await prisma.user.findUnique({ where: { email } });
  let user;
  if (existing) {
    user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: existing.name ?? input.name,
        phone: existing.phone ?? input.phone ?? null,
        leadSource: existing.leadSource ?? source,
        intakeMessage: existing.intakeMessage ?? input.message ?? null,
      },
    });
  } else {
    const unguessable = randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(unguessable, 10);
    user = await prisma.user.create({
      data: {
        email,
        name: input.name,
        phone: input.phone,
        role: "customer",
        status: "lead",
        leadSource: source,
        intakeMessage: input.message,
        passwordHash: hash,
        mustResetPassword: false,
        currentTier: "none",
        paid: false,
      },
    });

    // Auto-record the intake message as the first private admin note so it
    // shows in the timeline. Author = the user themselves (we have no admin context here).
    if (input.message?.trim()) {
      await prisma.note.create({
        data: {
          targetUserId: user.id,
          authorId: user.id,
          body: `[Intake / ${source}] ${input.message.trim()}`,
          visibility: "private_admin",
        },
      });
    }
  }

  // Audit-trail row in Lead table (every form submission gets a row, even repeats)
  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      email,
      phone: input.phone,
      message: input.message,
      source,
      affiliateRef: input.affiliateRef,
      disposition: "new",
      convertedUserId: user.id,
    },
  });

  return { lead, user };
}

export async function listLeads() {
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}

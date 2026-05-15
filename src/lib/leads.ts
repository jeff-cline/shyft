import { prisma } from "@/lib/db";

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  affiliateRef?: string;
}

export async function createLead(input: LeadInput) {
  return prisma.lead.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      source: input.source ?? "mastery_form",
      affiliateRef: input.affiliateRef,
      disposition: "new",
    },
  });
}

export async function listLeads() {
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}

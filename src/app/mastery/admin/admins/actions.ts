"use server";

import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

export async function addAdmin(input: {
  email: string;
  name: string | null;
  tempPassword: string;
}) {
  await requireAdmin();
  const email = input.email.toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Invalid email." };
  }
  if (input.tempPassword.length < 8) {
    return { ok: false, error: "Temporary password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "A user with that email already exists." };
  }

  const hash = await bcrypt.hash(input.tempPassword, 10);
  const admin = await prisma.user.create({
    data: {
      email,
      name: input.name,
      passwordHash: hash,
      role: "admin",
      mustResetPassword: true,
      currentTier: "none",
      paid: true,
    },
  });
  return {
    ok: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      createdAt: admin.createdAt.toISOString(),
    },
  };
}

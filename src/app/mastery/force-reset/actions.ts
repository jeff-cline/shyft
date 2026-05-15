"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export interface ResetResult {
  ok: boolean;
  error?: string;
  redirectTo: string;
}

export async function forceResetAction(formData: FormData): Promise<ResetResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Not signed in.", redirectTo: "/mastery/login" };
  }

  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters.", redirectTo: "/mastery/force-reset" };
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords don't match.", redirectTo: "/mastery/force-reset" };
  }

  const hash = await bcrypt.hash(password, 10);
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hash, mustResetPassword: false },
  });

  const dest =
    updated.role === "admin"
      ? "/mastery/admin"
      : updated.role === "affiliate"
      ? "/mastery/affiliate"
      : "/mastery/dashboard";
  return { ok: true, redirectTo: dest };
}

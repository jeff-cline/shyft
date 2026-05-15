"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";

export interface SignupResult {
  ok: boolean;
  error?: string;
  redirectTo: string;
}

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!name || !email || !password) {
    return { ok: false, error: "All fields required.", redirectTo: "/mastery/signup" };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters.", redirectTo: "/mastery/signup" };
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords don't match.", redirectTo: "/mastery/signup" };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Invalid email.", redirectTo: "/mastery/signup" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists. Log in instead.", redirectTo: "/mastery/signup" };
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hash,
      role: "customer",
      mustResetPassword: false,
      currentTier: "none",
      paid: false,
    },
  });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return { ok: true, redirectTo: "/mastery/login" };
  }

  return { ok: true, redirectTo: "/mastery/dashboard" };
}

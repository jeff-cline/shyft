"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { AuthError } from "next-auth";

export interface LoginResult {
  ok: boolean;
  error?: string;
  redirectTo: string;
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const callbackUrl = String(formData.get("callbackUrl") || "");

  if (!email || !password) {
    return { ok: false, error: "Email and password required.", redirectTo: "/mastery/login" };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        ok: false,
        error: "Invalid email or password.",
        redirectTo: "/mastery/login",
      };
    }
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, error: "Account not found.", redirectTo: "/mastery/login" };
  }

  if (user.mustResetPassword) {
    return { ok: true, redirectTo: "/mastery/force-reset" };
  }

  if (callbackUrl && callbackUrl.startsWith("/")) {
    return { ok: true, redirectTo: callbackUrl };
  }

  const dest =
    user.role === "admin"
      ? "/mastery/admin"
      : user.role === "affiliate"
      ? "/mastery/affiliate"
      : "/mastery/dashboard";
  return { ok: true, redirectTo: dest };
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/mastery/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/mastery/login");
  // Authoritative check from DB, not the cached JWT — the JWT is stale immediately
  // after force-reset until the next sign-in.
  if (user.mustResetPassword) redirect("/mastery/force-reset");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/mastery/dashboard");
  return user;
}

export async function requireAffiliate() {
  const user = await requireUser();
  if (user.role !== "affiliate" && user.role !== "admin") redirect("/mastery/dashboard");
  return user;
}

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
  // Admins live on shyftdoctor.com — route unauthenticated/unprivileged access to the
  // doctor-side login/reset, independent of the member funnel's /mastery auth pages.
  const session = await auth();
  if (!session?.user) redirect("/doctor/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/doctor/login");
  if (user.mustResetPassword) redirect("/doctor/force-reset");
  if (user.role !== "admin") redirect("/doctor/login");
  return user;
}

export async function requireAffiliate() {
  const user = await requireUser();
  if (user.role !== "affiliate" && user.role !== "admin") redirect("/mastery/dashboard");
  return user;
}

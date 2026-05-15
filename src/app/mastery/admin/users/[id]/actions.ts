"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

export interface UserControlPayload {
  role: string;
  status: string;
  currentTier: string;
  paid: boolean;
  upgradeShowMastery: boolean;
  upgradeShowPrivate: boolean;
  upgradeShowRetreat: boolean;
  upgradeShowFitness: boolean;
}

export async function updateUserControls(userId: string, payload: UserControlPayload) {
  await requireAdmin();
  const allowedRoles = ["customer", "affiliate", "admin"];
  const allowedStatus = ["lead", "prospect", "customer", "lost"];
  if (!allowedRoles.includes(payload.role)) return { ok: false };
  if (!allowedStatus.includes(payload.status)) return { ok: false };

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: payload.role,
      status: payload.status,
      currentTier: payload.currentTier,
      paid: payload.paid,
      upgradeShowMastery: payload.upgradeShowMastery,
      upgradeShowPrivate: payload.upgradeShowPrivate,
      upgradeShowRetreat: payload.upgradeShowRetreat,
      upgradeShowFitness: payload.upgradeShowFitness,
    },
  });
  revalidatePath(`/mastery/admin/users/${userId}`);
  return { ok: true };
}

export async function addNote(targetUserId: string, body: string, visibility: string) {
  const admin = await requireAdmin();
  const text = body.trim();
  if (!text) return { ok: false };
  const vis = visibility === "public_to_user" ? "public_to_user" : "private_admin";
  const note = await prisma.note.create({
    data: { targetUserId, authorId: admin.id, body: text, visibility: vis },
  });
  return {
    ok: true,
    note: {
      id: note.id,
      body: note.body,
      visibility: note.visibility,
      createdAt: note.createdAt.toISOString(),
    },
  };
}

export async function deleteNote(noteId: string) {
  await requireAdmin();
  await prisma.note.delete({ where: { id: noteId } });
  return { ok: true };
}

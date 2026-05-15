"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function loadChat(threadUserId: string) {
  const session = await auth();
  if (!session?.user) return [];
  const isAdmin = session.user.role === "admin";
  if (!isAdmin && session.user.id !== threadUserId) return [];

  const msgs = await prisma.chatMessage.findMany({
    where: { threadUserId },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  // Mark messages as read when the rightful viewer fetches them
  const viewerId = session.user.id;
  await prisma.chatMessage.updateMany({
    where: {
      threadUserId,
      readAt: null,
      authorId: { not: viewerId },
    },
    data: { readAt: new Date() },
  });

  return msgs.map((m) => ({
    id: m.id,
    body: m.body,
    authorId: m.authorId,
    createdAt: m.createdAt.toISOString(),
    readAt: m.readAt?.toISOString() ?? null,
  }));
}

export async function sendChat(threadUserId: string, body: string) {
  const session = await auth();
  if (!session?.user) return { ok: false };
  const text = body.trim();
  if (!text) return { ok: false };

  const isAdmin = session.user.role === "admin";
  if (!isAdmin && session.user.id !== threadUserId) return { ok: false };

  await prisma.chatMessage.create({
    data: {
      threadUserId,
      authorId: session.user.id,
      body: text,
    },
  });
  return { ok: true };
}

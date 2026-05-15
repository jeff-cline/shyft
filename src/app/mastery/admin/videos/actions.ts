"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

export async function createVideo(input: {
  title: string;
  urlOrPath: string;
  tierRequired: string;
}) {
  await requireAdmin();
  if (!input.title.trim() || !input.urlOrPath.trim()) return { ok: false };
  const last = await prisma.video.findFirst({ orderBy: { sortOrder: "desc" } });
  const video = await prisma.video.create({
    data: {
      title: input.title.trim(),
      urlOrPath: input.urlOrPath.trim(),
      sourceKind: "external_url",
      tierRequired: input.tierRequired,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
  return {
    ok: true,
    video: {
      id: video.id,
      title: video.title,
      sourceKind: video.sourceKind,
      urlOrPath: video.urlOrPath,
      tierRequired: video.tierRequired,
      sortOrder: video.sortOrder,
    },
  };
}

export async function deleteVideo(id: string) {
  await requireAdmin();
  await prisma.video.delete({ where: { id } });
  return { ok: true };
}

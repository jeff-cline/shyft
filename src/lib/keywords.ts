import { prisma } from "@/lib/db";

/**
 * Record one inbound use of an ad keyword (from the `?kw=` param). Fire-and-forget;
 * a failure must never break the landing page render.
 */
export async function recordKeywordHit(keyword: string): Promise<void> {
  const k = keyword.trim().slice(0, 60);
  if (!k) return;
  try {
    await prisma.keywordHit.upsert({
      where: { keyword: k },
      update: { count: { increment: 1 } },
      create: { keyword: k, count: 1 },
    });
  } catch (err) {
    console.error("[keywords] record failed:", err);
  }
}

export async function getKeywordCloud(limit = 60) {
  try {
    return await prisma.keywordHit.findMany({ orderBy: { count: "desc" }, take: limit });
  } catch {
    return [];
  }
}

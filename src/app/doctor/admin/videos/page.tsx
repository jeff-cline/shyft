import { Shyft } from "@/components/brand/Shyft";
import { prisma } from "@/lib/db";
import { TIERS } from "@/lib/tiers";
import { VideoManager } from "./VideoManager";

export default async function VideosAdmin() {
  const videos = await prisma.video.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-4xl md:text-5xl mb-2">
          <Shyft>Videos</Shyft>
        </h1>
        <p className="opacity-70">
          <Shyft>Add videos by URL (YouTube, Vimeo, Loom) or upload later. Set the required tier.</Shyft>
        </p>
      </div>
      <VideoManager
        tierOptions={Object.values(TIERS)
          .filter((t) => t.key !== "none")
          .map((t) => ({ key: t.key, label: t.label }))}
        initial={videos.map((v) => ({
          id: v.id,
          title: v.title,
          sourceKind: v.sourceKind,
          urlOrPath: v.urlOrPath,
          tierRequired: v.tierRequired,
          sortOrder: v.sortOrder,
        }))}
      />
    </main>
  );
}

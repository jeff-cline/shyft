"use client";

import { useState, useTransition } from "react";
import { Shyft } from "@/components/brand/Shyft";
import { createVideo, deleteVideo } from "./actions";

interface Video {
  id: string;
  title: string;
  sourceKind: string;
  urlOrPath: string;
  tierRequired: string;
  sortOrder: number;
}

interface TierOpt {
  key: string;
  label: string;
}

export function VideoManager({
  initial,
  tierOptions,
}: {
  initial: Video[];
  tierOptions: TierOpt[];
}) {
  const [videos, setVideos] = useState<Video[]>(initial);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tier, setTier] = useState(tierOptions[0]?.key || "mastery");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!title.trim() || !url.trim()) return;
    startTransition(async () => {
      const result = await createVideo({
        title: title.trim(),
        urlOrPath: url.trim(),
        tierRequired: tier,
      });
      if (result.ok && result.video) {
        setVideos((v) => [...v, result.video!]);
        setTitle("");
        setUrl("");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteVideo(id);
      setVideos((v) => v.filter((x) => x.id !== id));
    });
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border border-ink/10 rounded-md bg-paper grid md:grid-cols-4 gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube / Vimeo / Loom URL"
          className="border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink md:col-span-2"
        />
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="border border-ink/20 rounded px-3 py-2 bg-paper"
        >
          {tierOptions.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={isPending || !title.trim() || !url.trim()}
          className="md:col-span-4 bg-brand-y text-paper font-display px-4 py-2 rounded-md disabled:opacity-50"
        >
          <Shyft>{isPending ? "Adding..." : "Add Video"}</Shyft>
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="p-8 border border-dashed border-ink/30 rounded-md text-center opacity-60">
          <Shyft>No videos yet.</Shyft>
        </div>
      ) : (
        <ul className="space-y-2">
          {videos.map((v) => (
            <li
              key={v.id}
              className="p-3 border border-ink/10 rounded-md bg-paper flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg truncate">
                  <Shyft>{v.title}</Shyft>
                </div>
                <div className="text-xs opacity-60 truncate">
                  {v.tierRequired} · <a href={v.urlOrPath} target="_blank" rel="noreferrer" className="underline">{v.urlOrPath}</a>
                </div>
              </div>
              <button
                onClick={() => handleDelete(v.id)}
                className="text-xs opacity-50 hover:text-red-600"
              >
                delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

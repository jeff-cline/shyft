"use client";

import { useState, useTransition } from "react";
import { Shyft } from "@/components/brand/Shyft";
import { createEvent, deleteEvent } from "./actions";

interface Event {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  tierVisibility: string;
  colorCode: string;
}

interface TierOpt {
  key: string;
  label: string;
  color: string;
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CalendarManager({
  initial,
  tierOptions,
}: {
  initial: Event[];
  tierOptions: TierOpt[];
}) {
  const [events, setEvents] = useState<Event[]>(initial);
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState(toLocalInput(now));
  const [endsAt, setEndsAt] = useState(toLocalInput(oneHourLater));
  const [selectedTiers, setSelectedTiers] = useState<string[]>(tierOptions.map((t) => t.key));
  const [color, setColor] = useState(tierOptions[0]?.color || "#D2691E");
  const [isPending, startTransition] = useTransition();

  function toggleTier(key: string) {
    setSelectedTiers((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  }

  function handleAdd() {
    if (!title.trim() || selectedTiers.length === 0) return;
    startTransition(async () => {
      const result = await createEvent({
        title: title.trim(),
        description: description.trim() || null,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        tierVisibility: selectedTiers.join(","),
        colorCode: color,
      });
      if (result.ok && result.event) {
        setEvents((e) => [...e, result.event!]);
        setTitle("");
        setDescription("");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteEvent(id);
      setEvents((e) => e.filter((x) => x.id !== id));
    });
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border border-ink/10 rounded-md bg-paper space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="w-full border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block opacity-70 mb-1">Starts</span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
            />
          </label>
          <label className="text-sm">
            <span className="block opacity-70 mb-1">Ends</span>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
            />
          </label>
        </div>
        <div>
          <div className="text-sm opacity-70 mb-1">Visible to tiers</div>
          <div className="flex flex-wrap gap-2">
            {tierOptions.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => toggleTier(t.key)}
                className={`px-3 py-1.5 rounded-md border-2 text-sm transition-colors ${
                  selectedTiers.includes(t.key)
                    ? "text-paper"
                    : "bg-paper"
                }`}
                style={{
                  borderColor: t.color,
                  backgroundColor: selectedTiers.includes(t.key) ? t.color : undefined,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm flex items-center gap-2">
            <span>Color</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-8 border-0 rounded"
            />
          </label>
          <button
            onClick={handleAdd}
            disabled={isPending || !title.trim() || selectedTiers.length === 0}
            className="ml-auto bg-brand-y text-paper font-display px-4 py-2 rounded-md disabled:opacity-50"
          >
            <Shyft>{isPending ? "Adding..." : "Add Event"}</Shyft>
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="p-8 border border-dashed border-ink/30 rounded-md text-center opacity-60">
          <Shyft>No events yet.</Shyft>
        </div>
      ) : (
        <ul className="space-y-2">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="p-3 border-l-4 border border-ink/10 rounded-r-md bg-paper flex items-start justify-between gap-3"
              style={{ borderLeftColor: ev.colorCode }}
            >
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg">
                  <Shyft>{ev.title}</Shyft>
                </div>
                <div className="text-xs opacity-60">
                  {new Date(ev.startsAt).toLocaleString()} → {new Date(ev.endsAt).toLocaleString()} ·{" "}
                  {ev.tierVisibility}
                </div>
                {ev.description && <div className="text-sm opacity-75 mt-1">{ev.description}</div>}
              </div>
              <button
                onClick={() => handleDelete(ev.id)}
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

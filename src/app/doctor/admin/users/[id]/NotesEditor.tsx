"use client";

import { useState, useTransition } from "react";
import { Shyft } from "@/components/brand/Shyft";
import { addNote, deleteNote } from "./actions";

interface NoteLite {
  id: string;
  body: string;
  visibility: string;
  createdAt: string;
}

export function NotesEditor({
  targetUserId,
  notes: initialNotes,
}: {
  targetUserId: string;
  notes: NoteLite[];
}) {
  const [notes, setNotes] = useState<NoteLite[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const [visibility, setVisibility] = useState<"private_admin" | "public_to_user">("private_admin");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    const body = draft.trim();
    if (!body) return;
    startTransition(async () => {
      const result = await addNote(targetUserId, body, visibility);
      if (result.ok && result.note) {
        setNotes((n) => [result.note!, ...n]);
        setDraft("");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNote(id);
      setNotes((n) => n.filter((x) => x.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border border-ink/10 rounded-md bg-paper space-y-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={visibility === "private_admin"}
                onChange={() => setVisibility("private_admin")}
              />
              <Shyft>Private (admin only)</Shyft>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={visibility === "public_to_user"}
                onChange={() => setVisibility("public_to_user")}
              />
              <Shyft>Public (user sees it)</Shyft>
            </label>
          </div>
          <button
            onClick={handleAdd}
            disabled={isPending || !draft.trim()}
            className="bg-brand-y text-paper font-display px-4 py-2 rounded-md disabled:opacity-50"
          >
            <Shyft>{isPending ? "Saving..." : "Add Note"}</Shyft>
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {notes.map((n) => (
          <li
            key={n.id}
            className={`p-3 border rounded-md ${
              n.visibility === "public_to_user"
                ? "border-brand-teal bg-brand-teal/5"
                : "border-ink/10 bg-paper"
            }`}
          >
            <div className="flex justify-between items-start gap-3 mb-1">
              <span className="text-xs opacity-60">
                {new Date(n.createdAt).toLocaleString()} ·{" "}
                {n.visibility === "public_to_user" ? "Public" : "Private"}
              </span>
              <button
                onClick={() => handleDelete(n.id)}
                className="text-xs opacity-50 hover:text-red-600"
              >
                delete
              </button>
            </div>
            <div className="whitespace-pre-wrap">{n.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

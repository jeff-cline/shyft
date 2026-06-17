"use client";

import { useState, useTransition } from "react";
import { Shyft } from "@/components/brand/Shyft";
import { addAdmin } from "./actions";

interface AdminLite {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export function AdminsManager({ initial }: { initial: AdminLite[] }) {
  const [admins, setAdmins] = useState<AdminLite[]>(initial);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!email.trim()) return;
    startTransition(async () => {
      const result = await addAdmin({
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        tempPassword: tempPassword.trim(),
      });
      if (result.ok && result.admin) {
        setAdmins((a) => [...a, result.admin!]);
        setMessage({
          kind: "ok",
          text: `Created ${result.admin.email}. Share the temp password securely — they'll reset on first login.`,
        });
        setEmail("");
        setName("");
        setTempPassword("");
      } else {
        setMessage({ kind: "err", text: result.error || "Could not create admin." });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border border-ink/10 rounded-md bg-paper space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
          />
        </div>
        <input
          type="text"
          value={tempPassword}
          onChange={(e) => setTempPassword(e.target.value)}
          placeholder="Temporary password (min 8 chars)"
          className="w-full border border-ink/20 rounded px-3 py-2 bg-paper outline-none focus:border-ink"
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !email.trim() || tempPassword.length < 8}
          className="bg-brand-y text-paper font-display px-4 py-2 rounded-md disabled:opacity-50"
        >
          <Shyft>{isPending ? "Creating..." : "Add Admin"}</Shyft>
        </button>
        {message && (
          <p className={`text-sm ${message.kind === "ok" ? "text-green-700" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </div>

      <ul className="border border-ink/10 rounded-md bg-paper divide-y divide-ink/10">
        {admins.map((a) => (
          <li key={a.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-display">{a.name || a.email}</div>
              <div className="text-xs opacity-60">{a.email}</div>
            </div>
            <div className="text-xs opacity-50">
              Since {new Date(a.createdAt).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

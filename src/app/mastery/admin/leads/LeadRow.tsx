"use client";

import { useTransition, useState } from "react";
import { updateLeadDisposition } from "./actions";

interface LeadLite {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  disposition: string;
  message: string | null;
}

export function LeadRow({
  lead,
  dispositions,
}: {
  lead: LeadLite;
  dispositions: string[];
}) {
  const [disposition, setDisposition] = useState(lead.disposition);
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    setDisposition(next);
    startTransition(() => {
      updateLeadDisposition(lead.id, next);
    });
  }

  return (
    <tr className="border-b border-ink/10 last:border-b-0">
      <td className="px-3 py-2 whitespace-nowrap opacity-70">
        {new Date(lead.createdAt).toLocaleString()}
      </td>
      <td className="px-3 py-2">{lead.name}</td>
      <td className="px-3 py-2">
        <a href={`mailto:${lead.email}`} className="hover:text-brand-y">
          {lead.email}
        </a>
      </td>
      <td className="px-3 py-2">{lead.phone || "—"}</td>
      <td className="px-3 py-2 capitalize">{lead.source.replace(/_/g, " ")}</td>
      <td className="px-3 py-2">
        <select
          value={disposition}
          onChange={(e) => onChange(e.target.value)}
          disabled={isPending}
          className="border border-ink/20 rounded px-2 py-1 bg-paper"
        >
          {dispositions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 max-w-xs truncate" title={lead.message ?? ""}>
        {lead.message || "—"}
      </td>
    </tr>
  );
}

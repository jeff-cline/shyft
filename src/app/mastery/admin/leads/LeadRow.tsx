"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { updateLeadDisposition } from "./actions";

interface LeadLite {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  sourceLabel: string;
  disposition: string;
  message: string | null;
  userId: string | null;
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
    <tr className="border-b border-ink/10 last:border-b-0 hover:bg-ink/5">
      <td className="px-3 py-2 whitespace-nowrap opacity-70">
        {new Date(lead.createdAt).toLocaleString()}
      </td>
      <td className="px-3 py-2">
        {lead.userId ? (
          <Link
            href={`/mastery/admin/users/${lead.userId}`}
            className="font-medium text-ink hover:text-brand-y underline-offset-2 hover:underline"
          >
            {lead.name}
          </Link>
        ) : (
          <span>{lead.name}</span>
        )}
      </td>
      <td className="px-3 py-2">
        <a href={`mailto:${lead.email}`} className="hover:text-brand-y">
          {lead.email}
        </a>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">{lead.phone || "—"}</td>
      <td className="px-3 py-2 whitespace-nowrap">{lead.sourceLabel}</td>
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

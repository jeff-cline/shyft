import Link from "next/link";
import { Shyft } from "@/components/brand/Shyft";
import { prisma } from "@/lib/db";

export default async function AdminInbox() {
  // Most-recent-message-per-thread, with thread user info
  const threads = await prisma.user.findMany({
    where: {
      chatThread: { some: {} },
    },
    include: {
      chatThread: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          chatThread: {
            where: { readAt: null, authorId: { not: undefined } },
          },
        },
      },
    },
  });

  // Compute unread count properly per thread (where author != admin viewer; we approximate as author != threadUserId already covered by where)
  const enriched = await Promise.all(
    threads.map(async (t) => {
      const unread = await prisma.chatMessage.count({
        where: { threadUserId: t.id, readAt: null, authorId: { not: t.id } /* messages FROM admins to this user */ },
      });
      // Actually we want messages FROM the customer that admins haven't read
      const unreadFromCustomer = await prisma.chatMessage.count({
        where: { threadUserId: t.id, readAt: null, authorId: t.id },
      });
      return { ...t, unreadFromCustomer, lastMsg: t.chatThread[0], _unused: unread };
    })
  );

  const sorted = enriched.sort(
    (a, b) => (b.lastMsg?.createdAt.getTime() ?? 0) - (a.lastMsg?.createdAt.getTime() ?? 0)
  );

  const leadStats = await prisma.lead.groupBy({
    by: ["disposition"],
    _count: { _all: true },
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="font-display text-4xl md:text-5xl mb-2">
          <Shyft>Inbox</Shyft>
        </h1>
        <p className="opacity-70">
          <Shyft>Most recent chats. Click any thread to respond.</Shyft>
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-sm">
        {leadStats.map((s) => (
          <Link
            key={s.disposition}
            href="/mastery/admin/leads"
            className="p-4 border border-ink/10 rounded-md bg-paper hover:border-brand-y"
          >
            <div className="font-display text-2xl">{s._count._all}</div>
            <div className="opacity-70 capitalize">
              <Shyft>{s.disposition}</Shyft>
            </div>
          </Link>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="p-8 border border-dashed border-ink/30 rounded-md text-center opacity-60">
          <Shyft>No conversations yet.</Shyft>
        </div>
      ) : (
        <ul className="divide-y divide-ink/10 border border-ink/10 rounded-md bg-paper">
          {sorted.map((t) => (
            <li key={t.id}>
              <Link
                href={`/mastery/admin/users/${t.id}`}
                className="flex items-center justify-between p-4 hover:bg-ink/5 transition-colors"
              >
                <div>
                  <div className="font-display text-lg flex items-center gap-2">
                    <Shyft>{t.name || t.email}</Shyft>
                    {t.unreadFromCustomer > 0 && (
                      <span className="bg-brand-y text-paper text-xs px-2 py-0.5 rounded-full">
                        {t.unreadFromCustomer} new
                      </span>
                    )}
                  </div>
                  <div className="text-sm opacity-60 truncate max-w-md">
                    {t.lastMsg?.body || ""}
                  </div>
                </div>
                <div className="text-xs opacity-60 whitespace-nowrap">
                  {t.lastMsg ? new Date(t.lastMsg.createdAt).toLocaleString() : ""}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

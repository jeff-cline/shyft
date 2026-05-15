import Link from "next/link";
import { Shyft } from "@/components/brand/Shyft";
import { prisma } from "@/lib/db";

export default async function AdminChatInbox() {
  const threads = await prisma.user.findMany({
    where: { chatThread: { some: {} } },
    include: {
      chatThread: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const enriched = await Promise.all(
    threads.map(async (t) => {
      const unreadFromCustomer = await prisma.chatMessage.count({
        where: { threadUserId: t.id, readAt: null, authorId: t.id },
      });
      return { ...t, unreadFromCustomer, lastMsg: t.chatThread[0] };
    })
  );

  const sorted = enriched.sort(
    (a, b) => (b.lastMsg?.createdAt.getTime() ?? 0) - (a.lastMsg?.createdAt.getTime() ?? 0)
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div>
        <Link href="/mastery/admin" className="text-sm opacity-70 hover:text-brand-y">
          ← Back to overview
        </Link>
        <h1 className="font-display text-4xl md:text-5xl mt-2 mb-1">
          <Shyft>Chat Inbox</Shyft>
        </h1>
        <p className="opacity-70">
          <Shyft>Most recent first. Click a thread to respond.</Shyft>
        </p>
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
                <div className="min-w-0 flex-1">
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

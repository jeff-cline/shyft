import Link from "next/link";
import { notFound } from "next/navigation";
import { Shyft } from "@/components/brand/Shyft";
import { prisma } from "@/lib/db";
import { UserControls } from "./UserControls";
import { NotesEditor } from "./NotesEditor";
import { ChatPanel } from "@/app/mastery/dashboard/ChatPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetail({ params }: PageProps) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      notesAboutMe: { orderBy: { createdAt: "desc" }, take: 50 },
      subscription: true,
      affiliate: true,
    },
  });
  if (!user) notFound();

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <div>
        <Link href="/mastery/admin/users" className="text-sm opacity-70 hover:text-brand-y">
          ← Back to users
        </Link>
        <h1 className="font-display text-4xl md:text-5xl mt-2 mb-1">
          <Shyft>{user.name || user.email}</Shyft>
        </h1>
        <p className="opacity-70">{user.email}</p>
      </div>

      <UserControls
        userId={user.id}
        initial={{
          role: user.role,
          currentTier: user.currentTier,
          paid: user.paid,
          upgradeShowPrivate: user.upgradeShowPrivate,
          upgradeShowRetreat: user.upgradeShowRetreat,
          upgradeShowFitness: user.upgradeShowFitness,
        }}
      />

      <section>
        <h2 className="font-display text-2xl mb-4">
          <Shyft>Notes</Shyft>
        </h2>
        <NotesEditor
          targetUserId={user.id}
          notes={user.notesAboutMe.map((n) => ({
            id: n.id,
            body: n.body,
            visibility: n.visibility,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">
          <Shyft>Chat</Shyft>
        </h2>
        <ChatPanel userId={user.id} userRole="admin" />
      </section>
    </main>
  );
}

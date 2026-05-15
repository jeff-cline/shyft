import { Shyft } from "@/components/brand/Shyft";
import { prisma } from "@/lib/db";
import { AdminsManager } from "./AdminsManager";

export default async function AdminsPage() {
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl mb-2">
        <Shyft>Admins</Shyft>
      </h1>
      <p className="opacity-70 mb-8">
        <Shyft>
          Add another admin. They&apos;ll get a temporary password and must reset it on first
          login.
        </Shyft>
      </p>
      <AdminsManager
        initial={admins.map((a) => ({
          id: a.id,
          email: a.email,
          name: a.name,
          createdAt: a.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}

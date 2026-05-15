import Link from "next/link";
import { Shyft } from "@/components/brand/Shyft";
import { prisma } from "@/lib/db";
import { TIERS, tierFromString } from "@/lib/tiers";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      currentTier: true,
      paid: true,
      createdAt: true,
    },
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl mb-2">
        <Shyft>Users</Shyft>
      </h1>
      <p className="opacity-70 mb-8">
        <Shyft>{users.length} total. Click a user to manage notes, tier, and upgrades.</Shyft>
      </p>

      <div className="border border-ink/10 rounded-md bg-paper overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 font-display">
            <tr>
              <Th>Name / Email</Th>
              <Th>Role</Th>
              <Th>Tier</Th>
              <Th>Paid</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink/10 last:border-b-0 hover:bg-ink/5">
                <td className="px-3 py-2">
                  <Link href={`/mastery/admin/users/${u.id}`} className="block">
                    <div className="font-medium">{u.name || "(no name)"}</div>
                    <div className="text-xs opacity-60">{u.email}</div>
                  </Link>
                </td>
                <td className="px-3 py-2 capitalize">{u.role}</td>
                <td className="px-3 py-2">{TIERS[tierFromString(u.currentTier)].label}</td>
                <td className="px-3 py-2">{u.paid ? "✓" : "—"}</td>
                <td className="px-3 py-2 opacity-70 whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 border-b border-ink/10">{children}</th>;
}

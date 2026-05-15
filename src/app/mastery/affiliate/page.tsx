import { Shyft } from "@/components/brand/Shyft";
import { requireAffiliate } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { CopyLink } from "./CopyLink";

export default async function AffiliateHome() {
  const user = await requireAffiliate();

  let affiliate = await prisma.affiliate.findUnique({ where: { userId: user.id } });
  if (!affiliate) {
    affiliate = await prisma.affiliate.create({
      data: {
        userId: user.id,
        referralCode: generateCode(user.email),
        payoutEmail: user.email,
      },
    });
  }

  const referrals = await prisma.referral.findMany({
    where: { affiliateId: affiliate.id },
    include: { referredUser: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const masteryBase = process.env.NEXT_PUBLIC_MASTERY_URL || "";
  const linkBase = masteryBase || "https://shyftmastery.com";
  const referralLink = `${linkBase}/get-started?ref=${affiliate.referralCode}`;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="font-display text-4xl md:text-5xl mb-2">
          <Shyft>Your Affiliate Dashboard</Shyft>
        </h1>
        <p className="opacity-70">
          <Shyft>Share your link. Get credited when a referral signs up and pays.</Shyft>
        </p>
      </div>

      <section className="p-6 border-2 border-brand-y rounded-xl bg-brand-y/5">
        <div className="font-display text-sm opacity-70 mb-1">
          <Shyft>Your referral code</Shyft>
        </div>
        <div className="font-display text-3xl mb-4">{affiliate.referralCode}</div>

        <div className="font-display text-sm opacity-70 mb-1">
          <Shyft>Your referral link</Shyft>
        </div>
        <CopyLink link={referralLink} />
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">
          <Shyft>Your Referrals</Shyft>
        </h2>
        {referrals.length === 0 ? (
          <p className="opacity-60">
            <Shyft>
              No referrals yet. Once someone signs up through your link and joins, they appear
              here with commission due date.
            </Shyft>
          </p>
        ) : (
          <table className="w-full text-sm border border-ink/10 rounded-md bg-paper overflow-hidden">
            <thead className="bg-ink/5 font-display">
              <tr>
                <Th>When</Th>
                <Th>Referred</Th>
                <Th>Became Customer</Th>
                <Th>Commission Due</Th>
                <Th>Paid</Th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id} className="border-b border-ink/10 last:border-b-0">
                  <td className="px-3 py-2 opacity-70 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    {r.referredUser?.name || r.referredUser?.email || "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.becameCustomerAt
                      ? new Date(r.becameCustomerAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.commissionDueOn
                      ? new Date(r.commissionDueOn).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.commissionPaidAt
                      ? new Date(r.commissionPaidAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 border-b border-ink/10">{children}</th>;
}

function generateCode(email: string): string {
  const prefix = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

import { Shyft } from "@/components/brand/Shyft";
import { CTAButton } from "@/components/brand/CTAButton";
import { getPaymentsEnabled, getSetting } from "@/lib/settings";
import { TIERS, tierFromString } from "@/lib/tiers";
import { JoinButton } from "./JoinButton";

interface PageProps {
  searchParams: Promise<{ email?: string; name?: string; upgrade?: string }>;
}

export default async function MembershipPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const paymentsEnabled = await getPaymentsEnabled();

  const tierKey = tierFromString(sp.upgrade) === "none" ? "mastery" : tierFromString(sp.upgrade);
  const tier = TIERS[tierKey];

  const priceId = (await getSetting(tier.stripePriceIdSettingKey)) || "";
  const stripeReady = paymentsEnabled && !!priceId;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="p-8 md:p-12 border-2 border-ink rounded-xl bg-paper">
        <h1 className="font-display text-4xl md:text-6xl mb-2">
          <Shyft>{tier.label}</Shyft>
        </h1>
        <div className="font-display text-3xl md:text-4xl mb-6 text-brand-y">
          <Shyft>{tier.priceLabel}</Shyft>
        </div>

        <p className="text-lg opacity-85 mb-8">
          <Shyft>{tier.blurb}</Shyft>
        </p>

        {stripeReady ? (
          <JoinButton
            tierKey={tier.key}
            prefilledEmail={sp.email ?? ""}
            prefilledName={sp.name ?? ""}
          />
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-brand-teal/10 border-2 border-brand-teal rounded-md">
              <Shyft>
                Payments are not yet enabled. We&apos;ll be in touch directly to onboard you, or
                book a free call below if you&apos;d like to talk first.
              </Shyft>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <CTAButton href="/doctor/book" variant="primary">
                Book a Free Call
              </CTAButton>
              <CTAButton href="/mastery" variant="secondary">
                Back to Home
              </CTAButton>
            </div>
          </div>
        )}

        <p className="text-xs opacity-60 mt-8">
          <Shyft>Cancel anytime. No long-term contract.</Shyft>
        </p>
      </div>
    </main>
  );
}

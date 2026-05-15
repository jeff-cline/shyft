import { cookies } from "next/headers";
import { Shyft } from "@/components/brand/Shyft";
import { FreeGiftsClient } from "./FreeGiftsClient";
import { GIFTS } from "./gifts";

interface PageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function FreeGiftsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const initiallyUnlocked = cookieStore.get("shyft_gifts_unlocked")?.value === "1";

  return (
    <main>
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="font-display text-sm uppercase tracking-[0.3em] opacity-60 mb-4">
          <Shyft>shYft Mastery — Free Gifts</Shyft>
        </div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] mb-6">
          <span className="text-brand-coral">
            <Shyft>6 Free Gifts.</Shyft>
          </span>
          <br />
          <Shyft>Unwrap them all at once.</Shyft>
        </h1>
        <p className="text-lg md:text-xl opacity-85 max-w-2xl mx-auto">
          <Shyft>
            One quick form unlocks every gift below. No tricks, no upsell. Just take the ones
            that fit.
          </Shyft>
        </p>
      </section>

      <FreeGiftsClient
        gifts={GIFTS}
        initiallyUnlocked={initiallyUnlocked}
        affiliateRef={sp.ref ?? null}
      />
    </main>
  );
}

import { Shyft } from "@/components/brand/Shyft";
import { LeadForm } from "./LeadForm";

interface PageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function GetStartedPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const affiliateRef = sp.ref ?? null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-5xl md:text-7xl mb-4 leading-[0.95]">
        <Shyft>Make the shYft.</Shyft>
      </h1>
      <p className="text-lg md:text-xl opacity-80 mb-10 max-w-xl">
        <Shyft>
          Tell us where you are. We&apos;ll meet you there and walk the rest with you. The
          membership is $497/month and includes everything you need to begin.
        </Shyft>
      </p>

      <LeadForm affiliateRef={affiliateRef} />
    </main>
  );
}

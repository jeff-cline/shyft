"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Shyft } from "@/components/brand/Shyft";
import { claimGifts } from "./actions";
import type { Gift } from "./gifts";

interface Props {
  gifts: Gift[];
  initiallyUnlocked: boolean;
  affiliateRef: string | null;
}

export function FreeGiftsClient({ gifts, initiallyUnlocked, affiliateRef }: Props) {
  const [unlocked, setUnlocked] = useState(initiallyUnlocked);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLDivElement>(null);

  function handle(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await claimGifts(formData);
      if (result.ok) {
        setUnlocked(true);
      } else {
        setError(result.error || "Something went wrong. Try again.");
      }
    });
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      {/* Unlock-state banner */}
      {unlocked && (
        <section className="max-w-3xl mx-auto px-6 mb-8">
          <div className="p-6 border-2 border-brand-teal bg-brand-teal/10 rounded-xl text-center">
            <div className="font-display text-3xl md:text-4xl mb-1">
              <Shyft>You&apos;re in. All 6 gifts unwrapped below.</Shyft>
            </div>
            <p className="opacity-80">
              <Shyft>Take what you need. Skip what you don&apos;t.</Shyft>
            </p>
          </div>
        </section>
      )}

      {/* Gift grid */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift, i) => (
            <GiftCard
              key={gift.number}
              gift={gift}
              unlocked={unlocked}
              onLockedClick={scrollToForm}
              transitionDelay={i * 80}
            />
          ))}
        </div>
      </section>

      {/* Form section — collapses into a thank-you note once unlocked */}
      <section ref={formRef} className="max-w-2xl mx-auto px-6 pb-24">
        {unlocked ? (
          <div className="text-center p-8 border border-ink/10 rounded-xl bg-paper">
            <p className="text-lg opacity-85 mb-4">
              <Shyft>
                Want to go deeper? Book a free call or join the full program.
              </Shyft>
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="/doctor/book"
                className="inline-block border-2 border-ink text-ink font-display text-lg px-6 py-3 rounded-md hover:bg-ink hover:text-paper transition-colors"
              >
                <Shyft>Free Breakthrough Call</Shyft>
              </a>
              <a
                href="/mastery/get-started"
                className="inline-block bg-brand-y text-paper font-display text-lg px-6 py-3 rounded-md hover:bg-ink transition-colors"
              >
                <Shyft>Join shYft Mastery</Shyft>
              </a>
            </div>
          </div>
        ) : (
          <div className="p-8 border-2 border-ink rounded-xl bg-paper">
            <h2 className="font-display text-3xl md:text-4xl mb-2 text-center">
              <Shyft>Unlock All Gifts</Shyft>
            </h2>
            <p className="opacity-75 text-center mb-6">
              <Shyft>Tell us where to send updates. Everything else is one click.</Shyft>
            </p>
            <form action={handle} className="space-y-4">
              {affiliateRef && <input type="hidden" name="ref" value={affiliateRef} />}
              <Field label="Your Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone (optional)" name="phone" type="tel" />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-brand-y text-paper font-display text-2xl px-6 py-4 rounded-md hover:bg-ink transition-colors disabled:opacity-50"
              >
                <Shyft>{isPending ? "Unwrapping..." : "Unwrap My Gifts"}</Shyft>
              </button>
              <p className="text-xs opacity-60 text-center pt-1">
                <Shyft>No spam. Unsubscribe anytime.</Shyft>
              </p>
            </form>
          </div>
        )}
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-display text-base mb-1.5">
        <Shyft>{label}</Shyft>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full border-2 border-ink/20 focus:border-ink rounded-md px-4 py-3 bg-paper outline-none"
      />
    </div>
  );
}

const COLOR_MAP: Record<
  Gift["color"],
  {
    lidBg: string;
    bowBg: string;
    cardBorder: string;
    numberText: string;
    cta: string;
  }
> = {
  "brand-y": {
    lidBg: "bg-brand-y",
    bowBg: "bg-brand-coral",
    cardBorder: "border-brand-y",
    numberText: "text-brand-y",
    cta: "bg-brand-y hover:bg-ink text-paper",
  },
  "brand-coral": {
    lidBg: "bg-brand-coral",
    bowBg: "bg-brand-y",
    cardBorder: "border-brand-coral",
    numberText: "text-brand-coral",
    cta: "bg-brand-coral hover:bg-ink text-paper",
  },
  "brand-teal": {
    lidBg: "bg-brand-teal",
    bowBg: "bg-brand-coral",
    cardBorder: "border-brand-teal",
    numberText: "text-brand-teal",
    cta: "bg-brand-teal hover:bg-ink text-ink",
  },
  ink: {
    lidBg: "bg-ink",
    bowBg: "bg-brand-y",
    cardBorder: "border-ink",
    numberText: "text-ink",
    cta: "bg-ink hover:bg-brand-y text-paper",
  },
};

function GiftCard({
  gift,
  unlocked,
  onLockedClick,
  transitionDelay,
}: {
  gift: Gift;
  unlocked: boolean;
  onLockedClick: () => void;
  transitionDelay: number;
}) {
  // For stagger of unwrap animation
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!unlocked) {
      setRevealed(false);
      return;
    }
    const t = setTimeout(() => setRevealed(true), transitionDelay);
    return () => clearTimeout(t);
  }, [unlocked, transitionDelay]);

  const colors = COLOR_MAP[gift.color];

  return (
    <div
      className={`relative rounded-xl border-2 ${colors.cardBorder} bg-paper overflow-hidden flex flex-col`}
      style={{ minHeight: 360 }}
    >
      {/* Gift box visual */}
      <div className="relative h-32 overflow-visible">
        {/* Box body */}
        <div className={`absolute inset-x-0 bottom-0 h-20 ${colors.lidBg}`}>
          {/* Vertical ribbon stripe */}
          <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-3 bg-paper/80" />
          {/* Horizontal ribbon stripe */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-paper/80" />
        </div>
        {/* Lid + bow — animates off when unwrapped */}
        <div
          className={`absolute inset-x-0 top-0 h-12 ${colors.lidBg} flex items-center justify-center transition-all duration-700`}
          style={{
            transform: revealed
              ? "translate(40%, -120%) rotate(-25deg)"
              : "translate(0,0) rotate(0)",
            opacity: revealed ? 0 : 1,
          }}
        >
          {/* Bow */}
          <div className="relative">
            <div className={`w-6 h-6 ${colors.bowBg} rounded-full`} />
            <div
              className={`absolute -left-2 top-1 w-4 h-4 ${colors.bowBg} rounded-full opacity-90`}
            />
            <div
              className={`absolute -right-2 top-1 w-4 h-4 ${colors.bowBg} rounded-full opacity-90`}
            />
          </div>
        </div>
        {/* Sparkle on unwrap */}
        {revealed && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="text-3xl animate-pulse">✨</span>
          </div>
        )}
      </div>

      {/* Number + status */}
      <div className="px-6 pt-4 flex items-baseline justify-between">
        <div className={`font-display text-5xl leading-none ${colors.numberText}`}>
          #{gift.number}
        </div>
        <div className="text-xs font-display tracking-widest uppercase opacity-60">
          {revealed ? (
            <Shyft>Unwrapped</Shyft>
          ) : (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>🔒</span>
              <Shyft>Locked</Shyft>
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex-1 flex flex-col">
        {revealed ? (
          <>
            <h3 className="font-display text-2xl md:text-3xl mb-2 leading-tight">
              <Shyft>{gift.title}</Shyft>
            </h3>
            <p className="opacity-85 mb-4 flex-1">
              <Shyft>{gift.description}</Shyft>
            </p>
            <a
              href={gift.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block text-center font-display text-lg px-5 py-3 rounded-md transition-colors ${colors.cta}`}
            >
              <Shyft>{gift.cta} →</Shyft>
            </a>
          </>
        ) : (
          <>
            <p className="text-lg leading-snug mb-4 flex-1">
              <Shyft>{gift.lockedTeaser}</Shyft>
            </p>
            <button
              type="button"
              onClick={onLockedClick}
              className="block w-full text-center font-display text-lg px-5 py-3 rounded-md border-2 border-ink text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              <Shyft>🔓 Unlock to Open</Shyft>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

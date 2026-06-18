import { CTAButton } from "@/components/brand/CTAButton";
import { Logo } from "@/components/brand/Logo";
import { Shyft } from "@/components/brand/Shyft";
import { TestimonialMarquee } from "@/components/site/TestimonialMarquee";
import { DOCTOR_BASE, MASTERY_BASE } from "@/lib/urls";
import type { Brand } from "@/lib/brand";

/**
 * The shared marketing home rendered under both /doctor ("shYft Doctor") and
 * /master ("Shyftmaster"). Editing this updates both domains at once — only the
 * brand name token differs. Brand-Y treatment is kept in headings (h1/h2/h3) and
 * the brand eyebrow; body copy renders plain.
 *
 * `kw` (optional) is the sanitized ad keyword for Dynamic Keyword Insertion; when
 * present it replaces the first line of the hero H1.
 */
export function MarketingHome({ brand, kw }: { brand: Brand; kw?: string }) {
  return (
    <main>
      {/* HERO */}
      <section className="relative isolate overflow-hidden text-ink">
        {/* Background photo + light-teal wash */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-women.jpg"
          alt="Three women at a breaking point at work"
          className="absolute inset-0 -z-10 w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-teal/55 via-brand-teal/45 to-brand-teal/65" />

        <div className="hero-cq max-w-4xl mx-auto px-6 pt-10 pb-12 text-center">
          {/* Full wordmark logo */}
          <div className="flex justify-center mb-4">
            <Logo variant="hero" />
          </div>

          {/* Premium headline with black glow */}
          <h1 className="font-display text-6xl md:text-8xl leading-[0.92]">
            {kw && (
              <span
                className="block text-brand-y whitespace-nowrap leading-none mb-1"
                style={{ fontSize: `min(1em, calc(100cqw / ${((kw.length + 1) * 0.66).toFixed(2)}))` }}
              >
                <Shyft>{kw}</Shyft>
                <span className="kw-glow">?</span>
              </span>
            )}
            <span className="block text-gold-metallic">SHYFT HAPPENS!</span>
            <span className="block text-2xl md:text-4xl text-ink mt-3 [text-shadow:0_1px_6px_rgba(255,255,255,0.6)]">
              Now what?
            </span>
          </h1>

          <p className="text-lg md:text-xl text-ink font-semibold max-w-2xl mx-auto mt-6 [text-shadow:0_1px_8px_rgba(255,255,255,0.7)]">
            You felt it. The career, the marriage, the body, the soul — something moved.
            You&apos;re not lost. You&apos;re between chapters. The next one starts with you.
          </p>
        </div>

        {/* Full-width split call-to-action bar — black & teal, gold letters */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-px bg-paper/20">
          <a
            href={`${DOCTOR_BASE}/book`}
            className="block text-center font-display text-xl md:text-2xl py-7 md:py-9 bg-ink text-brand-y hover:bg-brand-y hover:text-ink transition-colors [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]"
          >
            Free Breakthrough Call
          </a>
          <a
            href={`${MASTERY_BASE}/get-started`}
            className="block text-center font-display text-xl md:text-2xl py-7 md:py-9 bg-brand-teal text-brand-y hover:bg-ink transition-colors [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]"
          >
            I&apos;m Ready to shYft
          </a>
        </div>
      </section>

      {/* STATS / TRUST STRIP */}
      <section className="bg-paper border-y border-ink/10 py-8">
        <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-3 gap-4 text-center">
          <Stat label="Clients" value="100+" />
          <Stat label="Years" value="8" />
          <Stat label="Promise" value="shYft will happen, guaranteed!" />
        </div>
      </section>

      {/* IDENTITY / EMPATHY */}
      <section className="bg-ink text-paper py-24">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-display text-4xl md:text-6xl leading-tight">
            You&apos;re not broken. You&apos;re becoming.
          </h2>
          <p className="text-lg opacity-85">
            The world calls it burnout, divorce, midlife, exit, plateau, breakdown. We call it
            a shYft. Same moment. Very different lens. We start there.
          </p>
        </div>
      </section>

      {/* WHAT HAPPENS ON THE CALL */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <div className="font-display text-sm uppercase tracking-[0.3em] opacity-60 mb-2">
            What Happens on the Call
          </div>
          <h2 className="font-display text-4xl md:text-5xl">
            Thirty minutes. No script.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            ["01", "We Listen", "You talk. We listen for what's actually shifting underneath the surface story."],
            ["02", "We Name It", "We give language to the moment you're in — the kind that lets you stop fighting it."],
            ["03", "One Next Step", "You leave with one move. Yours. Concrete. Doable today. No homework you'll resent."],
          ].map(([num, title, body]) => (
            <div key={title} className="border-l-4 border-brand-y pl-5">
              <div className="font-display text-brand-y text-3xl mb-1">{num}</div>
              <h3 className="font-display text-2xl mb-2">{title}</h3>
              <p className="opacity-80">{body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <CTAButton href={`${DOCTOR_BASE}/book`} variant="primary">
            Book My Free Call
          </CTAButton>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialMarquee />

      {/* THREE PILLARS */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-10 text-center">
        {[
          ["Seen", "We start where you actually are — not where the world says you should be."],
          ["Heard", "No script. No diagnosis. A real conversation about a real moment."],
          ["Moved", "You leave with one next step. Yours. Concrete. Doable today."],
        ].map(([title, body]) => (
          <div key={title}>
            <h3 className="font-display text-3xl mb-3">{title}</h3>
            <p className="opacity-75 text-lg">{body}</p>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="bg-paper border-y border-ink/10 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-10">
            Honest Answers
          </h2>
          <div className="space-y-4">
            <Faq
              q="What actually happens on the call?"
              a="A 30-minute conversation. You tell me what's shifting. I listen for what's underneath. We name it. You leave with one next move. No pitch."
            />
            <Faq
              q="Are you going to try to sell me something?"
              a="No. If we're a fit for further work, you'll know — and you'll ask. If we're not, I'll tell you who is."
            />
            <Faq
              q="I've worked with coaches and therapists. How is this different?"
              a="Most start at the head — what you should do. We start at the nervous system — what's actually running you. The strategy works better when the body isn't fighting it."
            />
            <Faq
              q="Is this therapy?"
              a="No. It's coaching for adults navigating a shYft. It complements therapy beautifully. If clinical care is what you need, I'll say so on the call."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-ink text-paper pt-24">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6 pb-12">
          <h2 className="font-display text-5xl md:text-7xl leading-tight">One conversation away.</h2>
          <p className="text-lg opacity-85">
            Free. Thirty minutes. No script. No pitch. Pick a time that works.
          </p>
        </div>
        {/* full-width split CTA — matches the hero (black & teal, gold letters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-paper/20 border-t border-paper/15">
          <a
            href={`${DOCTOR_BASE}/book`}
            className="block text-center font-display text-xl md:text-2xl py-7 md:py-9 bg-ink text-brand-y hover:bg-brand-y hover:text-ink transition-colors [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]"
          >
            Book My Free Call
          </a>
          <a
            href={`${MASTERY_BASE}/free-gifts`}
            className="block text-center font-display text-xl md:text-2xl py-7 md:py-9 bg-brand-teal text-brand-y hover:bg-ink transition-colors [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]"
          >
            Six Free Gifts First
          </a>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-4xl md:text-5xl text-brand-y leading-none">{value}</div>
      <div className="text-xs uppercase tracking-widest opacity-60 mt-2">{label}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="border border-ink/10 rounded-md bg-paper group">
      <summary className="cursor-pointer p-4 font-display text-lg flex justify-between items-center list-none">
        <span>{q}</span>
        <span className="text-brand-y text-2xl transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-4 pb-4 opacity-85">{a}</div>
    </details>
  );
}

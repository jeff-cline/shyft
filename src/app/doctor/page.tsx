import { CTAButton } from "@/components/brand/CTAButton";
import { Logo } from "@/components/brand/Logo";
import { Shyft } from "@/components/brand/Shyft";
import { TestimonialMarquee } from "@/components/site/TestimonialMarquee";
import { DOCTOR_BASE, MASTERY_BASE } from "@/lib/urls";

export default function DoctorLanding() {
  return (
    <main>
      {/* HERO */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-display text-sm uppercase tracking-[0.3em] opacity-60 mb-4">
              <Shyft>The shYft Doctor</Shyft>
            </div>
            <h1 className="font-display text-6xl md:text-8xl leading-[0.95] mb-6">
              <span className="text-brand-coral">
                <Shyft>SHYFT HAPPENS!</Shyft>
              </span>
              <br />
              <Shyft>Now what?</Shyft>
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-85 max-w-lg">
              <Shyft>
                You felt it. The career, the marriage, the body, the soul — something moved.
                You&apos;re not lost. You&apos;re between chapters. The next one starts with{" "}
              </Shyft>
              <span className="brand-y text-3xl">Y</span>
              <Shyft>.</Shyft>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <CTAButton href={`${DOCTOR_BASE}/book`} variant="primary">
                Free Breakthrough Call
              </CTAButton>
              <CTAButton href={`${MASTERY_BASE}/get-started`} variant="secondary">
                I&apos;m Ready to shYft
              </CTAButton>
            </div>
          </div>
          <div className="flex justify-center">
            <Logo variant="hero" />
          </div>
        </div>
      </section>

      {/* STATS / TRUST STRIP */}
      <section className="bg-paper border-y border-ink/10 py-8">
        <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-3 gap-4 text-center">
          <Stat label="Clients" value="100+" />
          <Stat label="Years" value="8" />
          <Stat label="Promise" value="No script. No pitch." />
        </div>
      </section>

      {/* IDENTITY / EMPATHY */}
      <section className="bg-ink text-paper py-24">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-display text-4xl md:text-6xl leading-tight">
            <Shyft>You&apos;re not broken. You&apos;re becoming.</Shyft>
          </h2>
          <p className="text-lg opacity-85">
            <Shyft>
              The world calls it burnout, divorce, midlife, exit, plateau, breakdown. We call it
              a shYft. Same moment. Very different lens. We start there.
            </Shyft>
          </p>
        </div>
      </section>

      {/* WHAT HAPPENS ON THE CALL */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <div className="font-display text-sm uppercase tracking-[0.3em] opacity-60 mb-2">
            <Shyft>What Happens on the Call</Shyft>
          </div>
          <h2 className="font-display text-4xl md:text-5xl">
            <Shyft>Thirty minutes. No script.</Shyft>
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
              <h3 className="font-display text-2xl mb-2">
                <Shyft>{title}</Shyft>
              </h3>
              <p className="opacity-80">
                <Shyft>{body}</Shyft>
              </p>
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
            <h3 className="font-display text-3xl mb-3">
              <Shyft>{title}</Shyft>
            </h3>
            <p className="opacity-75 text-lg">
              <Shyft>{body}</Shyft>
            </p>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="bg-paper border-y border-ink/10 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-10">
            <Shyft>Honest Answers</Shyft>
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
      <section className="bg-ink text-paper py-24">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-display text-5xl md:text-7xl leading-tight">
            <Shyft>One conversation away.</Shyft>
          </h2>
          <p className="text-lg opacity-85">
            <Shyft>Free. Thirty minutes. No script. No pitch. Pick a time that works.</Shyft>
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href={`${DOCTOR_BASE}/book`} variant="primary">
              Book My Free Call
            </CTAButton>
            <CTAButton href={`${MASTERY_BASE}/free-gifts`} variant="secondary">
              Or — Six Free Gifts First
            </CTAButton>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-4xl md:text-5xl text-brand-y leading-none">
        <Shyft>{value}</Shyft>
      </div>
      <div className="text-xs uppercase tracking-widest opacity-60 mt-2">
        <Shyft>{label}</Shyft>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="border border-ink/10 rounded-md bg-paper group">
      <summary className="cursor-pointer p-4 font-display text-lg flex justify-between items-center list-none">
        <span><Shyft>{q}</Shyft></span>
        <span className="text-brand-y text-2xl transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-4 pb-4 opacity-85">
        <Shyft>{a}</Shyft>
      </div>
    </details>
  );
}

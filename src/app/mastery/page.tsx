import { CTAButton } from "@/components/brand/CTAButton";
import { Logo } from "@/components/brand/Logo";
import { Shyft } from "@/components/brand/Shyft";
import { TestimonialMarquee } from "@/components/site/TestimonialMarquee";
import { DOCTOR_BASE, MASTERY_BASE } from "@/lib/urls";

export default function MasteryLanding() {
  return (
    <main>
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-display text-sm uppercase tracking-[0.3em] opacity-60 mb-4">
              <Shyft>shYft Mastery</Shyft>
            </div>
            <h1 className="font-display text-6xl md:text-8xl leading-[0.95] mb-6">
              <span className="text-brand-coral">
                <Shyft>SHYFT</Shyft>
              </span>{" "}
              <span className="text-brand-coral">
                <Shyft>HAPPENS.</Shyft>
              </span>
              <br />
              <span className="text-brand-teal">
                <Shyft>We have the answer.</Shyft>
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-85 max-w-lg">
              <Shyft>
                Get started. Change your life today — one step at a time, one choice at a time.
                Click the button. Fill out the form. Make the next move.
              </Shyft>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <CTAButton href={`${MASTERY_BASE}/get-started`} variant="primary">
                I&apos;m Ready — Get Started
              </CTAButton>
              <CTAButton href={`${DOCTOR_BASE}/book`} variant="secondary">
                Free Consultation
              </CTAButton>
            </div>
            <a
              href={`${MASTERY_BASE}/free-gifts`}
              className="inline-block mt-5 text-sm opacity-70 hover:text-brand-y hover:opacity-100 transition-opacity underline-offset-4 hover:underline"
            >
              <Shyft>Not ready? Grab six free gifts instead →</Shyft>
            </a>
          </div>
          <div className="flex justify-center">
            <Logo variant="hero" />
          </div>
        </div>
      </section>

      {/* THREE-PILLAR METHOD */}
      <section className="bg-paper border-y border-ink/10 py-20">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center">
          {[
            ["Regulate", "Calm the nervous system that&apos;s running the show."],
            ["Rebuild", "Reconstruct identity, energy, alignment — from the inside out."],
            ["Rise", "Move into your next chapter on your own terms."],
          ].map(([title, body]) => (
            <div key={title}>
              <h3 className="font-display text-4xl mb-3">
                <Shyft>{title}</Shyft>
              </h3>
              <p className="opacity-75 text-lg">
                <Shyft>{body.replace("&apos;", "'")}</Shyft>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <div className="font-display text-sm uppercase tracking-[0.3em] opacity-60 mb-2">
            <Shyft>What&apos;s Inside Mastery</Shyft>
          </div>
          <h2 className="font-display text-4xl md:text-6xl">
            <Shyft>Everything you need to begin.</Shyft>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "Weekly Live Sessions", body: "Show up live. Bring your real life. Get unstuck in real time.", border: "border-brand-y" },
            { title: "The Full Library", body: "Frameworks, practices, tools. Searchable. Always growing.", border: "border-brand-coral" },
            { title: "Private Community", body: "People who get it. No noise. Real conversations.", border: "border-brand-teal" },
            { title: "Monthly Q&A", body: "Bring your hardest question to the shYft Doctor herself.", border: "border-brand-y" },
            { title: "Accountability", body: "Pairings + structures so you actually do the thing.", border: "border-brand-coral" },
            { title: "Cancel Anytime", body: "No contracts. No commitment trap. Stay because it works.", border: "border-brand-teal" },
          ].map((it) => (
            <div
              key={it.title}
              className={`p-6 border-l-4 ${it.border} border-y border-r border-ink/10 rounded-r-md bg-paper`}
            >
              <h3 className="font-display text-2xl mb-2">
                <Shyft>{it.title}</Shyft>
              </h3>
              <p className="opacity-80">
                <Shyft>{it.body}</Shyft>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="bg-ink text-paper py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-4xl md:text-6xl text-center mb-12">
            <Shyft>Made for the woman who&apos;s done pretending.</Shyft>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              ["The high-achiever questioning everything.", "You hit the goals. They didn't fix it. Now what?"],
              ["The leader who&apos;s tired of performing.", "The mask is heavy. The job won&apos;t hold it anymore."],
              ["The woman rebuilding from a shYft.", "Career. Marriage. Identity. One — or all of it."],
            ].map(([title, body]) => (
              <div key={title}>
                <h3 className="font-display text-2xl mb-3">
                  <Shyft>{title.replace("&apos;", "'")}</Shyft>
                </h3>
                <p className="opacity-80">
                  <Shyft>{body.replace(/&apos;/g, "'")}</Shyft>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialMarquee />

      {/* OFFER */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="font-display text-sm uppercase tracking-[0.3em] opacity-60 mb-3">
          <Shyft>The Membership</Shyft>
        </div>
        <h2 className="font-display text-5xl md:text-7xl mb-2">
          <Shyft>$497/month.</Shyft>
        </h2>
        <p className="text-lg md:text-xl opacity-85 mb-8 max-w-xl mx-auto">
          <Shyft>
            Everything above. Weekly live sessions, the full library, the community, monthly
            Q&amp;A, accountability. Cancel anytime — no contracts.
          </Shyft>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <CTAButton href={`${MASTERY_BASE}/get-started`} variant="primary">
            Join Now
          </CTAButton>
          <CTAButton href={`${DOCTOR_BASE}/book`} variant="secondary">
            Talk First — Book a Call
          </CTAButton>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-paper border-y border-ink/10 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-10">
            <Shyft>Honest Answers</Shyft>
          </h2>
          <div className="space-y-4">
            <Faq
              q="What if I can't make the live calls?"
              a="Every session is recorded and dropped in the library within 24 hours. Most members watch later. Live attendance is a bonus, not a requirement."
            />
            <Faq
              q="How long is the commitment?"
              a="There isn't one. Month-to-month. Cancel from your dashboard with one click. Stay because it works."
            />
            <Faq
              q="I'm not in a crisis. Is this still for me?"
              a="Yes — and especially yes. Most real shifts happen before the crisis. This is built for people who feel the tremor before the earthquake."
            />
            <Faq
              q="What if it's not for me?"
              a="Email within 30 days for a full refund. No paperwork, no awkward call."
            />
            <Faq
              q="Can I upgrade later?"
              a="Yes. Private Client (1:1) and the Annual Retreat are unlocked by your guide when you're ready. Most members start here."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-ink text-paper py-24">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-display text-5xl md:text-7xl leading-tight">
            <Shyft>Your next chapter starts with Y.</Shyft>
          </h2>
          <p className="text-lg opacity-85">
            <Shyft>Three doors. Pick whichever opens easiest tonight.</Shyft>
          </p>
          <div className="pt-4 grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <a
              href={`${MASTERY_BASE}/get-started`}
              className="bg-brand-y text-paper font-display text-lg px-5 py-4 rounded-md hover:bg-paper hover:text-ink transition-colors"
            >
              <Shyft>Join Mastery</Shyft>
            </a>
            <a
              href={`${DOCTOR_BASE}/book`}
              className="border-2 border-paper text-paper font-display text-lg px-5 py-4 rounded-md hover:bg-paper hover:text-ink transition-colors"
            >
              <Shyft>Free Call</Shyft>
            </a>
            <a
              href={`${MASTERY_BASE}/free-gifts`}
              className="border-2 border-paper text-paper font-display text-lg px-5 py-4 rounded-md hover:bg-paper hover:text-ink transition-colors"
            >
              <Shyft>Free Gifts</Shyft>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="border border-ink/10 rounded-md bg-paper group">
      <summary className="cursor-pointer p-4 font-display text-lg flex justify-between items-center list-none">
        <span>
          <Shyft>{q}</Shyft>
        </span>
        <span className="text-brand-y text-2xl transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-4 pb-4 opacity-85">
        <Shyft>{a}</Shyft>
      </div>
    </details>
  );
}

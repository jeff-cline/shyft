import { CTAButton } from "@/components/brand/CTAButton";
import { Logo } from "@/components/brand/Logo";
import { Shyft } from "@/components/brand/Shyft";
import { DOCTOR_BASE, MASTERY_BASE } from "@/lib/urls";

export default function DoctorLanding() {
  return (
    <main>
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-6xl md:text-8xl leading-[0.95] mb-6">
              <span className="text-brand-coral">
                <Shyft>SHYFT HAPPENS!</Shyft>
              </span>
              <br />
              <Shyft>Now what?</Shyft>
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-85 max-w-lg">
              <Shyft>
                You felt the shift. The career, the marriage, the body, the soul — something
                moved. You&apos;re not lost. You&apos;re between chapters. The next one starts
                with{" "}
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

      <section className="bg-ink text-paper py-24">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-display text-4xl md:text-6xl">
            <Shyft>You&apos;re not broken. You&apos;re becoming.</Shyft>
          </h2>
          <p className="text-lg opacity-80">
            <Shyft>
              Book a free 30-minute call. No pitch. No pressure. Just a conversation about
              what&apos;s shifting and what you actually want next.
            </Shyft>
          </p>
          <div className="pt-4">
            <CTAButton href={`${DOCTOR_BASE}/book`} variant="primary">
              Book My Free Call
            </CTAButton>
          </div>
        </div>
      </section>

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
            <p className="opacity-75">
              <Shyft>{body}</Shyft>
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}

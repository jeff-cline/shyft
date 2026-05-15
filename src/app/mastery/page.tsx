import { CTAButton } from "@/components/brand/CTAButton";
import { Logo } from "@/components/brand/Logo";
import { Shyft } from "@/components/brand/Shyft";
import { DOCTOR_BASE, MASTERY_BASE } from "@/lib/urls";

export default function MasteryLanding() {
  return (
    <main>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
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
          </div>
          <div className="flex justify-center">
            <Logo variant="hero" />
          </div>
        </div>
      </section>

      <section className="bg-paper py-20 border-t border-ink/10">
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

      <section className="bg-ink text-paper py-24">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-display text-4xl md:text-6xl">
            <Shyft>The membership is $497/month.</Shyft>
          </h2>
          <p className="text-lg opacity-80">
            <Shyft>
              Weekly live sessions. A library you actually use. A community that gets it.
              Tools that work the moment you pick them up. Cancel anytime.
            </Shyft>
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href={`${MASTERY_BASE}/get-started`} variant="primary">
              Join Now
            </CTAButton>
            <CTAButton href={`${DOCTOR_BASE}/book`} variant="secondary">
              Talk First — Book a Call
            </CTAButton>
          </div>
        </div>
      </section>
    </main>
  );
}

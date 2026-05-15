import { Shyft } from "@/components/brand/Shyft";
import { TESTIMONIALS, type Testimonial } from "./testimonials";

const ACCENT_BG: Record<Testimonial["accent"], string> = {
  "brand-y": "border-brand-y bg-brand-y/5",
  "brand-coral": "border-brand-coral bg-brand-coral/5",
  "brand-teal": "border-brand-teal bg-brand-teal/5",
  ink: "border-ink bg-paper",
};

const ACCENT_TEXT: Record<Testimonial["accent"], string> = {
  "brand-y": "text-brand-y",
  "brand-coral": "text-brand-coral",
  "brand-teal": "text-brand-teal",
  ink: "text-ink",
};

export function TestimonialMarquee() {
  // Split into two rows for opposite-direction scroll.
  const half = Math.ceil(TESTIMONIALS.length / 2);
  const rowA = TESTIMONIALS.slice(0, half);
  const rowB = TESTIMONIALS.slice(half);

  return (
    <section className="marquee py-16 bg-paper border-y border-ink/10">
      <div className="max-w-6xl mx-auto px-6 mb-10 text-center">
        <div className="font-display text-sm uppercase tracking-[0.3em] opacity-60 mb-3">
          <Shyft>Voices From the Program</Shyft>
        </div>
        <h2 className="font-display text-4xl md:text-6xl">
          <Shyft>People who made the shYft.</Shyft>
        </h2>
      </div>

      <Row testimonials={rowA} direction="left" />
      <div className="h-6" />
      <Row testimonials={rowB} direction="right" />
    </section>
  );
}

function Row({
  testimonials,
  direction,
}: {
  testimonials: Testimonial[];
  direction: "left" | "right";
}) {
  // Duplicate the row so the loop is seamless.
  const doubled = [...testimonials, ...testimonials];
  return (
    <div className="overflow-hidden">
      <div
        className={`flex gap-5 w-max ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
      >
        {doubled.map((t, i) => (
          <Card key={`${direction}-${i}`} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

function Card({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure
      className={`rounded-xl border-2 px-6 py-5 w-[340px] sm:w-[400px] shrink-0 ${
        ACCENT_BG[testimonial.accent]
      }`}
    >
      <span
        className={`font-display text-4xl leading-none ${ACCENT_TEXT[testimonial.accent]}`}
        aria-hidden
      >
        &ldquo;
      </span>
      <blockquote className="text-base md:text-lg leading-snug mt-1 mb-3">
        <Shyft>{testimonial.quote}</Shyft>
      </blockquote>
      <figcaption className="text-xs uppercase tracking-widest opacity-70">
        <Shyft>{testimonial.attribution}</Shyft>
      </figcaption>
    </figure>
  );
}

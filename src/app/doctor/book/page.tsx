import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Shyft } from "@/components/brand/Shyft";
import { BookingForm } from "./BookingForm";

export const dynamic = "force-dynamic";

export default function BookPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="max-w-xl mx-auto px-6 py-10">
        <Link href="/" aria-label="Home" className="inline-block mb-8">
          <Logo />
        </Link>

        <h1 className="font-display text-4xl md:text-5xl mb-2">
          <Shyft>Free Breakthrough Call</Shyft>
        </h1>
        <p className="text-lg opacity-80 mb-8">
          Tell us a little about you and you&apos;ll go straight to Krystalore&apos;s calendar to
          pick your time. No cost, no pressure.
        </p>

        <BookingForm />
      </div>
    </main>
  );
}

import { Shyft } from "@/components/brand/Shyft";
import { getSetting } from "@/lib/settings";

export default async function BookPage() {
  const bookingUrl =
    (await getSetting("booking_iframe_url")) || process.env.BOOKING_IFRAME_URL || "";

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl md:text-6xl mb-2">
        <Shyft>Book Your Free Breakthrough Call</Shyft>
      </h1>
      <p className="text-lg opacity-80 mb-8">
        <Shyft>Pick a time that works. We&apos;ll handle the rest.</Shyft>
      </p>

      {bookingUrl ? (
        <div className="rounded-xl overflow-hidden border border-ink/10 bg-white shadow-sm">
          <iframe
            src={bookingUrl}
            className="w-full"
            style={{ height: "min(80vh, 900px)" }}
            title="Booking calendar"
          />
        </div>
      ) : (
        <div className="p-12 border border-dashed border-ink/40 rounded-xl text-center bg-paper/50">
          <p className="text-xl opacity-70 mb-2">
            <Shyft>Scheduling is being configured.</Shyft>
          </p>
          <p className="text-sm opacity-60">
            <Shyft>
              Admin: paste your booking link in Settings → Booking iframe URL. It&apos;ll appear
              here.
            </Shyft>
          </p>
        </div>
      )}
    </main>
  );
}

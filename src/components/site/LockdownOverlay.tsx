import { getSetting } from "@/lib/settings";

/**
 * Full-screen "in training" gate shown over shyftdoctor.com while `doctor_live` is off.
 * Funnels consumers to shyftmaster.com and offers the admin login link.
 */
export async function LockdownOverlay() {
  const photo = (await getSetting("krystalore_photo_url")) || "/krystalore.jpg";
  return (
    <div className="fixed inset-0 z-[100] bg-ink/95 text-paper flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt="Krystalore"
          className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-brand-y bg-paper/10"
        />
        <h1 className="font-display text-4xl md:text-5xl">Doctor In Training</h1>
        <p className="opacity-85 text-lg">
          Please visit Shyftmaster while this is in progress.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <a
            href="https://shyftmaster.com"
            className="bg-brand-y text-paper font-display text-lg px-6 py-3 rounded-md hover:bg-paper hover:text-ink transition-colors"
          >
            Visit Shyftmaster
          </a>
          <a href="/login" className="underline opacity-70 hover:opacity-100 text-sm">
            Admin login
          </a>
        </div>
      </div>
    </div>
  );
}

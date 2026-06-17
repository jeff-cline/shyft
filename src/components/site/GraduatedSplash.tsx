"use client";
import { useEffect } from "react";

/**
 * Shown on shyftmaster.com's home once graduated: a brief "she graduated" splash
 * with Krystalore's photo, then auto-redirects to shyftdoctor.com.
 */
export function GraduatedSplash({ photo, doctorUrl }: { photo: string; doctorUrl: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = doctorUrl;
    }, 4000);
    return () => clearTimeout(t);
  }, [doctorUrl]);

  return (
    <div className="fixed inset-0 z-[100] bg-ink text-paper flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt="Krystalore"
          className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-brand-y bg-paper/10"
        />
        <h1 className="font-display text-4xl md:text-5xl">She Graduated 🎓</h1>
        <p className="opacity-85 text-lg">
          Visit me at <span className="text-brand-y">Shyftdoctor.com</span> — taking you there now…
        </p>
        <a
          href={doctorUrl}
          className="bg-brand-y text-paper font-display text-lg px-6 py-3 rounded-md inline-block hover:bg-paper hover:text-ink transition-colors"
        >
          Go now
        </a>
      </div>
    </div>
  );
}

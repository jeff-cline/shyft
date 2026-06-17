"use client";
import { useEffect, useState } from "react";

/** One-time dismissible "she graduated" welcome banner on shyftdoctor.com once live. */
export function GraduatedBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(!document.cookie.includes("grad_seen=1"));
  }, []);
  if (!show) return null;
  return (
    <div className="bg-brand-y text-paper text-center py-2 px-4 text-sm">
      🎓 Krystalore graduated — welcome to the shYft Doctor.
      <button
        onClick={() => {
          document.cookie = "grad_seen=1; max-age=31536000; path=/";
          setShow(false);
        }}
        className="ml-3 underline"
      >
        Dismiss
      </button>
    </div>
  );
}

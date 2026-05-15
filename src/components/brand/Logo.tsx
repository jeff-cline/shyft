import { Shyft } from "./Shyft";

interface LogoProps {
  variant?: "small" | "hero";
  className?: string;
}

export function Logo({ variant = "small", className = "" }: LogoProps) {
  if (variant === "hero") {
    return (
      <div
        className={`border-2 border-dashed border-ink/30 rounded-xl p-10 md:p-16 inline-flex items-center justify-center bg-transparent w-full max-w-md aspect-square ${className}`}
        aria-label="Logo placeholder"
      >
        <span className="font-display text-4xl md:text-6xl tracking-wide opacity-60 text-center">
          <Shyft>LOGO HERE</Shyft>
        </span>
      </div>
    );
  }
  return (
    <div
      className={`border border-dashed border-ink/40 rounded px-3 py-1.5 inline-flex items-center bg-transparent ${className}`}
      aria-label="Logo placeholder"
    >
      <span className="font-display text-base tracking-wide opacity-70">
        <Shyft>LOGO</Shyft>
      </span>
    </div>
  );
}

interface LogoProps {
  variant?: "small" | "hero" | "mark";
  className?: string;
}

const FULL = "/shyft-master-logo.png"; // full "THE SHYFT MASTER" wordmark
const MARK = "/shyft-y-logo.png"; // square Y-burst mark

export function Logo({ variant = "small", className = "" }: LogoProps) {
  if (variant === "hero") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={FULL}
        alt="The shYft Master — When Shyft Hits the Fan"
        className={`w-full max-w-3xl mx-auto ${className}`}
      />
    );
  }
  if (variant === "mark") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={MARK} alt="shYft" className={`h-full w-auto object-contain ${className}`} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={FULL} alt="The shYft Master" className={`h-12 w-auto ${className}`} />
  );
}

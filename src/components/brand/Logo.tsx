interface LogoProps {
  variant?: "small" | "hero";
  className?: string;
}

const SRC = "/shyft-master-logo.png";

export function Logo({ variant = "small", className = "" }: LogoProps) {
  if (variant === "hero") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={SRC}
        alt="The shYft Master — When Shyft Hits the Fan"
        className={`w-full max-w-md mx-auto ${className}`}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={SRC} alt="The shYft Master" className={`h-12 w-auto ${className}`} />
  );
}

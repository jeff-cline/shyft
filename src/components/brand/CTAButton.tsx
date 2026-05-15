import Link from "next/link";
import React from "react";
import { Shyft } from "./Shyft";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
}

export function CTAButton({
  href,
  children,
  variant = "primary",
  external,
}: CTAButtonProps) {
  const cls =
    variant === "primary"
      ? "bg-brand-y text-paper hover:bg-ink"
      : "bg-transparent border-2 border-ink text-ink hover:bg-ink hover:text-paper";

  const className = `inline-block font-display text-xl md:text-2xl tracking-wide px-8 py-4 rounded-md transition-colors ${cls}`;

  const content = typeof children === "string" ? <Shyft>{children}</Shyft> : children;

  if (external || href.startsWith("http")) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

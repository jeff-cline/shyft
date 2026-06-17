import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { SessionWrapper } from "@/components/SessionWrapper";
import { TrackingTags } from "@/components/site/TrackingTags";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-loaded",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "shYft — Make the shYft",
  description: "Shyft Happens. Now what?",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-paper text-ink antialiased">
        <TrackingTags />
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}

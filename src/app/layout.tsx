import type { Metadata } from "next";
import { Archivo_Black, Montserrat } from "next/font/google";
import "./globals.css";
import { SessionWrapper } from "@/components/SessionWrapper";
import { TrackingTags } from "@/components/site/TrackingTags";

// Display headings: Archivo Black. (Real "Proxima Nova" is licensed via Adobe; Montserrat
// is loaded as the closest free render-fallback for the body/subtext.)
const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-loaded",
  display: "swap",
});

const body = Montserrat({
  subsets: ["latin"],
  variable: "--font-body-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "shYft — Make the shYft",
  description: "Shyft Happens. Now what?",
  icons: { icon: "/shyft-y-logo.png" },
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

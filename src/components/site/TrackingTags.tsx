import Script from "next/script";
import { getSettings } from "@/lib/settings";

/**
 * Injects Google tracking site-wide from admin-configured settings: GA4 + Google Ads
 * gtag, plus a raw head-snippet escape hatch. Renders nothing until IDs are set, so
 * tracking starts the moment the admin saves them.
 */
export async function TrackingTags() {
  // Resilient: never break static generation if the DB isn't reachable at build time
  // (the production deploy runs `prisma db push` after build). Tags still render at
  // runtime on the dynamic marketing routes.
  let s: Record<string, string> = {};
  try {
    s = await getSettings(["ga4_measurement_id", "google_ads_id", "head_tracking_snippet"]);
  } catch {
    return null;
  }
  const gaId = s.ga4_measurement_id?.trim();
  const adsId = s.google_ads_id?.trim();
  const raw = s.head_tracking_snippet?.trim();
  const tagId = gaId || adsId;
  return (
    <>
      {tagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${gaId ? `gtag('config', '${gaId}');` : ""}
${adsId ? `gtag('config', '${adsId}');` : ""}`}
          </Script>
        </>
      )}
      {raw && (
        <Script id="raw-head-tracking" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: raw }} />
      )}
    </>
  );
}

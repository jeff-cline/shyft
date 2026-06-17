import { Shyft } from "@/components/brand/Shyft";
import { getSettings } from "@/lib/settings";
import { IntegrationsForm } from "./IntegrationsForm";

const KEYS = [
  "ghl_inbound_webhook_url",
  "ga4_measurement_id",
  "google_ads_id",
  "google_ads_conversion_label",
  "head_tracking_snippet",
  "dki_enabled",
  "dki_default_h1",
];

export default async function IntegrationsAdmin() {
  const settings = await getSettings(KEYS);
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl mb-2">
        <Shyft>Integrations</Shyft>
      </h1>
      <p className="opacity-70 mb-8">
        Lead routing to GoHighLevel, Google tracking, and dynamic keyword headlines. Paste your
        credentials and Save — everything takes effect immediately.
      </p>
      <IntegrationsForm initial={settings} />
    </main>
  );
}

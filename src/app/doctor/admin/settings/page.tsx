import { Shyft } from "@/components/brand/Shyft";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

const KEYS = [
  "booking_iframe_url",
  "payments_enabled",
  "stripe_pk",
  "stripe_sk",
  "price_mastery_id",
  "price_fitness_id",
  "price_private_id",
  "price_retreat_id",
  "brand_y_hex",
  "logo_url",
];

export default async function SettingsAdmin() {
  const settings = await getSettings(KEYS);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl mb-2">
        <Shyft>Settings</Shyft>
      </h1>
      <p className="opacity-70 mb-8">
        <Shyft>
          Booking link, payments, brand color, logo. Stripe keys are stored here and used
          server-side only.
        </Shyft>
      </p>
      <SettingsForm initial={settings} />
    </main>
  );
}

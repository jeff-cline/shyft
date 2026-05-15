import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * Public brand-config endpoint. Consumed by the WordPress theme (and any other
 * external surface) so that admin Settings updates in the Next.js app flow out
 * to all surfaces without manual sync.
 *
 * Returns { logo_url, brand_y_hex }. Safe to expose — no secrets.
 */
export async function GET() {
  const settings = await getSettings(["logo_url", "brand_y_hex"]);
  return NextResponse.json(
    {
      logo_url: settings.logo_url || "",
      brand_y_hex: settings.brand_y_hex || "#D2691E",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

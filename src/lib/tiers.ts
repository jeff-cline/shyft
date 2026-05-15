export type TierKey = "mastery" | "private" | "retreat" | "fitness" | "none";

export interface TierInfo {
  key: TierKey;
  label: string;
  priceLabel: string;
  priceCents: number;
  interval: "month" | "year";
  stripePriceIdSettingKey: string;
  blurb: string;
  color: string;
}

export const TIERS: Record<TierKey, TierInfo> = {
  mastery: {
    key: "mastery",
    label: "shYft Mastery",
    priceLabel: "$497/mo",
    priceCents: 49700,
    interval: "month",
    stripePriceIdSettingKey: "price_mastery_id",
    blurb: "The core program. Weekly live sessions, library, community.",
    color: "#D2691E",
  },
  private: {
    key: "private",
    label: "Private Client",
    priceLabel: "$3,000/mo",
    priceCents: 300000,
    interval: "month",
    stripePriceIdSettingKey: "price_private_id",
    blurb: "1:1 work. Extended benefits. Direct line.",
    color: "#FF6B5B",
  },
  retreat: {
    key: "retreat",
    label: "Annual Retreat",
    priceLabel: "$7,500/yr",
    priceCents: 750000,
    interval: "year",
    stripePriceIdSettingKey: "price_retreat_id",
    blurb: "In-person, immersive, transformational.",
    color: "#4ECDC4",
  },
  fitness: {
    key: "fitness",
    label: "Fitness",
    priceLabel: "$99/mo",
    priceCents: 9900,
    interval: "month",
    stripePriceIdSettingKey: "price_fitness_id",
    blurb: "Body-first entry tier. Movement, recovery, regulation.",
    color: "#0F1419",
  },
  none: {
    key: "none",
    label: "—",
    priceLabel: "—",
    priceCents: 0,
    interval: "month",
    stripePriceIdSettingKey: "",
    blurb: "",
    color: "#999",
  },
};

export function tierFromString(s: string | null | undefined): TierKey {
  if (s === "mastery" || s === "private" || s === "retreat" || s === "fitness" || s === "none") {
    return s;
  }
  return "none";
}

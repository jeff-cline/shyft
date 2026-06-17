export type BrandKey = "doctor" | "master";

export interface Brand {
  key: BrandKey;
  /** Display name used in the eyebrow + nav, e.g. "shYft Doctor" vs "Shyftmaster". */
  name: string;
  /** Origin used for cross-domain links/redirects. */
  origin: string;
}

export const BRANDS: Record<BrandKey, Brand> = {
  doctor: { key: "doctor", name: "shYft Doctor", origin: "https://shyftdoctor.com" },
  master: { key: "master", name: "Shyftmaster", origin: "https://shyftmaster.com" },
};

import Stripe from "stripe";
import { getSetting } from "@/lib/settings";

export async function getStripe(): Promise<Stripe | null> {
  const sk = await getSetting("stripe_sk");
  if (!sk) return null;
  return new Stripe(sk, { apiVersion: "2025-02-24.acacia" });
}

export async function getPublishableKey(): Promise<string> {
  return (await getSetting("stripe_pk")) || "";
}

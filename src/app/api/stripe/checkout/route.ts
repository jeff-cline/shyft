import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getPaymentsEnabled, getSetting } from "@/lib/settings";
import { getStripe } from "@/lib/stripe";
import { TIERS, tierFromString } from "@/lib/tiers";

export async function POST(req: NextRequest) {
  const { tierKey, email, name } = (await req.json()) as {
    tierKey?: string;
    email?: string;
    name?: string;
  };

  if (!email) {
    return NextResponse.json({ error: "Email required." }, { status: 400 });
  }
  if (!(await getPaymentsEnabled())) {
    return NextResponse.json({ error: "Payments not enabled." }, { status: 400 });
  }

  const tier = TIERS[tierFromString(tierKey ?? "mastery")];
  if (tier.key === "none") {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }

  const priceId = await getSetting(tier.stripePriceIdSettingKey);
  if (!priceId) {
    return NextResponse.json({ error: `Missing Stripe Price ID for ${tier.label}.` }, { status: 400 });
  }

  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe secret key not configured." }, { status: 400 });
  }

  // Ensure a user exists for this email so the webhook can attach the subscription
  let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    const tempPassword = Math.random().toString(36).slice(2) + "X9!";
    const hash = await bcrypt.hash(tempPassword, 10);
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        passwordHash: hash,
        role: "customer",
        status: "prospect",
        mustResetPassword: true,
        currentTier: "none",
        paid: false,
      },
    });
  }

  const origin = req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/mastery/dashboard?welcome=1`,
    cancel_url: `${origin}/mastery/membership`,
    metadata: { userId: user.id, tierKey: tier.key },
    subscription_data: {
      metadata: { userId: user.id, tierKey: tier.key },
    },
  });

  return NextResponse.json({ url: session.url });
}

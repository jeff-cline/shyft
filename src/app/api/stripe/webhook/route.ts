import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = await getSetting("stripe_webhook_secret");
  const raw = await req.text();

  let event: Stripe.Event;
  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bad signature";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } else {
    // No webhook secret configured — accept event but log it (for local dev)
    event = JSON.parse(raw) as Stripe.Event;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tierKey = session.metadata?.tierKey || "mastery";
      if (userId && session.subscription) {
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id || null;
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeSubscriptionId: subId,
            stripeCustomerId: customerId,
            status: "active",
            tier: tierKey,
          },
          create: {
            userId,
            stripeSubscriptionId: subId,
            stripeCustomerId: customerId,
            status: "active",
            tier: tierKey,
          },
        });
        await prisma.user.update({
          where: { id: userId },
          data: { paid: true, currentTier: tierKey },
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        const active = sub.status === "active" || sub.status === "trialing";
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
          create: {
            userId,
            stripeSubscriptionId: sub.id,
            status: sub.status,
            tier: sub.metadata?.tierKey || "mastery",
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        await prisma.user.update({ where: { id: userId }, data: { paid: active } });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        await prisma.subscription.updateMany({
          where: { userId },
          data: { status: "canceled" },
        });
        await prisma.user.update({ where: { id: userId }, data: { paid: false } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

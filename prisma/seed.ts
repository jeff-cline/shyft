import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_ADMINS = [
  { email: "jeff.cline@me.com", name: "Jeff Cline" },
  { email: "krystalore@crewsbeyondlimitsconsulting.com", name: "Krystalore" },
];

async function main() {
  const seedPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!First-Login";
  const hash = await bcrypt.hash(seedPassword, 10);

  for (const admin of SEED_ADMINS) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        passwordHash: hash,
        role: "admin",
        status: "customer",
        mustResetPassword: true,
        currentTier: "none",
        paid: true,
      },
    });
    console.log(`Seeded admin: ${admin.email}`);
  }

  // Default settings
  const defaults: Record<string, string> = {
    payments_enabled: "false",
    booking_iframe_url: process.env.BOOKING_IFRAME_URL || "",
    brand_y_hex: "#D2691E",
    logo_url: "",
    stripe_pk: "",
    stripe_sk: "",
    price_mastery_id: "",
    price_fitness_id: "",
    price_private_id: "",
    price_retreat_id: "",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("Seeded default settings.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

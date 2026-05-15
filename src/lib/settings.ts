import { prisma } from "@/lib/db";

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = "";
  for (const row of rows) out[row.key] = row.value;
  return out;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getPaymentsEnabled(): Promise<boolean> {
  const v = await getSetting("payments_enabled");
  return v === "true";
}

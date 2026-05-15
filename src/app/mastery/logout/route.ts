import { signOut } from "@/auth";

export async function POST() {
  await signOut({ redirect: false });
  return Response.redirect(new URL("/mastery/login", process.env.NEXT_PUBLIC_MASTERY_URL || "http://localhost:3000"));
}

export async function GET() {
  await signOut({ redirect: false });
  return Response.redirect(new URL("/mastery/login", process.env.NEXT_PUBLIC_MASTERY_URL || "http://localhost:3000"));
}

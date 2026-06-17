import { signOut } from "@/auth";

export async function POST() {
  await signOut({ redirect: false });
  return Response.redirect(
    new URL("/doctor/login", process.env.NEXT_PUBLIC_DOCTOR_URL || "http://localhost:3000")
  );
}

export async function GET() {
  await signOut({ redirect: false });
  return Response.redirect(
    new URL("/doctor/login", process.env.NEXT_PUBLIC_DOCTOR_URL || "http://localhost:3000")
  );
}

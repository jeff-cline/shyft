import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DOCTOR_HOSTS = new Set(["shyftdoctor.com", "www.shyftdoctor.com"]);
const MASTERY_HOSTS = new Set(["shyftmastery.com", "www.shyftmastery.com"]);

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase().split(":")[0];
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/doctor") ||
    pathname.startsWith("/mastery") ||
    pathname === "/favicon.svg" ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (DOCTOR_HOSTS.has(host)) {
    const url = req.nextUrl.clone();
    url.pathname = `/doctor${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  if (MASTERY_HOSTS.has(host)) {
    const url = req.nextUrl.clone();
    url.pathname = `/mastery${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};

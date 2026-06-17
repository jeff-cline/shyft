import { BRANDS } from "./brand";

/**
 * Whether Krystalore has "graduated" — i.e. shyftdoctor.com is the public site and
 * shyftmaster.com redirects into it. Driven by the `doctor_live` setting.
 *
 * `settings` is imported lazily so this module's static graph stays free of the `@/`
 * alias + Prisma, keeping `masterPathToDoctorUrl` unit-testable under `node --test`.
 */
export async function isDoctorLive(): Promise<boolean> {
  const { getSetting } = await import("@/lib/settings");
  return (await getSetting("doctor_live")) === "true";
}

/** Map a path on shyftmaster.com to the equivalent absolute shyftdoctor.com URL. */
export function masterPathToDoctorUrl(pathWithQuery: string): string {
  const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  return `${BRANDS.doctor.origin}${path}`;
}

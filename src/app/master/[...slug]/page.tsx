import { permanentRedirect, notFound } from "next/navigation";
import { isDoctorLive, masterPathToDoctorUrl } from "@/lib/site-status";

/**
 * Any deep path on shyftmaster.com. Once graduated, 301-redirect to the matching
 * shyftdoctor.com URL so SEO link equity transfers. Before graduation, shyftmaster
 * has no deep pages yet, so a 404 is correct.
 */
export default async function MasterCatchAll({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = "/" + (slug?.join("/") ?? "");
  if (await isDoctorLive()) {
    permanentRedirect(masterPathToDoctorUrl(path));
  }
  notFound();
}

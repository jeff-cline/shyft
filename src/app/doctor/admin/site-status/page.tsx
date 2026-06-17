import { Shyft } from "@/components/brand/Shyft";
import { getDoctorLive } from "./actions";
import { SiteStatusForm } from "./SiteStatusForm";

export default async function SiteStatusAdmin() {
  const live = await getDoctorLive();
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl mb-2">
        <Shyft>Site Status</Shyft>
      </h1>
      <p className="opacity-70 mb-8">
        Flip between “in training” (shyftdoctor.com locked down, ads run to shyftmaster.com)
        and “graduated” (shyftdoctor.com public, shyftmaster.com redirects here).
      </p>
      <SiteStatusForm initialLive={live} />
    </main>
  );
}

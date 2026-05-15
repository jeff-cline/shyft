import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Shyft } from "@/components/brand/Shyft";
import { ForceResetForm } from "./ForceResetForm";

export default async function ForceResetPage() {
  const session = await auth();
  if (!session?.user) redirect("/mastery/login");

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-4xl md:text-5xl mb-2">
        <Shyft>Set a new password</Shyft>
      </h1>
      <p className="opacity-75 mb-8">
        <Shyft>You&apos;re using a temporary password. Pick something new before continuing.</Shyft>
      </p>
      <ForceResetForm />
    </main>
  );
}

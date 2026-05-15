import { Shyft } from "@/components/brand/Shyft";
import { SignupForm } from "./SignupForm";

interface PageProps {
  searchParams: Promise<{ email?: string; name?: string }>;
}

export default async function SignupPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-5xl md:text-6xl mb-2">
        <Shyft>Create Your Account</Shyft>
      </h1>
      <p className="opacity-75 mb-8">
        <Shyft>Quick step. You&apos;ll change your password right after.</Shyft>
      </p>
      <SignupForm prefilledEmail={sp.email} prefilledName={sp.name} />
    </main>
  );
}

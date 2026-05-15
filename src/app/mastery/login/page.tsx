import { Shyft } from "@/components/brand/Shyft";
import { LoginForm } from "./LoginForm";

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-5xl md:text-6xl mb-2">
        <Shyft>Member Login</Shyft>
      </h1>
      <p className="opacity-75 mb-8">
        <Shyft>Welcome back.</Shyft>
      </p>
      <LoginForm callbackUrl={sp.callbackUrl} initialError={sp.error} />
    </main>
  );
}

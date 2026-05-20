import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { env } from "@/lib/env";

type SignupPageProps = {
  searchParams: {
    returnUrl?: string;
  };
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  const returnUrl = searchParams.returnUrl || "/dashboard";

  return (
    <AuthCard
      eyebrow="New operative request / BitBash Sentry"
      title="Request Access"
      description="Create a verified account before entering the crypto monitoring console."
    >
      <SignupForm
        googleEnabled={Boolean(env.googleClientId && env.googleClientSecret)}
        returnUrl={returnUrl}
      />
    </AuthCard>
  );
}

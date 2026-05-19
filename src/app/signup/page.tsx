import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

type SignupPageProps = {
  searchParams: {
    returnUrl?: string;
  };
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  const returnUrl = searchParams.returnUrl || "/dashboard";

  return (
    <AuthCard
      eyebrow="Create account"
      title="Start monitoring"
      description="Create your BitBash Crypto Sentry account with email and password."
    >
      <SignupForm returnUrl={returnUrl} />
    </AuthCard>
  );
}

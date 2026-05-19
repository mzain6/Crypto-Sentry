import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { env } from "@/lib/env";

type LoginPageProps = {
  searchParams: {
    returnUrl?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const returnUrl = searchParams.returnUrl || "/dashboard";

  return (
    <AuthCard
      eyebrow="Establish secure link / BitBash Sentry"
      title="Access Terminal"
      description="Authenticate your identity to enter the crypto monitoring console."
    >
      <LoginForm
        googleEnabled={Boolean(env.googleClientId && env.googleClientSecret)}
        returnUrl={returnUrl}
      />
    </AuthCard>
  );
}

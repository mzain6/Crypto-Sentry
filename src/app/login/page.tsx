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
      eyebrow="Welcome back"
      title="Sign in"
      description="Access your crypto monitoring workspace, alerts, and watchlist."
    >
      <LoginForm
        googleEnabled={Boolean(env.googleClientId && env.googleClientSecret)}
        returnUrl={returnUrl}
      />
    </AuthCard>
  );
}

import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailStatus } from "@/components/auth/verify-email-status";

type VerifyEmailPageProps = {
  searchParams: {
    token?: string;
  };
};

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const token = searchParams.token ?? "";

  return (
    <AuthCard
      eyebrow="Identity verification / BitBash Sentry"
      title="Verify Identity"
      description="Confirm inbox ownership before the access terminal is unlocked."
    >
      {token ? (
        <VerifyEmailStatus token={token} />
      ) : (
        <p className="form-message error">Verification token is missing.</p>
      )}
    </AuthCard>
  );
}

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetPasswordPageProps = {
  searchParams: {
    token?: string;
  };
};

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const token = searchParams.token ?? "";

  return (
    <AuthCard
      eyebrow="Credential reset / BitBash Sentry"
      title="Reset Passkey"
      description="Choose a new secure passkey for your crypto monitoring console."
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="form-message error">Reset token is missing.</p>
      )}
    </AuthCard>
  );
}

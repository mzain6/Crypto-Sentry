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
      eyebrow="New password"
      title="Set password"
      description="Choose a new password for your BitBash Crypto Sentry account."
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="form-message error">Reset token is missing.</p>
      )}
    </AuthCard>
  );
}


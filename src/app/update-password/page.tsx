import { AuthCard } from "@/components/auth/auth-card";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

type UpdatePasswordPageProps = {
  searchParams: {
    token?: string;
  };
};

export default function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const token = searchParams.token ?? "";

  return (
    <AuthCard
      eyebrow="Credential update / BitBash Sentry"
      title="Update Passkey"
      description="Reset an existing passkey or create the first local passkey for your account."
    >
      {token ? (
        <UpdatePasswordForm token={token} />
      ) : (
        <p className="form-message error">Password token is missing.</p>
      )}
    </AuthCard>
  );
}

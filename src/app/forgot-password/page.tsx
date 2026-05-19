import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Recovery protocol / BitBash Sentry"
      title="Recover Access"
      description="Generate a secure password reset or first-time password setup link."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

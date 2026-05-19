import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Password help"
      title="Reset access"
      description="Enter your account email and a reset link will be printed in the dev server terminal."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}


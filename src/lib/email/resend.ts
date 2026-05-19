import { Resend } from "resend";

import { env } from "@/lib/env";

type VerificationEmailInput = {
  to: string;
  name: string;
  verificationUrl: string;
};

type PasswordRecoveryEmailInput = {
  to: string;
  name: string;
  tokenType: "reset" | "set";
  updatePasswordUrl: string;
};

function getResendClient() {
  if (!env.resendApiKey || !env.authFromEmail) {
    return null;
  }

  return new Resend(env.resendApiKey);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
}: VerificationEmailInput) {
  const resend = getResendClient();

  if (!resend || !env.authFromEmail) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`Email verification link for ${to}: ${verificationUrl}`);
      return;
    }

    throw new Error("Resend email delivery is not configured.");
  }

  await resend.emails.send({
    from: env.authFromEmail,
    to,
    subject: "Verify your BitBash Crypto Sentry email",
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Please verify your email address to activate your BitBash Crypto Sentry account.</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function sendPasswordRecoveryEmail({
  to,
  name,
  tokenType,
  updatePasswordUrl,
}: PasswordRecoveryEmailInput) {
  const resend = getResendClient();
  const isReset = tokenType === "reset";

  if (!resend || !env.authFromEmail) {
    if (process.env.NODE_ENV !== "production") {
      const label = isReset ? "Password reset" : "Password setup";
      console.log(`${label} link for ${to}: ${updatePasswordUrl}`);
      return;
    }

    throw new Error("Resend email delivery is not configured.");
  }

  await resend.emails.send({
    from: env.authFromEmail,
    to,
    subject: isReset
      ? "Reset your BitBash Crypto Sentry password"
      : "Set your BitBash Crypto Sentry password",
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>${
        isReset
          ? "Use the link below to reset your password."
          : "Use the link below to create your first local password."
      }</p>
      <p><a href="${updatePasswordUrl}">Update Password</a></p>
      <p>This link expires in 30 minutes.</p>
    `,
  });
}

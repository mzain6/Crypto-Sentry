"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  updatePasswordSchema,
} from "@/lib/auth/schemas";
import { createPasswordToken, hashResetToken } from "@/lib/auth/tokens";
import { sendPasswordRecoveryEmail } from "@/lib/email/resend";
import { prisma } from "@/lib/prisma";

type PasswordActionState = {
  message: string | null;
  tone: "error" | "success";
};

const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If this account exists, a password link has been created.";

function buildPasswordUpdateUrl(token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return `${baseUrl}/update-password?token=${token}`;
}

export async function forgotPasswordAction(
  _previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Enter a valid email.",
      tone: "error",
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: { provider: "google" },
      },
    },
  });

  if (!user) {
    return { message: GENERIC_FORGOT_PASSWORD_MESSAGE, tone: "success" };
  }

  const tokenType: "reset" | "set" | null = user.passwordHash
    ? "reset"
    : user.accounts.length > 0
      ? "set"
      : null;

  if (!tokenType) {
    return { message: GENERIC_FORGOT_PASSWORD_MESSAGE, tone: "success" };
  }

  const { token, tokenHash } = createPasswordToken();
  const passwordTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
  const updatePasswordUrl = buildPasswordUpdateUrl(token);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordTokenHash: tokenHash,
      passwordTokenType: tokenType,
      passwordTokenExpiry,
    },
  });

  await sendPasswordRecoveryEmail({
    to: user.email,
    name: user.name,
    tokenType,
    updatePasswordUrl,
  });

  return { message: GENERIC_FORGOT_PASSWORD_MESSAGE, tone: "success" };
}

export async function updatePasswordAction(
  _previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const parsed = updatePasswordSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Invalid password data.",
      tone: "error",
    };
  }

  const tokenHash = hashResetToken(parsed.data.token);
  const user = await prisma.user.findFirst({
    where: {
      passwordTokenHash: tokenHash,
      passwordTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (
    !user ||
    (user.passwordTokenType !== "reset" && user.passwordTokenType !== "set")
  ) {
    return {
      message: "This password link is invalid or has expired.",
      tone: "error",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordTokenHash: null,
      passwordTokenType: null,
      passwordTokenExpiry: null,
    },
  });

  redirect("/login");
}

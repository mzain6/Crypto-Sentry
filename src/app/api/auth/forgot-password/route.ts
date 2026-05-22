import { NextResponse } from "next/server";

import { forgotPasswordSchema } from "@/lib/auth/schemas";
import { createResetToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid email address." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const { token, tokenHash } = createResetToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordTokenHash: tokenHash,
        passwordTokenType: user.passwordHash ? "reset" : "set",
        passwordTokenExpiry: expiresAt,
      },
    });

    console.log(
      `Password reset link for ${email}: ${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`,
    );
  }

  return NextResponse.json({
    message:
      "If an account exists for that email, a reset link has been created.",
  });
}

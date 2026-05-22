import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { resetPasswordSchema } from "@/lib/auth/schemas";
import { hashResetToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid reset data." },
      { status: 400 },
    );
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

  if (!user) {
    return NextResponse.json(
      { message: "This reset link is invalid or has expired." },
      { status: 400 },
    );
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

  return NextResponse.json({ message: "Password has been reset." });
}

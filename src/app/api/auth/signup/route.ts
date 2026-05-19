import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { createAndSendEmailVerification } from "@/lib/auth/email-verification";
import { signupSchema } from "@/lib/auth/schemas";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid sign up data." },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "An account already exists for this email." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      emailVerified: null,
    },
  });

  await createAndSendEmailVerification({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  return NextResponse.json(
    {
      message:
        "Account created. Please check your email to verify your account before logging in.",
    },
    { status: 201 },
  );
}

import { NextResponse } from "next/server";

import { verifyEmailToken } from "@/lib/auth/email-verification";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string };
  const token = body.token ?? "";

  if (!token) {
    return NextResponse.json(
      { message: "Verification token is missing." },
      { status: 400 },
    );
  }

  const verified = await verifyEmailToken(token);

  if (!verified) {
    return NextResponse.json(
      { message: "This verification link is invalid or has expired." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: "Email verified. You can now log in.",
  });
}


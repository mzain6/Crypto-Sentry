import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { changeUserPassword, validatePasswordStrength } from "@/lib/profile";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    confirmPassword?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { message: "New password and confirmation do not match." },
      { status: 400 },
    );
  }

  const strength = validatePasswordStrength(newPassword);

  if (!strength.valid) {
    return NextResponse.json({ message: strength.message }, { status: 400 });
  }

  try {
    await changeUserPassword({
      currentPassword,
      newPassword,
      userId: session.user.id,
    });

    return NextResponse.json({
      message: "Password changed. Please sign in again.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Could not change password.",
      },
      { status: 400 },
    );
  }
}

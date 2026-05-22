import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getProfileSummary, updateProfileName } from "@/lib/profile";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileSummary(session.user.id);

  if (!profile) {
    return NextResponse.json({ message: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string };

  try {
    const user = await updateProfileName(session.user.id, body.name ?? "");

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Could not update profile.",
      },
      { status: 400 },
    );
  }
}

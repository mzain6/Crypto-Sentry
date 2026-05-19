import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getValidGoogleAccessToken } from "@/lib/google-token";

const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const accessToken = await getValidGoogleAccessToken(session.user.id);
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const profile = await response.json();

    if (!response.ok) {
      return NextResponse.json(profile, { status: response.status });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Could not load Google profile.",
      },
      { status: 400 },
    );
  }
}


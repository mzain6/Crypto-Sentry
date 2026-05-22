import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getUserSettings, updateUserSettings } from "@/lib/settings";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const settings = await getUserSettings(session.user.id);

  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    defaultAlertThresholdPercent?: number | string;
  };
  const threshold = Number(body.defaultAlertThresholdPercent);

  try {
    const settings = await updateUserSettings({
      defaultAlertThresholdPercent: threshold,
      userId: session.user.id,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Could not update settings.",
      },
      { status: 400 },
    );
  }
}

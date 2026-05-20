import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { hasSeenDashboardTutorial: true },
    create: {
      userId: session.user.id,
      hasSeenDashboardTutorial: true,
    },
  });

  return NextResponse.json({ hasSeenDashboardTutorial: true });
}

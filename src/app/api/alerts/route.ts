import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getUserAlerts } from "@/lib/alerts";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const alerts = await getUserAlerts(session.user.id);

  return NextResponse.json({ alerts });
}

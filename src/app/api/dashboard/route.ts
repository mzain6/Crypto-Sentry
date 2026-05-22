import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getDashboardData } from "@/lib/dashboard";

function timestamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function shortUserId(userId: string) {
  return userId.slice(0, 8);
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const dashboard = await getDashboardData(session.user.id);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[${timestamp()}] [poll] dashboard user=${shortUserId(session.user.id)} watchlist=${dashboard.watchlist.length} alerts=${dashboard.recentAlerts.length}`,
    );
  }

  return NextResponse.json(dashboard);
}

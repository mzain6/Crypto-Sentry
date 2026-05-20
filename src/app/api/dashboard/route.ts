import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getDashboardData } from "@/lib/dashboard";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Dashboard opens -> frontend calls /api/dashboard");
    console.log("Prisma reads PostgreSQL -> dashboard data is returned");
  }

  const dashboard = await getDashboardData(session.user.id);

  return NextResponse.json(dashboard);
}

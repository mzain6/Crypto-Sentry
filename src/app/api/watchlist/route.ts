import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getUserWatchlist } from "@/lib/watchlist";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const watchlist = await getUserWatchlist(session.user.id);

  return NextResponse.json({ watchlist });
}

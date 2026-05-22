import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getUserWatchlist } from "@/lib/watchlist";

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

  const watchlist = await getUserWatchlist(session.user.id);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[${timestamp()}] [poll] watchlist user=${shortUserId(session.user.id)} coins=${watchlist.length}`,
    );
  }

  return NextResponse.json({ watchlist });
}

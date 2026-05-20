import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { addCoinToWatchlist, removeCoinFromWatchlist } from "@/lib/watchlist";

type WatchlistCoinRouteContext = {
  params: {
    coinId: string;
  };
};

export async function POST(
  _request: NextRequest,
  { params }: WatchlistCoinRouteContext,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const watchlist = await addCoinToWatchlist(session.user.id, params.coinId);

  if (!watchlist) {
    return NextResponse.json({ message: "Coin not found" }, { status: 404 });
  }

  return NextResponse.json({ isWatchlisted: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: WatchlistCoinRouteContext,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await removeCoinFromWatchlist(session.user.id, params.coinId);

  return NextResponse.json({ isWatchlisted: false });
}

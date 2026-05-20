import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getMarketCoins, parseMarketSearchParams } from "@/lib/watchlist";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = parseMarketSearchParams(request.nextUrl.searchParams);
  const result = await getMarketCoins({
    ...params,
    userId: session.user.id,
  });

  return NextResponse.json(result);
}

import { WatchlistTable } from "@/components/watchlist/watchlist-table";
import { getCurrentSession } from "@/lib/auth/session";
import { getUserWatchlist } from "@/lib/watchlist";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const session = await getCurrentSession();
  const watchlist = session?.user?.id
    ? await getUserWatchlist(session.user.id)
    : [];

  return <WatchlistTable initialWatchlist={watchlist} />;
}

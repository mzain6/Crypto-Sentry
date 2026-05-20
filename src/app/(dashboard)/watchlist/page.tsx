import { auth } from "@/auth";
import { WatchlistTable } from "@/components/watchlist/watchlist-table";
import { getUserWatchlist } from "@/lib/watchlist";

export default async function WatchlistPage() {
  const session = await auth();
  const watchlist = session?.user?.id
    ? await getUserWatchlist(session.user.id)
    : [];

  return <WatchlistTable initialWatchlist={watchlist} />;
}

import { auth } from "@/auth";
import { MarketTable } from "@/components/watchlist/market-table";
import { getMarketCoins } from "@/lib/watchlist";

export const dynamic = "force-dynamic";

export default async function MarketDataPage() {
  const session = await auth();
  const initialData = session?.user?.id
    ? await getMarketCoins({
        direction: "desc",
        page: 1,
        pageSize: 20,
        search: "",
        sort: "marketCap",
        userId: session.user.id,
      })
    : {
        coins: [],
        page: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 1,
      };

  return (
    <>
      <section className="terminal-page-heading">
        <div className="terminal-page-icon" aria-hidden="true">
          <span />
        </div>
        <div>
          <h1>Market Data</h1>
          <p>Full ingested asset feed</p>
        </div>
      </section>
      <MarketTable initialData={initialData} />
    </>
  );
}

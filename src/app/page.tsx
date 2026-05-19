export default function Home() {
  return (
    <main className="page">
      <section className="shell">
        <div className="eyebrow">Module 1 Infrastructure</div>
        <h1>BitBash Crypto Sentry</h1>
        <p>
          The project foundation is ready for PostgreSQL, Prisma migrations, and
          live CoinGecko ingestion. Run the ingestion script to populate the
          simplified coins table and create price snapshots.
        </p>
        <div className="actions">
          <a className="button primary" href="/api/health">
            Check Health
          </a>
          <a className="button" href="/api/coins">
            View Coins API
          </a>
        </div>
        <div className="status" aria-label="Module 1 status">
          <div>
            <strong>Database</strong>
            PostgreSQL via Docker Compose
          </div>
          <div>
            <strong>Schema</strong>
            users, coins, coin_price_snapshots
          </div>
          <div>
            <strong>Ingestion</strong>
            CoinGecko top market coins
          </div>
        </div>
      </section>
    </main>
  );
}


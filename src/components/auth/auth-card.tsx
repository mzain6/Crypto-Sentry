type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-terminal">
          <div className="auth-mark" aria-hidden="true">
            <span />
          </div>
          <div className="auth-copy">
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="auth-panel">{children}</div>
        </div>
        <div className="auth-visual" aria-hidden="true">
          <div className="market-grid">
            <span className="candle candle-a" />
            <span className="candle candle-b" />
            <span className="candle candle-c" />
            <span className="candle candle-d" />
            <span className="candle candle-e" />
            <span className="candle candle-f" />
          </div>
          <div className="coin-stack">
            <span>BUY</span>
            <span>HOLD</span>
            <span>SELL</span>
          </div>
          <div className="protocol-card">
            <div className="eyebrow">Protocol Active</div>
            <strong>Secure Asset Monitoring //</strong>
            <p>Track market movement and protect access to your crypto workspace.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function AlertsPage() {
  return (
    <>
      <section className="terminal-page-heading">
        <div className="terminal-page-icon" aria-hidden="true">
          <span />
        </div>
        <div>
          <h1>Alerts</h1>
          <p>Triggered conditions and system notifications</p>
        </div>
      </section>
      <section className="terminal-panel terminal-empty-panel">
        <div>
          <div className="terminal-panel-kicker">Alert Channel</div>
          <h2>Alerts Module Pending</h2>
          <p>
            Triggered alerts are visible on the dashboard. Creation and evaluation
            come in Module 5.
          </p>
        </div>
      </section>
    </>
  );
}

export default function SettingsPage() {
  return (
    <>
      <section className="terminal-page-heading">
        <div className="terminal-page-icon" aria-hidden="true">
          <span />
        </div>
        <div>
          <h1>Settings</h1>
          <p>System preferences and account configuration</p>
        </div>
      </section>
      <section className="terminal-panel terminal-empty-panel">
        <div>
          <div className="terminal-panel-kicker">System Preferences</div>
          <h2>Settings Module Pending</h2>
          <p>Account and application preferences will be added in a later module.</p>
        </div>
      </section>
    </>
  );
}

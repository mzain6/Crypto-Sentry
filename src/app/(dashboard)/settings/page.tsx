import { auth } from "@/auth";
import { SettingsClient } from "@/components/settings/settings-client";
import { getUserSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const session = await auth();
  const settings = session?.user?.id
    ? await getUserSettings(session.user.id)
    : null;

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
      {settings ? (
        <SettingsClient initialSettings={settings} />
      ) : (
        <section className="terminal-panel terminal-empty-panel">
          <div>
            <div className="terminal-panel-kicker">System Preferences</div>
            <h2>Settings Unavailable</h2>
            <p>Authenticate again to load your settings.</p>
          </div>
        </section>
      )}
    </>
  );
}

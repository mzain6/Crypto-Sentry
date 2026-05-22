import { auth } from "@/auth";
import { AlertsClient } from "@/components/alerts/alerts-client";
import { getUserAlerts } from "@/lib/alerts";

export default async function AlertsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const alerts = await getUserAlerts(session.user.id);

  return (
    <>
      <section className="terminal-page-heading">
        <div className="terminal-page-icon" aria-hidden="true">
          <span />
        </div>
        <div>
          <h1>Alerts</h1>
          <p>Watchlist price movement detection feed</p>
        </div>
      </section>

      <AlertsClient initialAlerts={alerts} />
    </>
  );
}

import { getServerSession } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?returnUrl=/dashboard");
  }

  return (
    <main className="page">
      <section className="shell dashboard-shell">
        <div className="eyebrow">Protected dashboard</div>
        <h1>Welcome, {session.user.name}</h1>
        <p>
          You are signed in to BitBash Crypto Sentry. Module 3 will replace
          this placeholder with the full portfolio, watchlist, and alerts
          dashboard.
        </p>
        <div className="profile-row">
          {session.user.image ? (
            <Image
              alt={`${session.user.name ?? "User"} avatar`}
              className="avatar"
              height={64}
              src={session.user.image}
              width={64}
            />
          ) : (
            <div className="avatar fallback" aria-hidden="true">
              {session.user.name?.slice(0, 1).toUpperCase() ?? "U"}
            </div>
          )}
          <div>
            <strong>{session.user.name}</strong>
            <span>{session.user.email}</span>
          </div>
        </div>
        <div className="actions">
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}


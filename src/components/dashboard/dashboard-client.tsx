"use client";

import { useEffect, useState } from "react";

import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { FeaturedAssets } from "@/components/dashboard/featured-assets";
import { DashboardTour } from "@/components/dashboard/dashboard-tour";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { MarketPulse } from "@/components/dashboard/market-pulse";
import { TopMovers } from "@/components/dashboard/top-movers";
import { WatchlistSnapshot } from "@/components/dashboard/watchlist-snapshot";
import type { DashboardData } from "@/lib/dashboard";

type DashboardClientProps = {
  initialData: DashboardData | null;
};

const DASHBOARD_REFRESH_INTERVAL_MS = 5_000;

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    let active = true;

    async function refreshDashboard() {
      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const nextData = (await response.json()) as DashboardData;

      if (active) {
        setData(nextData);
      }
    }

    const interval = window.setInterval(
      refreshDashboard,
      DASHBOARD_REFRESH_INTERVAL_MS,
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!data) {
    return (
      <section className="terminal-panel terminal-empty-panel">
        <div>
          <div className="terminal-panel-kicker">No Session</div>
          <h2>Dashboard unavailable</h2>
          <p>Authenticate again to load the dashboard feed.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="dashboard-grid" id="dashboard-card-cluster">
        <MarketOverview portfolio={data.portfolio} />
        <FeaturedAssets coins={data.watchlist} />
        <AlertsPanel alerts={data.recentAlerts} />
        <TopMovers topMovers={data.topMovers} />
        <MarketPulse portfolio={data.portfolio} />
        <WatchlistSnapshot watchlist={data.watchlist} />
      </div>
      <DashboardTour enabled={!data.hasSeenDashboardTutorial} />
    </>
  );
}

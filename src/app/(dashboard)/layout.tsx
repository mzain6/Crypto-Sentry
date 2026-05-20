import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?returnUrl=/dashboard");
  }

  return (
    <div className="terminal-dashboard">
      <DashboardSidebar user={session.user} />
      <div className="terminal-workspace">
        <DashboardTopbar user={session.user} />
        <main className="terminal-main">
          <section className="terminal-header">
            <div className="terminal-header-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div>
              <h1>TERMINAL ONE</h1>
              <p>REAL-TIME INTELLIGENCE AGGREGATE V4.2.0</p>
            </div>
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}

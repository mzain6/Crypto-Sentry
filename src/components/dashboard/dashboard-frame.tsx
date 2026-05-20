"use client";

import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";

import { DashboardTopbar } from "@/components/dashboard/topbar";

type DashboardFrameProps = {
  children: ReactNode;
  user: Session["user"];
};

export function DashboardFrame({ children, user }: DashboardFrameProps) {
  const pathname = usePathname();
  const isDashboardPage = pathname === "/dashboard";

  return (
    <div className="terminal-workspace">
      {isDashboardPage ? <DashboardTopbar user={user} /> : null}
      <main className="terminal-main">
        {isDashboardPage ? (
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
        ) : null}
        {children}
      </main>
    </div>
  );
}

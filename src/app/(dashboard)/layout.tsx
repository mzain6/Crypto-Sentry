import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardFrame } from "@/components/dashboard/dashboard-frame";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { getCurrentSession } from "@/lib/auth/session";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/login?returnUrl=/dashboard");
  }

  return (
    <div className="terminal-dashboard">
      <DashboardSidebar user={session.user} />
      <DashboardFrame user={session.user}>{children}</DashboardFrame>
    </div>
  );
}

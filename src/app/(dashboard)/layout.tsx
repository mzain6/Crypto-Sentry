import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardFrame } from "@/components/dashboard/dashboard-frame";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

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
      <DashboardFrame user={session.user}>{children}</DashboardFrame>
    </div>
  );
}

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getCurrentSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const dashboard = session?.user?.id
    ? await getDashboardData(session.user.id)
    : null;

  return <DashboardClient initialData={dashboard} />;
}

import { auth } from "@/auth";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  const dashboard = session?.user?.id
    ? await getDashboardData(session.user.id)
    : null;

  return <DashboardClient initialData={dashboard} />;
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";
import { AdminDashboard, PartnerDashboard, UserDashboard } from "./DashboardViews";

export default async function DashboardPage() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login");

  let response: Response;
  try {
    response = await fetch(`${backendApiUrl}/api/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    redirect("/login?unavailable=1");
  }

  if (!response.ok) redirect("/login?expired=1");
  const summary = await response.json();

  if (summary.role === "super_admin") return <AdminDashboard summary={summary} />;
  if (summary.role === "partner") return <PartnerDashboard summary={summary} />;
  return <UserDashboard summary={summary} />;
}

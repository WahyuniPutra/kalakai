import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";
import type { DashboardUser } from "../DashboardShell";

export async function getInvitationBuilderUser(): Promise<DashboardUser> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login");
  try {
    const response = await fetch(`${backendApiUrl}/api/user`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) redirect("/login?expired=1");
    const user = await response.json();
    if (user.role !== "user") redirect("/dashboard");
    return user;
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    redirect("/login?unavailable=1");
  }
}

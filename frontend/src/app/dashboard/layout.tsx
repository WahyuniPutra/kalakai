import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login");

  try {
    const response = await fetch(`${backendApiUrl}/api/user`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) redirect("/login?expired=1");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    redirect("/login?unavailable=1");
  }

  return children;
}

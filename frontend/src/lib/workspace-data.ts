import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendApiUrl, sessionCookie } from "./auth-proxy";

export async function workspaceData<T>(path: string): Promise<T> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login");
  const response = await fetch(backendApiUrl + path, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/login?expired=1");
  if (response.status === 403) redirect("/dashboard");
  if (!response.ok) throw new Error("Data ruang kerja belum dapat dimuat.");
  return response.json();
}

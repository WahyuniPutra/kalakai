import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = { title: "Profil akun — Kalakai" };

export default async function ProfilePage() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login");
  let response: Response;
  try {
    response = await fetch(`${backendApiUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new Error("Profil belum dapat diakses. Muat ulang halaman.");
  }
  if (response.status === 401) redirect("/login?expired=1");
  if (response.status === 403) redirect("/dashboard");
  if (!response.ok) throw new Error("Profil belum dapat dimuat.");
  const profile = await response.json();
  return <ProfileForm profile={profile} />;
}

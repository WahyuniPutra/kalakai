import { Suspense } from "react";
import { cookies } from "next/headers";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";
import ReceptionistClient from "./ReceptionistClient";

export default async function Page({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;

  // Check if session token exists in cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  let currentUser = null;

  if (token) {
    try {
      const res = await fetch(`${backendApiUrl}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      if (res.ok) {
        currentUser = await res.json();
      }
    } catch (err) {
      console.error("Failed to fetch user in receptionist page:", err);
    }
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-400 font-mono">
          Memuat Meja Resepsionis Kalakai...
        </div>
      }
    >
      <ReceptionistClient eventSlug={eventSlug} initialUser={currentUser} />
    </Suspense>
  );
}

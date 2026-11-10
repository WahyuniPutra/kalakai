import { Suspense } from "react";
import ReceptionistClient from "./ReceptionistClient";

export default async function Page({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-400">Memuat Buku Tamu...</div>}>
      <ReceptionistClient eventSlug={eventSlug} />
    </Suspense>
  );
}
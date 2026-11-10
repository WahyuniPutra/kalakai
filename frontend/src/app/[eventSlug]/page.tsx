import { Suspense } from "react";
import InvitationClient from "./[guestSlug]/InvitationClient";

export default async function Page({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center text-rose-300 font-serif">Memuat Undangan...</div>}>
      <InvitationClient eventSlug={eventSlug} />
    </Suspense>
  );
}
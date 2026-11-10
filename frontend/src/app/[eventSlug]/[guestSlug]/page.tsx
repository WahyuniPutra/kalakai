import { Suspense } from "react";
import InvitationClient from "./InvitationClient";

export default async function Page({
  params,
}: {
  params: Promise<{ eventSlug: string; guestSlug: string }>;
}) {
  const { eventSlug, guestSlug } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center text-rose-300 font-serif">Memuat Undangan...</div>}>
      <InvitationClient eventSlug={eventSlug} guestSlug={guestSlug} />
    </Suspense>
  );
}
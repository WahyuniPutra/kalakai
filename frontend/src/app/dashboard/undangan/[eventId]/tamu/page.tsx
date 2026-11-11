import { Suspense } from "react";
import { getInvitationBuilderUser } from "../../get-user";
import GuestManagerClient from "./GuestManagerClient";

export default async function GuestManagerPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const user = await getInvitationBuilderUser();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center text-rose-400 font-mono">
          Memuat Manajemen Tamu Kalakai...
        </div>
      }
    >
      <GuestManagerClient eventId={eventId} user={user} />
    </Suspense>
  );
}

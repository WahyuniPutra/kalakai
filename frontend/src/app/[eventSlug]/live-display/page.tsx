import { Suspense } from "react";
import LiveDisplayClient from "./LiveDisplayClient";

export default async function Page({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400 font-mono">
          Menyiapkan Layar Proyektor Kalakai...
        </div>
      }
    >
      <LiveDisplayClient eventSlug={eventSlug} />
    </Suspense>
  );
}

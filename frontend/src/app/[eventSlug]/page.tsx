import { Suspense } from "react";
import type { Metadata } from "next";
import { backendApiUrl } from "@/lib/auth-proxy";
import InvitationClient from "./[guestSlug]/InvitationClient";

type Props = {
  params: Promise<{ eventSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventSlug } = await params;

  try {
    const res = await fetch(`${backendApiUrl}/api/events/${eventSlug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        title: "Undangan Digital Kalakai",
        description: "Buka undangan digital resmi di Kerabat Kalakai.",
      };
    }

    const json = await res.json();
    const event = json.data;

    const coupleTitle = event?.groom_name && event?.bride_name
      ? `${event.groom_name} & ${event.bride_name}`
      : event?.title || "Hari Bahagia";

    const title = `${event?.title || "Undangan Pernikahan"} — Kalakai`;
    const description = `Dengan penuh rasa syukur, kami mengundang Anda untuk merayakan momen bahagia ${coupleTitle}. Buka tautan untuk melihat detail acara dan mengirim ucapan doa.`;

    const heroImage = event?.theme_config?.hero_image_url || "/opengraph-image";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        locale: "id_ID",
        siteName: "Kalakai",
        images: [
          {
            url: heroImage,
            width: 1200,
            height: 630,
            alt: `Undangan ${coupleTitle}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [heroImage],
      },
    };
  } catch {
    return {
      title: "Undangan Digital Kalakai",
      description: "Buka undangan digital resmi di Kerabat Kalakai.",
    };
  }
}

export default async function Page({ params }: Props) {
  const { eventSlug } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center text-rose-300 font-serif">
          Memuat Undangan...
        </div>
      }
    >
      <InvitationClient eventSlug={eventSlug} />
    </Suspense>
  );
}

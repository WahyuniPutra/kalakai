import { Suspense } from "react";
import type { Metadata } from "next";
import { backendApiUrl } from "@/lib/auth-proxy";
import InvitationClient from "./InvitationClient";

type Props = {
  params: Promise<{ eventSlug: string; guestSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventSlug, guestSlug } = await params;

  try {
    const res = await fetch(`${backendApiUrl}/api/events/${eventSlug}/guest/${guestSlug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        title: "Undangan Digital Kalakai",
        description: "Buka undangan digital resmi di Kerabat Kalakai.",
      };
    }

    const json = await res.json();
    const event = json.data?.event;
    const guest = json.data?.guest;

    const guestName = guest?.name || ucwords(guestSlug.replace(/-/g, " "));
    const coupleTitle = event?.groom_name && event?.bride_name
      ? `${event.groom_name} & ${event.bride_name}`
      : event?.title || "Hari Bahagia";

    const title = `The Wedding of ${coupleTitle} — Khusus untuk ${guestName}`;
    const description = `Kepada Yth. ${guestName}, kami mengundang Anda untuk merayakan momen bahagia bersama kami. Buka tautan untuk melihat jadwal, lokasi, dan tiket QR masuk.`;

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
      description: "Buka undangan digital resmi dan konfirmasi kehadiran di Kerabat Kalakai.",
    };
  }
}

function ucwords(str: string) {
  return str.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export default async function Page({ params }: Props) {
  const { eventSlug, guestSlug } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center text-rose-300 font-serif">
          Memuat Undangan...
        </div>
      }
    >
      <InvitationClient eventSlug={eventSlug} guestSlug={guestSlug} />
    </Suspense>
  );
}

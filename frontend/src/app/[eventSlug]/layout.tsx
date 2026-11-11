import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { backendApiUrl } from "@/lib/auth-proxy";
import { publicMetadata } from "@/lib/seo";

const getEvent = cache(async (slug: string) => {
  const response = await fetch(`${backendApiUrl}/api/events/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Undangan belum dapat dimuat.");
  return (await response.json()).data as { title: string; slug: string };
});

export async function generateMetadata({ params }: LayoutProps<"/[eventSlug]">): Promise<Metadata> {
  const event = await getEvent((await params).eventSlug);
  return {
    ...(event ? publicMetadata(`${event.title} — Kalakai`, "Undangan digital untuk merayakan momen istimewa bersama keluarga dan kerabat.", `/${event.slug}`) : { title: "Undangan tidak ditemukan — Kalakai" }),
    robots: { index: false, follow: false },
  };
}

export default async function InvitationLayout({ children, params }: LayoutProps<"/[eventSlug]">) {
  if (!await getEvent((await params).eventSlug)) notFound();
  return children;
}

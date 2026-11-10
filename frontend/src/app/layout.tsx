import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kalakai.site"),
  title: "Kalakai — Ruang Acara Digital",
  description: "Kelola undangan digital, tamu, RSVP, dan check-in QR acara Anda bersama Kalakai.",
  openGraph: {
    title: "Kalakai — Ruang Acara Digital",
    description: "Kelola undangan digital, tamu, RSVP, dan check-in QR acara Anda bersama Kalakai.",
    url: "https://kalakai.site",
    siteName: "Kalakai",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9084365919094850"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

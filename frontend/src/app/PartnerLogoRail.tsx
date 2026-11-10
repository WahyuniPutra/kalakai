"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

export type PartnerBrand = { id: number; business_name: string; logo_url: string | null; category: string; city: string | null };

function PartnerMark({ partner }: { partner: PartnerBrand }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <span className={`partner-rail-mark${partner.logo_url && !imageFailed ? " has-logo" : ""}`}>
    {partner.logo_url && !imageFailed
      ? <img src={partner.logo_url} alt={`Logo ${partner.business_name}`} loading="lazy" onError={() => setImageFailed(true)} />
      : <><Heart size={19} fill="currentColor" /><b>{partner.business_name.slice(0, 1).toUpperCase()}</b></>}
  </span>;
}

function PartnerCards({ partners, duplicate = false }: { partners: PartnerBrand[]; duplicate?: boolean }) {
  return <div className="partner-rail-group" aria-hidden={duplicate || undefined}>
    {partners.map((partner, index) => <article className="partner-rail-card" key={`${partner.id}-${index}`}>
      <PartnerMark partner={partner} />
      <span className="partner-rail-name">{partner.business_name}</span>
      <span className="partner-rail-category">{partner.category}{partner.city ? ` · ${partner.city}` : ""}</span>
    </article>)}
  </div>;
}

export default function PartnerLogoRail({ partners }: { partners: PartnerBrand[] }) {
  const hasPartners = partners.length > 0;
  return <section className="kerabat-partner-section" aria-labelledby="kerabat-partner-title">
    <div className="kerabat-partner-heading">
      <div><p className="public-eyebrow"><span />KERABAT KALAKAI</p><h2 id="kerabat-partner-title">Momen istimewa,<br /><em>dirayakan bersama.</em></h2></div>
      <div className="kerabat-partner-aside"><p>Kenali mitra lokal yang menjadi bagian dari ekosistem Kalakai dan membantu mewujudkan setiap detail acara.</p><Link href="/mitra">Jelajahi semua mitra <ArrowRight size={16} /></Link></div>
    </div>
    {partners.length >= 7 ? <div className="partner-rail-viewport" aria-label="Logo mitra Kerabat Kalakai bergerak otomatis">
      <div className="partner-rail-track"><PartnerCards partners={partners} /><PartnerCards partners={partners} duplicate /></div>
    </div> : hasPartners ? <div className="partner-rail-static"><PartnerCards partners={partners} /></div> : <div className="partner-rail-empty"><span className="partner-rail-mark"><Heart size={19} fill="currentColor" /></span><p>Mitra Kerabat Kalakai segera hadir.</p><Link href="/register">Daftarkan usaha Anda <ArrowRight size={15} /></Link></div>}
  </section>;
}

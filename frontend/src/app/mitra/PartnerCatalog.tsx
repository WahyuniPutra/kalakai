"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, Search, Store, Tags } from "lucide-react";

type CatalogItem = { name: string; description?: string | null; photo_url?: string | null; price_from: number; unit: string };
export type CatalogPartner = {
  id: number;
  business_name: string;
  logo_url?: string | null;
  category: string;
  city: string | null;
  description: string | null;
  catalog: CatalogItem[] | null;
};

export default function PartnerCatalog({ partners }: { partners: CatalogPartner[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua layanan");
  const categories = useMemo(() => ["Semua layanan", ...new Set(partners.map((partner) => partner.category))], [partners]);
  const filteredPartners = partners.filter((partner) => {
    const searchText = `${partner.business_name} ${partner.category} ${partner.city ?? ""} ${partner.description ?? ""} ${(partner.catalog ?? []).map((item) => item.name).join(" ")}`.toLocaleLowerCase("id-ID");
    return searchText.includes(query.toLocaleLowerCase("id-ID")) && (category === "Semua layanan" || partner.category === category);
  });

  return (
    <section className="partner-catalog-content" aria-label="Daftar mitra Kalakai">
      <div className="partner-catalog-toolbar">
        <label className="partner-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama mitra, layanan, atau kota" /></label>
        <label className="partner-category"><Tags size={17} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter kategori">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="partner-catalog-results"><strong>{filteredPartners.length}</strong> mitra tersedia</div>
      {filteredPartners.length ? <div className="partner-catalog-grid">{filteredPartners.map((partner) => {
        return <Link className="partner-directory-card" href={`/mitra/${partner.id}`} key={partner.id}>
          <div className="partner-directory-card-top"><span className="partner-directory-icon"><Store size={21} /></span><span className="partner-directory-category">{partner.category}</span></div>
          <h2>{partner.business_name}</h2>
          <p className="partner-directory-location"><MapPin size={15} />{partner.city || "Melayani berbagai kota"}</p>
          <p className="partner-directory-description">{partner.description || "Mitra Kerabat Kalakai yang siap membantu kebutuhan acara Anda."}</p>
          <div className="partner-directory-bottom"><span className="partner-directory-detail-link">Lihat detail layanan <ArrowUpRight size={16} /></span></div>
        </Link>;
      })}</div> : <div className="partner-catalog-empty"><Store size={28} /><h2>{partners.length ? "Mitra belum ditemukan" : "Katalog mitra sedang disiapkan"}</h2><p>{partners.length ? "Coba kata kunci atau kategori layanan yang berbeda." : "Mitra Kerabat Kalakai yang telah aktif akan tampil di halaman ini."}</p></div>}
    </section>
  );
}

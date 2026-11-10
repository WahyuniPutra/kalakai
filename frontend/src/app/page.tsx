import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Heart,
  MapPin,
  Music2,
  QrCode,
  Quote,
  Sparkles,
  Store,
  WandSparkles,
  UsersRound,
} from "lucide-react";
import PartnerLogoRail, { type PartnerBrand } from "./PartnerLogoRail";

const backendApiUrl = (process.env.KALAKAI_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

async function getActivePartners(): Promise<PartnerBrand[]> {
  try {
    const response = await fetch(`${backendApiUrl}/api/partners`, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

const features = [
  {
    icon: Heart,
    number: "01",
    title: "Undangan yang terasa personal",
    text: "Sampaikan cerita, detail acara, lokasi, dan suasana yang mencerminkan momen Anda.",
  },
  {
    icon: UsersRound,
    number: "02",
    title: "Tamu lebih mudah dikelola",
    text: "Siapkan tautan personal, kumpulkan konfirmasi, dan rapikan daftar tamu dalam satu alur.",
  },
  {
    icon: QrCode,
    number: "03",
    title: "Penyambutan siap untuk hari-H",
    text: "Gunakan check-in QR melalui ponsel untuk membantu proses kedatangan tamu.",
  },
];

const plans = [
  {
    name: "Kerabat Free",
    price: "Rp 0",
    description: "Mulai merancang undangan dan kenali alur Kalakai.",
    features: ["3 template undangan dasar", "Transisi halaman fade", "Hingga 50 nama tamu", "Masa aktif 7 hari", "Formulir doa & ucapan"],
    href: "/romeo-juliet/budi-santoso",
    action: "Mulai gratis",
    tone: "free",
  },
  {
    name: "Paket Bahagia",
    price: "Rp 99.000",
    description: "Undangan digital personal untuk cerita yang lebih lengkap.",
    features: ["Semua koleksi template & palet", "Animasi halaman dan tiap elemen", "Transisi fade, geser, flip & zoom", "Tamu tanpa batas", "Tautan personal via WhatsApp", "Integrasi audio & Spotify", "Amplop digital", "Masa aktif 6 bulan"],
    href: "/romeo-juliet/budi-santoso",
    action: "Pilih Paket Bahagia",
    tone: "featured",
  },
  {
    name: "Paket Resepsi Sultan",
    price: "Rp 189.000",
    description: "Undangan digital dan buku tamu QR untuk meja resepsi.",
    features: ["Semua fitur Paket Bahagia", "Animasi halaman dan tiap elemen", "Mode resepsionis & buku tamu", "QR scanner di hari-H", "Rekap kehadiran & ekspor", "Masa aktif 1 tahun", "Dukungan acara"],
    href: "/romeo-juliet/resepsionis",
    action: "Lihat fitur resepsi",
    tone: "premium",
  },
];

const audiences = [
  {
    icon: Heart,
    tag: "UNTUK PASANGAN & KELUARGA",
    title: "Satu acara, semua tertata.",
    description: "Rancang undangan, kelola konfirmasi tamu, lalu siapkan check-in untuk hari perayaan.",
    points: ["Bayar sesuai acara", "Mulai dari template", "Tautan personal & RSVP"],
    action: "Lihat paket acara",
    href: "#harga",
    tone: "couple",
  },
  {
    icon: BriefcaseBusiness,
    tag: "UNTUK KREATOR & WEDDING ORGANIZER",
    title: "Banyak acara, satu workspace.",
    description: "Kelola proyek klien berulang dengan ruang kerja yang dirancang untuk kebutuhan kreator.",
    points: ["Workspace multi-acara", "Sistem desain reusable", "Kontrol kreatif lebih luas"],
    action: "Daftar sebagai kreator",
    href: "/register",
    tone: "studio",
  },
];

export default async function PublicHomePage() {
  const partners = await getActivePartners();
  return (
    <main className="public-site">
      <header className="public-header">
        <div className="public-header-inner">
          <Link href="/" className="public-brand" aria-label="Kalakai beranda">
            <span className="public-brand-mark"><Heart size={18} fill="currentColor" /></span>
            <span>kalakai<span>.</span></span>
          </Link>
          <nav className="public-nav" aria-label="Navigasi halaman">
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#harga">Harga</a>
            <Link href="/mitra">Katalog mitra</Link>
            <a href="#tentang">Tentang Kalakai</a>
          </nav>
          <div className="public-header-actions">
            <Link className="public-login" href="/login">Masuk</Link>
            <Link className="public-header-cta" href="/register">Daftar gratis <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </header>

      <section className="public-hero" id="top">
        <div className="public-hero-inner">
          <div className="public-hero-copy">
            <p className="public-eyebrow"><span />UNDANGAN &amp; MANAJEMEN ACARA DIGITAL</p>
            <h1>Momen istimewa,<br />terasa dekat <em>dari awal.</em></h1>
            <p className="public-hero-lead">Undang dengan cerita yang personal. Kelola tamu dengan lebih tenang. Sambut hari bahagia dengan cara yang terasa seperti Anda.</p>
            <div className="public-hero-actions">
              <Link className="public-button-primary" href="/romeo-juliet/budi-santoso">Jelajahi demo undangan <ArrowRight size={16} /></Link>
              <a className="public-button-text" href="#fitur">Kenali Kalakai <ArrowRight size={15} /></a>
            </div>
            <div className="public-hero-proof"><span><Check size={14} />Undangan personal</span><i /><span><Check size={14} />RSVP &amp; daftar tamu</span><i /><span><Check size={14} />Check-in QR</span></div>
          </div>

          <div className="public-hero-art" aria-label="Pratinjau undangan Romeo dan Juliet">
            <div className="hero-art-orbit hero-art-orbit-one" /><div className="hero-art-orbit hero-art-orbit-two" />
            <div className="hero-art-stamp"><Sparkles size={13} />SEBUAH HARI UNTUK DIKENANG</div>
            <article className="invite-preview">
              <div className="invite-preview-top"><span>UNDANGAN PERNIKAHAN</span><span className="invite-preview-mark"><Heart size={13} /></span></div>
              <div className="invite-flower" aria-hidden="true"><i /><i /><i /><i /><span>R</span></div>
              <p className="invite-script">The Wedding of</p>
              <h2>Romeo <i>&amp;</i><br />Juliet</h2>
              <div className="invite-divider"><span /><Heart size={10} fill="currentColor" /><span /></div>
              <p className="invite-date">DENGAN PENUH SUKACITA</p>
              <p className="invite-place"><MapPin size={12} />Palangka Raya</p>
              <div className="invite-preview-bottom"><span><Music2 size={12} />Sebuah cerita, sebuah lagu</span><span>01 / 03</span></div>
            </article>
            <div className="floating-guest-card"><span className="guest-avatar">B</span><span><small>UNDANGAN PERSONAL</small><strong>Kepada Budi Santoso</strong></span><Check size={15} /></div>
            <div className="floating-qr-card"><QrCode size={20} /><span><strong>QR pass</strong><small>Siap untuk hari-H</small></span></div>
          </div>
        </div>
        <div className="hero-bottom-note"><span>DARI PESAN PERTAMA</span><span className="hero-note-line" /><span>HINGGA HARI PERAYAAN</span></div>
      </section>

      <section className="public-intro" id="tentang">
        <div className="public-intro-label"><span>01</span><span className="public-label-line" />CARA BARU MERAYAKAN</div>
        <div className="public-intro-copy">
          <h2>Lebih dari sebuah tautan.<br /><em>Ini bagian dari cerita Anda.</em></h2>
          <p>Kalakai adalah platform digital untuk membantu keluarga dan penyelenggara acara menghubungkan undangan, tamu, dan momen perayaan—dengan pengalaman yang rapi, mudah, dan personal.</p>
        </div>
      </section>

      <section className="public-features" id="fitur">
        <div className="public-section-head">
          <div><p className="public-eyebrow"><span />SATU RUANG UNTUK SETIAP DETAIL</p><h2>Dirancang untuk menemani<br />setiap langkah perayaan.</h2></div>
          <p>Dari undangan dibagikan sampai tamu tiba di lokasi, semua bagian saling terhubung dalam satu pengalaman.</p>
        </div>
        <div className="public-feature-grid">
          {features.map(({ icon: Icon, number, title, text }) => (
            <article className="public-feature-card" key={number}>
              <div className="public-feature-top"><span className="public-feature-icon"><Icon size={19} /></span><span>{number}</span></div>
              <h3>{title}</h3><p>{text}</p>
              <div className="feature-card-line" />
            </article>
          ))}
        </div>
      </section>

      <section className="public-flow" id="cara-kerja">
        <div className="flow-heading"><p className="public-eyebrow"><span />MUDAH DIMULAI</p><h2>Persiapan terasa<br /><em>lebih ringan.</em></h2><p>Bangun pengalaman acara Anda setahap demi setahap, tanpa kehilangan sentuhan personal.</p></div>
        <div className="flow-steps">
          <article><span>01</span><div><CalendarDays size={18} /><h3>Rancang acara</h3><p>Mulai dari template, lalu sesuaikan detail dan nuansa undangan.</p></div></article>
          <article><span>02</span><div><UsersRound size={18} /><h3>Bagikan &amp; kelola tamu</h3><p>Kirim tautan personal dan ikuti konfirmasi kehadiran.</p></div></article>
          <article><span>03</span><div><QrCode size={18} /><h3>Sambut hari bahagia</h3><p>Gunakan check-in QR untuk membantu penerimaan tamu.</p></div></article>
        </div>
      </section>

      <section className="public-audience" id="untuk-siapa">
        <div className="audience-heading">
          <p className="public-eyebrow"><span />PILIH JALUR YANG SESUAI</p>
          <h2>Untuk satu hari istimewa.<br /><em>Atau banyak cerita klien.</em></h2>
          <p>Kalakai dirancang untuk pasangan yang menyiapkan acaranya sendiri dan kreator yang membantu banyak pasangan.</p>
        </div>
        <div className="audience-grid">
          {audiences.map(({ icon: Icon, tag, title, description, points, action, href, tone }) => (
            <article className={`audience-card audience-${tone}`} key={tone}>
              <div className="audience-card-top"><span className="audience-icon"><Icon size={19} /></span><span className="audience-tag">{tag}</span></div>
              <h3>{title}</h3>
              <p className="audience-description">{description}</p>
              <ul>{points.map((point) => <li key={point}><Check size={14} />{point}</li>)}</ul>
              {tone === "studio" && <span className="roadmap-label"><WandSparkles size={12} />ARAH PENGEMBANGAN KALAKAI</span>}
              <Link href={href} className="audience-action">{action}<ArrowRight size={15} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="public-pricing" id="harga">
        <div className="pricing-heading">
          <p className="public-eyebrow"><span />PAKET PER ACARA</p>
          <h2>Pilihan paket yang pas<br />untuk <em>hari spesialmu.</em></h2>
          <p>Mulai dengan akses gratis, lalu pilih paket saat undangan dan kebutuhan acaramu siap.</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={`pricing-card pricing-${plan.tone}`} key={plan.name}>
              {plan.tone === "featured" && <span className="pricing-popular"><Sparkles size={12} />PALING DIMINATI</span>}
              <div className="pricing-card-head"><span>{plan.name}</span>{plan.tone === "premium" && <Heart size={15} />}</div>
              <h3>{plan.price}</h3>
              <p className="pricing-description">{plan.description}</p>
              <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
              <Link href={plan.href} className="pricing-button">{plan.action}<ArrowUpRight size={14} /></Link>
            </article>
          ))}
        </div>
        <p className="pricing-footnote">Harga dan fitur paket dapat disesuaikan dengan penawaran resmi Kalakai.</p>
      </section>

      <PartnerLogoRail partners={partners} />

      <section className="public-testimonials" id="testimoni">
        <div className="public-testimonials-heading">
          <p className="public-eyebrow"><span />CERITA KERABAT KALAKAI</p>
          <h2>Pengalaman nyata,<br /><em>dari pengguna dan mitra.</em></h2>
          <p>Kami sedang mengumpulkan cerita langsung dari orang-orang yang menggunakan Kalakai untuk menyiapkan momen mereka.</p>
        </div>
        <div className="public-testimonial-grid">
          <article className="public-testimonial-card">
            <Quote size={25} />
            <span className="public-testimonial-role">PENGGUNA KALAKAI</span>
            <h3>Cerita pengguna akan hadir di sini.</h3>
            <p>Pengalaman nyata tentang merancang undangan, mengelola tamu, dan menyiapkan hari istimewa akan ditampilkan setelah dibagikan oleh pengguna.</p>
            <Link href="/register">Mulai sebagai pengguna <ArrowRight size={15} /></Link>
          </article>
          <article className="public-testimonial-card public-testimonial-partner">
            <Store size={25} />
            <span className="public-testimonial-role">MITRA KERABAT KALAKAI</span>
            <h3>Suara mitra segera menyusul.</h3>
            <p>Kami akan menampilkan pengalaman mitra yang membantu pengguna memenuhi kebutuhan acara melalui Kalakai.</p>
            <Link href="/register">Bergabung sebagai mitra <ArrowRight size={15} /></Link>
          </article>
        </div>
      </section>

      <footer className="public-footer">
        <Link href="/" className="public-brand"><span className="public-brand-mark"><Heart size={17} fill="currentColor" /></span><span>kalakai<span>.</span></span></Link>
        <p>Teknologi untuk momen yang berarti.</p>
        <div><Link href="/mitra">Katalog mitra</Link><Link href="/login">Masuk</Link><Link href="/register">Daftar</Link><Link href="/romeo-juliet/resepsionis">Demo resepsionis</Link></div>
        <span className="public-copyright">© 2026 Kalakai Id · Kerabat Kalakai</span>
      </footer>
    </main>
  );
}

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  ExternalLink,
  Heart,
  LayoutDashboard,
  MapPin,
  Printer,
  ShieldCheck,
  Store,
  UsersRound,
} from "lucide-react";
import DashboardShell, { type DashboardNavItem, type DashboardUser } from "./DashboardShell";
import PartnerReviewQueue from "./PartnerReviewQueue";

type Stat = { users?: number; partners?: number; events?: number; requests?: number; pending_partners?: number; catalog_items?: number; new_requests?: number; in_progress?: number; completed?: number; guests?: number; published?: number; service_requests?: number };
type EventItem = { id: number; title: string; slug: string; event_date: string | null; location_name: string | null; guests_count: number; is_published: boolean };
type ServiceRequest = {
  id: number;
  title: string;
  type: string;
  status: string;
  quantity: number | null;
  quoted_price: number | null;
  created_at: string;
  details?: Record<string, string> | null;
  user?: { id: number; name: string };
  event?: { id: number; title: string } | null;
  partner_profile?: { id: number; business_name: string };
};
type PartnerProfile = { business_name: string; category: string; city: string | null; description: string | null; status: string; catalog: { name: string; price_from: number; unit: string }[] | null };
type PendingPartnerProfile = { id: number; business_name: string; logo_url: string | null; category: string; city: string | null; description: string | null; user?: { name: string; email: string } };
type Summary = {
  role: DashboardUser["role"];
  user: DashboardUser;
  stats: Stat;
  events?: EventItem[];
  service_requests?: ServiceRequest[];
  recent_requests?: ServiceRequest[];
  recent_users?: DashboardUser[];
  profile?: PartnerProfile | null;
  pending_partner_profiles?: PendingPartnerProfile[];
  requests?: ServiceRequest[];
};

const adminNavigation: DashboardNavItem[] = [
    { label: "Ringkasan", href: "#ringkasan", icon: LayoutDashboard, active: true },
    { label: "Verifikasi mitra", href: "#verifikasi", icon: ShieldCheck },
    { label: "Permintaan layanan", href: "#permintaan", icon: ClipboardList },
    { label: "Akun & mitra", href: "#akun", icon: UsersRound },
    { label: "Aktivitas platform", href: "#aktivitas", icon: Activity },
];

function formatCurrency(value: number | null | undefined) {
  if (value == null) return "Menunggu penawaran";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Tanggal belum diatur";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { submitted: "Permintaan baru", quoted: "Penawaran dikirim", accepted: "Disetujui", in_progress: "Diproses", completed: "Selesai", cancelled: "Dibatalkan", pending: "Menunggu", active: "Aktif" };
  const tone = ["completed", "active", "accepted"].includes(status) ? "success" : ["cancelled"].includes(status) ? "muted" : "waiting";
  return <span className={`dashboard-status dashboard-status-${tone}`}>{labels[status] ?? status}</span>;
}

function StatCards({ items }: { items: { label: string; value: number | string; icon: typeof CalendarDays; note: string }[] }) {
  return <div className="dashboard-stat-grid">{items.map(({ label, value, icon: Icon, note }) => <article className="dashboard-stat" key={label}><span className="dashboard-stat-icon"><Icon size={17} /></span><p>{label}</p><strong>{value}</strong><small>{note}</small></article>)}</div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="dashboard-page-heading"><div><p className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function RequestList({ requests, emptyText }: { requests: ServiceRequest[]; emptyText: string }) {
  if (!requests.length) return <div className="dashboard-empty"><ClipboardList size={22} /><p>{emptyText}</p></div>;
  return <div className="dashboard-request-list">{requests.map((request) => <article className="dashboard-request-row" key={request.id}>
    <span className="request-type-icon">{request.type === "printing" ? <Printer size={17} /> : <Heart size={17} />}</span>
    <div className="dashboard-request-main"><strong>{request.title}</strong><span>{request.user?.name ?? "Anda"}{request.event ? ` · ${request.event.title}` : ""}{request.quantity ? ` · ${request.quantity} unit` : ""}</span></div>
    <div className="dashboard-request-meta"><StatusBadge status={request.status} /><small>{formatDate(request.created_at)}</small></div>
  </article>)}</div>;
}

export function UserDashboard({ summary }: { summary: Summary }) {
  const events = summary.events ?? [];
  const requests = summary.service_requests ?? [];
  const firstName = summary.user.name.split(" ")[0];
  return <DashboardShell user={summary.user}>
    <div id="ringkasan">
      <PageHeading eyebrow="RUANG ACARA PRIBADI" title={`Selamat datang, ${firstName}.`} description="Rancang undangan, atur tampilan, dan bagikan tautan acara dari satu ruang." action={<Link className="primary-button" href="/dashboard/undangan/new"><Heart size={15} />Buat undangan<ArrowUpRight size={14} /></Link>} />
      <StatCards items={[
        { label: "Acara", value: summary.stats.events ?? 0, icon: CalendarDays, note: "Terdaftar di akun Anda" },
        { label: "Tamu", value: summary.stats.guests ?? 0, icon: UsersRound, note: "Dari seluruh acara" },
        { label: "Undangan aktif", value: summary.stats.published ?? 0, icon: Heart, note: "Dapat dibuka tamu" },
        { label: "Permintaan mitra", value: summary.stats.service_requests ?? 0, icon: Store, note: "Layanan acara" },
      ]} />
      <div className="dashboard-content-grid">
        <section className="dashboard-panel" id="acara"><div className="dashboard-panel-heading"><h2>Acara terbaru</h2><Link className="workspace-text-link" href="/dashboard/acara">Semua acara <ArrowUpRight size={14} /></Link></div>
          {events.length ? <div className="dashboard-event-list">{events.slice(0, 3).map((event) => <article className="dashboard-event-card" key={event.id}><div className="dashboard-event-date"><CalendarDays size={17} /><span>{formatDate(event.event_date)}</span></div><h3>{event.title}</h3><p><MapPin size={13} />{event.location_name ?? "Lokasi belum diatur"}</p><div className="dashboard-event-footer"><span><UsersRound size={13} />{event.guests_count} tamu · {event.is_published ? "Terbit" : "Draf"}</span><Link href={`/dashboard/undangan/${event.id}`}>{event.is_published ? "Edit undangan" : "Lanjutkan edit"} <ExternalLink size={13} /></Link></div>{event.is_published && <Link className="dashboard-event-public-link" href={`/${event.slug}`}>Lihat tautan publik</Link>}</article>)}</div> : <div className="dashboard-empty"><CalendarDays size={22} /><p>Belum ada undangan.</p><Link className="dashboard-empty-action" href="/dashboard/undangan/new">Buat undangan pertama <ArrowUpRight size={15} /></Link></div>}
        </section>
        <section className="dashboard-panel" id="layanan"><div className="dashboard-panel-heading"><h2>Permintaan layanan</h2><Link className="workspace-text-link" href="/dashboard/layanan">Buka layanan <ArrowUpRight size={14} /></Link></div><RequestList requests={requests} emptyText="Belum ada permintaan ke mitra." /></section>
      </div>
    </div>
  </DashboardShell>;
}

export function PartnerDashboard({ summary }: { summary: Summary }) {
  const profile = summary.profile;
  const requests = summary.requests ?? [];
  return <DashboardShell user={summary.user}>
    <div id="ringkasan">
      <PageHeading eyebrow="RUANG MITRA KERABAT KALAKAI" title={`Halo, ${profile?.business_name ?? summary.user.name}.`} description="Pantau peluang pekerjaan, katalog, dan permintaan pelanggan Anda." action={<span className="partner-status-label"><ShieldCheck size={14} />Profil <StatusBadge status={profile?.status ?? "pending"} /></span>} />
      <StatCards items={[
        { label: "Item katalog", value: summary.stats.catalog_items ?? 0, icon: Store, note: "Layanan ditampilkan" },
        { label: "Permintaan baru", value: summary.stats.new_requests ?? 0, icon: ClipboardList, note: "Perlu ditinjau" },
        { label: "Sedang diproses", value: summary.stats.in_progress ?? 0, icon: Clock3, note: "Pesanan berjalan" },
        { label: "Selesai", value: summary.stats.completed ?? 0, icon: Check, note: "Riwayat pekerjaan" },
      ]} />
      <div className="dashboard-content-grid">
        <section className="dashboard-panel dashboard-panel-wide" id="permintaan"><div className="dashboard-panel-heading"><h2>Permintaan masuk</h2><Link className="workspace-text-link" href="/dashboard/layanan">Buka permintaan <ArrowUpRight size={14} /></Link></div>
          <RequestList requests={requests} emptyText="Belum ada permintaan pekerjaan baru." />
        </section>
        <section className="dashboard-panel" id="katalog"><div className="dashboard-panel-heading"><h2>Katalog layanan</h2><Link className="workspace-text-link" href="/dashboard/katalog">Kelola katalog <ArrowUpRight size={14} /></Link></div>
          {profile ? <><p className="partner-profile-description">{profile.description}</p><div className="partner-location"><MapPin size={14} />{profile.city ?? "Lokasi belum diatur"}</div><div className="partner-catalog">{(profile.catalog ?? []).map((item) => <div key={item.name}><span><strong>{item.name}</strong><small>Mulai dari {formatCurrency(item.price_from)} / {item.unit}</small></span><Check size={14} /></div>)}</div></> : <div className="dashboard-empty"><Store size={22} /><p>Profil mitra belum dibuat.</p></div>}
        </section>
      </div>
    </div>
  </DashboardShell>;
}

export function AdminDashboard({ summary }: { summary: Summary }) {
  return <DashboardShell user={summary.user} nav={adminNavigation}>
    <div id="ringkasan">
      <PageHeading eyebrow="PENGELOLAAN PLATFORM" title="Ringkasan Kalakai" description="Pantau akun, mitra, acara, dan permintaan layanan di ekosistem Kalakai." action={<span className="admin-secure-label"><ShieldCheck size={15} />Akses Super Admin</span>} />
      <StatCards items={[
        { label: "Pengguna", value: summary.stats.users ?? 0, icon: UsersRound, note: "Akun pemilik acara" },
        { label: "Mitra aktif", value: summary.stats.partners ?? 0, icon: Store, note: `${summary.stats.pending_partners ?? 0} menunggu aktivasi` },
        { label: "Acara", value: summary.stats.events ?? 0, icon: CalendarDays, note: "Tersimpan di platform" },
        { label: "Permintaan layanan", value: summary.stats.requests ?? 0, icon: ClipboardList, note: "Seluruh status" },
      ]} />
      <section className="dashboard-panel partner-review-panel" id="verifikasi"><div className="dashboard-panel-heading"><div><p className="eyebrow">PENDAFTARAN BARU</p><h2>Verifikasi mitra</h2></div><ShieldCheck size={19} /></div><PartnerReviewQueue partners={summary.pending_partner_profiles ?? []} /></section>
      <div className="dashboard-content-grid">
        <section className="dashboard-panel dashboard-panel-wide" id="permintaan"><div className="dashboard-panel-heading"><div><p className="eyebrow">OPERASIONAL</p><h2>Permintaan terbaru</h2></div><ClipboardList size={17} /></div><RequestList requests={summary.recent_requests ?? []} emptyText="Belum ada permintaan layanan." /></section>
        <section className="dashboard-panel" id="akun"><div className="dashboard-panel-heading"><div><p className="eyebrow">EKOSISTEM</p><h2>Akun terbaru</h2></div><UsersRound size={17} /></div>
          {(summary.recent_users ?? []).length ? <div className="admin-user-list">{summary.recent_users?.map((account) => <article key={account.email}><span className="avatar">{account.name.charAt(0).toUpperCase()}</span><span><strong>{account.name}</strong><small>{account.email}</small></span><span className="account-role">{account.role === "partner" ? "Mitra" : "Pengguna"}</span></article>)}</div> : <div className="dashboard-empty"><UsersRound size={22} /><p>Belum ada akun terdaftar.</p></div>}
        </section>
      </div>
      <section className="admin-activity-panel" id="aktivitas"><div><Activity size={17} /><span><strong>Operasional platform</strong><small>Dashboard ini menampilkan ringkasan data live dari database Kalakai.</small></span></div><span className="admin-live-dot">DATA LANGSUNG</span></section>
    </div>
  </DashboardShell>;
}

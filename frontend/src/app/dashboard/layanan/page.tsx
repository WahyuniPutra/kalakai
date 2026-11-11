import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDown, ClipboardList } from "lucide-react";
import { workspaceData } from "@/lib/workspace-data";
import DashboardShell, { type DashboardUser } from "../DashboardShell";
import WorkspaceHeading from "../WorkspaceHeading";
import type { WorkspaceEvent } from "../acara/EventDirectory";
import RequestForm from "./RequestForm";
import RequestActions from "./RequestActions";
import { requestStatuses, rupiah, type PartnerChoice, type RequestStatus, type ServiceItem } from "./service-types";

export const metadata = { title: "Permintaan layanan — Kalakai" };
type RequestPageData = { data: ServiceItem[]; current_page: number; last_page: number; total: number };
const calendar = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

function positiveInteger(value: unknown) {
  return typeof value === "string" && /^[1-9]\d{0,7}$/.test(value) ? Number(value) : undefined;
}

export default async function ServicesPage({ searchParams }: PageProps<"/dashboard/layanan">) {
  const [user, search] = await Promise.all([workspaceData<DashboardUser>("/api/user"), searchParams]);
  if (user.role === "super_admin") redirect("/dashboard");
  const isPartner = user.role === "partner";
  const status = typeof search.status === "string" && Object.hasOwn(requestStatuses, search.status) ? search.status as RequestStatus : "";
  const q = typeof search.q === "string" ? search.q.trim().slice(0, 100) : "";
  const page = positiveInteger(search.page) ?? 1;
  const query = new URLSearchParams({ page: String(page) });
  if (status) query.set("status", status);
  if (q) query.set("q", q);
  const [requests, events, partners] = await Promise.all([
    workspaceData<RequestPageData>(`/api/service-requests?${query}`),
    isPartner ? [] : workspaceData<WorkspaceEvent[]>("/api/user/events"),
    isPartner ? [] : workspaceData<PartnerChoice[]>("/api/partners"),
  ]);
  function pageLink(next: number) {
    const params = new URLSearchParams(query);
    params.set("page", String(next));
    return `/dashboard/layanan?${params}`;
  }

  return <DashboardShell user={user} section="requests">
    <WorkspaceHeading title={isPartner ? "Permintaan masuk" : "Permintaan layanan"}
      description={isPartner ? "Kirim penawaran, mulai pekerjaan yang disetujui, dan tandai pesanan selesai." : "Ceritakan kebutuhan acara Anda dan tanggapi penawaran dari mitra."}
      action={!isPartner && <a href="#ajukan" className="work-primary"><ArrowDown size={16} /> Ajukan layanan</a>} />
    <div className={isPartner ? undefined : "work-request-grid"}>
      <section className="work-panel" aria-labelledby="work-request-list">
        <div className="work-panel-heading"><h2 id="work-request-list">{isPartner ? "Daftar permintaan" : "Riwayat permintaan"}</h2><span>{requests.total} hasil</span></div>
        <form className="work-toolbar work-request-filters" action="/dashboard/layanan">
          <label>Cari permintaan<input name="q" type="search" defaultValue={q} maxLength={100} placeholder="Judul permintaan" /></label>
          <label>Status<select name="status" defaultValue={status}><option value="">Semua status</option>{Object.entries(requestStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <button type="submit" className="work-secondary">Terapkan</button>
        </form>
        {requests.data.length ? <div className="work-list">
          {requests.data.map((item) => <article key={item.id} className="work-request">
            <div className="work-event-title"><h3>{item.title}</h3><span className={`work-status ${["accepted", "completed"].includes(item.status) ? "work-status-good" : ""}`}>{requestStatuses[item.status] ?? item.status}</span></div>
            <p className="work-request-meta">{[isPartner ? item.user?.name : item.partner_profile?.business_name, item.event?.title, item.quantity ? `${item.quantity} unit` : null, calendar.format(new Date(item.created_at))].filter(Boolean).join(" · ")}</p>
            {item.description && <p className="work-request-description">{item.description}</p>}
            {item.quoted_price !== null && <div className="work-quote"><span>Penawaran total</span><strong>{rupiah(item.quoted_price)}</strong>{item.details?.quote_note && <p>{item.details.quote_note}</p>}</div>}
            <RequestActions item={item} role={isPartner ? "partner" : "user"} />
          </article>)}
        </div> : <div className="work-empty"><ClipboardList size={25} /><h3>{status || q ? "Tidak ada permintaan yang cocok" : "Belum ada permintaan"}</h3><p>{status || q ? "Coba ganti pencarian atau status." : isPartner ? "Permintaan pelanggan akan muncul di sini." : "Ajukan kebutuhan acara ke mitra yang sesuai."}</p></div>}
        {(requests.last_page > 1 || page > 1) && <nav className="work-pagination" aria-label="Halaman permintaan">
          {page > 1 && <Link className="work-secondary" href={pageLink(Math.min(page - 1, requests.last_page))}>Sebelumnya</Link>}
          <span>Halaman {requests.current_page} dari {requests.last_page}</span>
          {page < requests.last_page && <Link className="work-secondary" href={pageLink(page + 1)}>Berikutnya</Link>}
        </nav>}
      </section>
      {!isPartner && <section className="work-panel work-request-form" id="ajukan" aria-labelledby="work-request-new">
        <div className="work-panel-heading"><h2 id="work-request-new">Ajukan layanan baru</h2></div>
        {partners.length ? <RequestForm key={`${search.mitra}-${search.acara}`} partners={partners} events={events} partnerId={positiveInteger(search.mitra)} eventId={positiveInteger(search.acara)} /> : <div className="work-empty"><p>Belum ada mitra aktif yang bisa menerima permintaan.</p><Link className="workspace-text-link" href="/mitra">Lihat katalog mitra ↗</Link></div>}
      </section>}
    </div>
  </DashboardShell>;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { workspaceData } from "@/lib/workspace-data";
import DashboardShell, { type DashboardUser } from "../DashboardShell";
import WorkspaceHeading from "../WorkspaceHeading";
import CatalogEditor, { type CatalogItem } from "./CatalogEditor";

export const metadata = { title: "Katalog layanan — Kalakai" };

type PartnerAccount = DashboardUser & { partner_profile: { id: number; status: string; catalog: CatalogItem[] | null } | null };

export default async function CatalogPage() {
  const user = await workspaceData<PartnerAccount>("/api/profile");
  if (user.role !== "partner") redirect("/dashboard");
  const profile = user.partner_profile;
  return <DashboardShell user={user} section="catalog">
    <WorkspaceHeading title="Katalog layanan" description="Atur layanan, harga mulai, dan satuan yang ditampilkan kepada pelanggan."
      action={profile?.status === "active" && <Link className="work-secondary" href={`/mitra/${profile.id}`}>Lihat katalog publik <ArrowUpRight size={16} /></Link>} />
    {profile?.status === "active" ? <CatalogEditor catalog={profile.catalog ?? []} /> : <div className="work-panel work-empty"><h2>Katalog tersedia setelah verifikasi</h2><Link href="/dashboard/profil" className="work-secondary">Cek profil usaha</Link></div>}
  </DashboardShell>;
}

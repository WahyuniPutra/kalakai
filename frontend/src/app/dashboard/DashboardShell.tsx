import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, ClipboardList, LayoutDashboard, Store, UserRound, type LucideIcon } from "lucide-react";
import LogoutButton from "./LogoutButton";

export type DashboardUser = { name: string; email: string; role: "super_admin" | "partner" | "user" };
export type DashboardNavItem = { label: string; href: string; icon: LucideIcon; active?: boolean };
type WorkspaceSection = "overview" | "events" | "requests" | "catalog" | "profile";
type WorkspaceNavItem = DashboardNavItem & { section: WorkspaceSection };

const sharedNav: WorkspaceNavItem[] = [
  { section: "overview", label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
];
const profileNav: WorkspaceNavItem = { section: "profile", label: "Profil saya", href: "/dashboard/profil", icon: UserRound };
const memberNav: Record<"user" | "partner", WorkspaceNavItem[]> = {
  user: [
    ...sharedNav,
    { section: "events", label: "Acara saya", href: "/dashboard/acara", icon: CalendarDays },
    { section: "requests", label: "Permintaan layanan", href: "/dashboard/layanan", icon: ClipboardList },
    profileNav,
  ],
  partner: [
    ...sharedNav,
    { section: "requests", label: "Permintaan masuk", href: "/dashboard/layanan", icon: ClipboardList },
    { section: "catalog", label: "Katalog layanan", href: "/dashboard/katalog", icon: Store },
    profileNav,
  ],
};

const roleNames: Record<DashboardUser["role"], string> = {
  super_admin: "Super Admin",
  partner: "Mitra Kalakai",
  user: "Pemilik Acara",
};

export default function DashboardShell({
  user,
  nav = [],
  children,
  section = "overview",
}: {
  user: DashboardUser;
  nav?: DashboardNavItem[];
  children: React.ReactNode;
  section?: WorkspaceSection;
}) {
  const items = user.role === "super_admin" ? nav : memberNav[user.role].map((item) => ({ ...item, active: item.section === section }));
  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link href="/dashboard" className="brand-lockup" aria-label="Kalakai, ringkasan dashboard">
          <Image className="workspace-logo" src="/icon.svg" width={42} height={42} alt="" priority />
          <span className="brand-name">kalakai<span className="brand-period">.</span><small>RUANG KERJA</small></span>
        </Link>
        <div className="sidebar-label">{roleNames[user.role].toUpperCase()}</div>
        <nav className="sidebar-nav" aria-label="Navigasi dashboard">
          {items.map(({ label, href, icon: Icon, active }) => (
            <Link className={`nav-item${active ? " nav-item-active" : ""}`} href={href} key={label} aria-current={active ? "page" : undefined}>
              <Icon size={18} aria-hidden="true" /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/">Buka situs Kalakai <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="sidebar-footer">© 2026 Kalakai Id</div>
      </aside>

      <section className="workspace-main">
        <header className="workspace-topbar">
          <div className="breadcrumb"><strong>{roleNames[user.role]}</strong></div>
          <div className="topbar-actions">
            <span className="secure-label">{user.name}</span>
            {user.role === "super_admin" ? <div className="avatar" aria-label={`Akun ${user.name}`}>{user.name.trim().charAt(0).toUpperCase()}</div> : <Link href="/dashboard/profil" className="avatar" aria-label={`Buka profil ${user.name}`}>{user.name.trim().charAt(0).toUpperCase()}</Link>}
            <LogoutButton />
          </div>
        </header>
        <div className="workspace-content">{children}</div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { Heart, type LucideIcon } from "lucide-react";
import LogoutButton from "./LogoutButton";

export type DashboardUser = { name: string; email: string; role: "super_admin" | "partner" | "user" };
export type DashboardNavItem = { label: string; href: string; icon: LucideIcon; active?: boolean };

const roleNames: Record<DashboardUser["role"], string> = {
  super_admin: "Super Admin",
  partner: "Mitra Kalakai",
  user: "Pemilik Acara",
};

export default function DashboardShell({
  user,
  nav,
  children,
}: {
  user: DashboardUser;
  nav: DashboardNavItem[];
  children: React.ReactNode;
}) {
  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link href="/" className="brand-lockup" aria-label="Kalakai, beranda">
          <span className="brand-mark"><Heart size={19} fill="currentColor" strokeWidth={1.5} /></span>
          <span className="brand-name">kalakai<span className="brand-period">.</span><small>KERABAT KALAKAI</small></span>
        </Link>
        <div className="sidebar-label">{roleNames[user.role].toUpperCase()}</div>
        <nav className="sidebar-nav" aria-label="Navigasi dashboard">
          {nav.map(({ label, href, icon: Icon, active }) => (
            <a className={`nav-item${active ? " nav-item-active" : ""}`} href={href} key={label}>
              <Icon size={17} />{label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note-icon"><Heart size={16} /></div>
          <p>Kalakai menghubungkan cerita, tamu, dan mitra.</p>
          <span>Produk digital Kerabat Kalakai</span>
          <Link href="/">Kembali ke situs <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="sidebar-footer">© 2026 Kalakai Id</div>
      </aside>

      <section className="workspace-main">
        <header className="workspace-topbar">
          <div className="breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><strong>{roleNames[user.role]}</strong></div>
          <div className="topbar-actions">
            <span className="secure-label">{user.name}</span>
            <div className="avatar" aria-label={`Akun ${user.name}`}>{user.name.trim().charAt(0).toUpperCase()}</div>
            <LogoutButton />
          </div>
        </header>
        <div className="workspace-content">{children}</div>
      </section>
    </main>
  );
}

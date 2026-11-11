import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { workspaceData } from "@/lib/workspace-data";
import DashboardShell, { type DashboardUser } from "../DashboardShell";
import WorkspaceHeading from "../WorkspaceHeading";
import EventDirectory, { type WorkspaceEvent } from "./EventDirectory";

export const metadata = { title: "Acara saya — Kalakai" };

export default async function EventsPage() {
  const user = await workspaceData<DashboardUser>("/api/user");
  if (user.role !== "user") redirect("/dashboard");
  const events = await workspaceData<WorkspaceEvent[]>("/api/user/events");
  return <DashboardShell user={user} section="events">
    <WorkspaceHeading title="Acara saya" description="Kelola draf, cek undangan yang sudah terbit, dan salin tautan untuk tamu."
      action={<Link href="/dashboard/undangan/new" className="work-primary"><Plus size={17} /> Buat undangan</Link>} />
    <EventDirectory events={events} />
  </DashboardShell>;
}

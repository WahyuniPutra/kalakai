import { workspaceMutation } from "@/lib/workspace-proxy";

export async function PATCH(request: Request, { params }: RouteContext<"/api/service-requests/[requestId]">) {
  const { requestId } = await params;
  if (!/^\d+$/.test(requestId)) return Response.json({ message: "Permintaan tidak ditemukan." }, { status: 404 });
  return workspaceMutation(request, `/api/service-requests/${requestId}`);
}

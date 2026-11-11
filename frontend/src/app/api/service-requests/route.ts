import { workspaceMutation } from "@/lib/workspace-proxy";

export function POST(request: Request) {
  return workspaceMutation(request, "/api/service-requests");
}

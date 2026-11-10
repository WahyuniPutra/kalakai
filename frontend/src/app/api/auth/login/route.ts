import { authenticate } from "@/lib/auth-proxy";

export async function POST(request: Request) {
  return authenticate(request, "login");
}

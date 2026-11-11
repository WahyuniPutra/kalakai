import { revalidatePath } from "next/cache";
import { workspaceMutation } from "@/lib/workspace-proxy";

export async function PATCH(request: Request) {
  const response = await workspaceMutation(request, "/api/profile/catalog");
  if (response.ok) {
    const profile = await response.clone().json();
    revalidatePath("/mitra");
    revalidatePath(`/mitra/${profile.id}`);
  }
  return response;
}

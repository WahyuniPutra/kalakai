import AuthForm from "@/app/auth/AuthForm";
import { findInvitationTemplate } from "@/lib/invitation-templates";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  return <AuthForm mode="login" template={findInvitationTemplate((await searchParams).template)} />;
}

import AuthForm from "@/app/auth/AuthForm";
import { findInvitationTemplate } from "@/lib/invitation-templates";

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  return <AuthForm mode="register" template={findInvitationTemplate((await searchParams).template)} />;
}

import InvitationBuilder from "../../InvitationBuilder";
import { getInvitationBuilderUser } from "../get-user";
import { findInvitationTemplate } from "@/lib/invitation-templates";

export default async function NewInvitationPage({ searchParams }: PageProps<"/dashboard/undangan/new">) {
  const [user, query] = await Promise.all([getInvitationBuilderUser(), searchParams]);
  const template = findInvitationTemplate(query.template);
  return <InvitationBuilder key={template?.id} user={user} initialTemplate={template} />;
}

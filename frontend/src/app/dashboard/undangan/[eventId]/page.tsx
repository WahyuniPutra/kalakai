import InvitationBuilder from "../../InvitationBuilder";
import { getInvitationBuilderUser } from "../get-user";

export default async function EditInvitationPage({ params }: PageProps<"/dashboard/undangan/[eventId]">) {
  const { eventId } = await params;
  const user = await getInvitationBuilderUser();
  return <InvitationBuilder eventId={eventId} user={user} />;
}

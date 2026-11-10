import InvitationBuilder from "../../InvitationBuilder";
import { getInvitationBuilderUser } from "../get-user";

export default async function NewInvitationPage() {
  const user = await getInvitationBuilderUser();
  return <InvitationBuilder user={user} />;
}

export default function WorkspaceHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="work-heading">
    <div><h1>{title}</h1><p>{description}</p></div>
    {action}
  </div>;
}

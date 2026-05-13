import { ProjectEditPage } from "../../../../../features/projects/ProjectEditPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectEditPage id={id} />;
}

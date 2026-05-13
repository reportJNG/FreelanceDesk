import { ClientEditPage } from "../../../../../features/clients/ClientEditPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientEditPage id={id} />;
}

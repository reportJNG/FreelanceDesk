"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClientForm } from "../../components/forms/ClientForm";
import { PageHeader } from "../../components/common/PageHeader";
import { clientsApi } from "./clientsApi";

export function ClientCreatePage() {
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: clientsApi.create, onSuccess: (client) => { toast.success("Client created"); queryClient.invalidateQueries({ queryKey: ["clients"] }); window.location.href = `/clients/${client.id}`; }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not create client") });
  return <><PageHeader title="New Client" /><ClientForm onSubmit={(values) => mutation.mutate(values)} submitLabel="Create client" disabled={mutation.isPending} /></>;
}

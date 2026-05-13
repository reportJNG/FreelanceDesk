"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClientForm } from "../../components/forms/ClientForm";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { clientsApi } from "./clientsApi";

export function ClientEditPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["clients", id], queryFn: () => clientsApi.get(id) });
  const mutation = useMutation({ mutationFn: (values: unknown) => clientsApi.update(id, values), onSuccess: () => { toast.success("Client updated"); queryClient.invalidateQueries({ queryKey: ["clients"] }); window.location.href = `/clients/${id}`; }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update client") });
  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} />;
  return <><PageHeader title="Edit Client" /><ClientForm initial={query.data} onSubmit={(values) => mutation.mutate(values)} disabled={mutation.isPending} /></>;
}

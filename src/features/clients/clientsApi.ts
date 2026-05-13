import { apiRequest, type ListResponse } from "../../lib/apiClient";
import type { Client } from "./clientsTypes";

export const clientsApi = {
  list: (params?: Record<string, unknown>) => apiRequest<ListResponse<Client>>("/clients", { params }),
  get: (id: string) => apiRequest<Client>(`/clients/${id}`),
  create: (body: unknown) => apiRequest<Client>("/clients", { method: "POST", body }),
  update: (id: string, body: unknown) => apiRequest<Client>(`/clients/${id}`, { method: "PATCH", body }),
  archive: (id: string) => apiRequest<Client>(`/clients/${id}`, { method: "DELETE" }),
};


import { apiRequest, type ListResponse } from "../../lib/apiClient";
import type { SupportRequest } from "./supportTypes";

export const supportApi = {
  list: (params?: Record<string, unknown>) => apiRequest<ListResponse<SupportRequest>>("/support-requests", { params }),
  create: (body: unknown) => apiRequest<SupportRequest>("/support-requests", { method: "POST", body }),
  update: (id: string, body: unknown) => apiRequest<SupportRequest>(`/support-requests/${id}`, { method: "PATCH", body }),
  delete: (id: string) => apiRequest<{ detail: string }>(`/support-requests/${id}`, { method: "DELETE" }),
};


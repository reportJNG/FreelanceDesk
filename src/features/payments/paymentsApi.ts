import { apiRequest, type ListResponse } from "../../lib/apiClient";
import type { Payment } from "./paymentsTypes";

export const paymentsApi = {
  list: (params?: Record<string, unknown>) => apiRequest<ListResponse<Payment>>("/payments", { params }),
  create: (body: unknown) => apiRequest<Payment>("/payments", { method: "POST", body }),
  update: (id: string, body: unknown) => apiRequest<Payment>(`/payments/${id}`, { method: "PATCH", body }),
  delete: (id: string) => apiRequest<{ detail: string }>(`/payments/${id}`, { method: "DELETE" }),
};


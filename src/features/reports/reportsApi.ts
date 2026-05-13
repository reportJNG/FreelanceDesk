import { apiRequest } from "../../lib/apiClient";

export const reportsApi = {
  revenue: () => apiRequest<{ monthly: { period: string; amount: number }[]; yearly: { period: string; amount: number }[] }>("/reports/revenue"),
  clientValue: () => apiRequest<{ client_id: string; name: string; total_paid: number }[]>("/reports/client-value"),
  unpaid: () => apiRequest<{ expected: number; paid: number; unpaid: number }>("/reports/unpaid"),
  projectsStatus: () => apiRequest<{ status: string; count: number }[]>("/reports/projects-status"),
  exportJson: () => apiRequest<Record<string, unknown>>("/reports/export/json"),
  exportCsv: (name: string) => apiRequest<string>(`/reports/export/${name}.csv`),
};


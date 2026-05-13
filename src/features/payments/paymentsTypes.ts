export type Payment = {
  id: string;
  client_id: string;
  project_id?: string | null;
  support_request_id?: string | null;
  amount: number;
  method: string;
  status: string;
  paid_at?: string | null;
  notes?: string | null;
  created_at: string;
  client_name?: string | null;
  project_name?: string | null;
  support_title?: string | null;
};

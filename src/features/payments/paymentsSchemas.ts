import { z } from "zod";

export const paymentSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  project_id: z.string().optional(),
  support_request_id: z.string().optional(),
  amount: z.coerce.number().min(0),
  method: z.string().default("cash"),
  status: z.string().default("paid"),
  paid_at: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;


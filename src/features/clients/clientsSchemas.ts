import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
  status: z.string().default("active"),
  tagsText: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;


export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.VITE_API_URL ?? "/api";

export const projectStatuses = ["lead", "active", "testing", "delivered", "maintenance", "cancelled", "archived"];
export const clientStatuses = ["active", "lead", "inactive", "archived"];
export const paymentStatuses = ["pending", "paid", "failed", "refunded"];
export const paymentMethods = ["cash", "baridimob", "ccp", "bank_transfer", "paypal", "wise", "crypto", "other"];
export const supportStatuses = ["new", "planned", "in_progress", "waiting_client", "done", "cancelled"];
export const priorities = ["low", "medium", "high", "urgent"];
export const supportTypes = ["bug", "change", "feature", "maintenance", "consulting", "other"];

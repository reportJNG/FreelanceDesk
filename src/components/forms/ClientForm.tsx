"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientFormValues } from "../../features/clients/clientsSchemas";
import { clientStatuses } from "../../lib/constants";
import type { Client } from "../../features/clients/clientsTypes";

export function ClientForm({ initial, onSubmit, submitLabel = "Save client", disabled = false }: { initial?: Partial<Client>; onSubmit: (values: Record<string, unknown>) => void; submitLabel?: string; disabled?: boolean }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as Resolver<ClientFormValues>,
    defaultValues: { name: initial?.name ?? "", company_name: initial?.company_name ?? "", email: initial?.email ?? "", phone: initial?.phone ?? "", whatsapp: initial?.whatsapp ?? "", website: initial?.website ?? "", status: initial?.status ?? "active", tagsText: initial?.tags?.join(", ") ?? "", notes: initial?.notes ?? "" },
  });
  return (
    <form className="card grid" onSubmit={handleSubmit((values) => onSubmit({ ...values, tags: values.tagsText?.split(",").map((tag: string) => tag.trim()).filter(Boolean) ?? [], tagsText: undefined }))}>
      <div className="form-grid">
        <label className="label">Name<input className="input" {...register("name")} />{errors.name?.message ? <span className="field-error">{errors.name.message}</span> : null}</label>
        <label className="label">Company<input className="input" {...register("company_name")} /></label>
        <label className="label">Email<input className="input" {...register("email")} /></label>
        <label className="label">Phone<input className="input" {...register("phone")} /></label>
        <label className="label">WhatsApp<input className="input" {...register("whatsapp")} /></label>
        <label className="label">Website<input className="input" {...register("website")} /></label>
        <label className="label">Status<select className="select" {...register("status")}>{clientStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="label">Tags<input className="input" placeholder="landing, ecommerce" {...register("tagsText")} /></label>
      </div>
      <label className="label">Notes<textarea className="textarea" {...register("notes")} /></label>
      <div className="form-actions"><button className="button" disabled={isSubmitting || disabled}>{disabled ? "Saving..." : submitLabel}</button></div>
    </form>
  );
}

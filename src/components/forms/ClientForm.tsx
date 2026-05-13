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
      <section className="form-section">
        <h2 className="form-section-title">Client details</h2>
        <div className="form-grid">
          <label className="label"><span className="label-text">Name</span><input className="input" placeholder="Client name" {...register("name")} />{errors.name?.message ? <span className="field-error">{errors.name.message}</span> : null}</label>
          <label className="label"><span className="label-text">Company</span><input className="input" placeholder="Company or brand" {...register("company_name")} /></label>
          <label className="label"><span className="label-text">Email</span><input className="input" type="email" placeholder="client@example.com" {...register("email")} /></label>
          <label className="label"><span className="label-text">Phone</span><input className="input" placeholder="+1 555 000 0000" {...register("phone")} /></label>
          <label className="label"><span className="label-text">WhatsApp</span><input className="input" placeholder="+1 555 000 0000" {...register("whatsapp")} /></label>
          <label className="label"><span className="label-text">Website</span><input className="input" placeholder="https://example.com" {...register("website")} /></label>
          <label className="label"><span className="label-text">Status</span><select className="select" {...register("status")}>{clientStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="label"><span className="label-text">Tags</span><input className="input" placeholder="landing, ecommerce" {...register("tagsText")} /></label>
        </div>
      </section>
      <div className="form-section">
        <label className="label"><span className="label-text">Notes</span><textarea className="textarea" placeholder="Important context, preferences, or follow-up notes" {...register("notes")} /></label>
      </div>
      <div className="form-actions"><button className="button" disabled={isSubmitting || disabled}>{disabled ? "Saving..." : submitLabel}</button></div>
    </form>
  );
}

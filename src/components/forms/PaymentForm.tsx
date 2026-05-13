"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Client } from "../../features/clients/clientsTypes";
import type { Project } from "../../features/projects/projectsTypes";
import { paymentMethods, paymentStatuses } from "../../lib/constants";
import { paymentSchema, type PaymentFormValues } from "../../features/payments/paymentsSchemas";

export function PaymentForm({ clients, projects, onSubmit, disabled = false }: { clients: Client[]; projects: Project[]; onSubmit: (values: Record<string, unknown>) => void; disabled?: boolean }) {
  const { register, handleSubmit } = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues>, defaultValues: { method: "cash", status: "paid", amount: 0 } });
  return (
    <form className="card grid" onSubmit={handleSubmit((values) => onSubmit({ ...values, project_id: values.project_id || null, support_request_id: values.support_request_id || null }))}>
      <div className="form-grid">
        <label className="label">Client<select className="select" {...register("client_id")}><option value="">Select client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="label">Project<select className="select" {...register("project_id")}><option value="">Optional</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="label">Amount<input className="input" type="number" step="0.01" {...register("amount")} /></label>
        <label className="label">Method<select className="select" {...register("method")}>{paymentMethods.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="label">Status<select className="select" {...register("status")}>{paymentStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="label">Paid date<input className="input" type="date" {...register("paid_at")} /></label>
      </div>
      <label className="label">Notes<textarea className="textarea" {...register("notes")} /></label>
      <div className="form-actions"><button className="button" disabled={disabled}>{disabled ? "Recording..." : "Record payment"}</button></div>
    </form>
  );
}

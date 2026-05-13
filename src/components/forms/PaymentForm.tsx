"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Client } from "../../features/clients/clientsTypes";
import type { Project } from "../../features/projects/projectsTypes";
import { paymentMethods, paymentStatuses } from "../../lib/constants";
import { paymentSchema, type PaymentFormValues } from "../../features/payments/paymentsSchemas";

export function PaymentForm({ clients, projects, onSubmit, disabled = false }: { clients: Client[]; projects: Project[]; onSubmit: (values: Record<string, unknown>) => void; disabled?: boolean }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues>, defaultValues: { method: "cash", status: "paid", amount: 0 } });
  return (
    <form className="card grid" onSubmit={handleSubmit((values) => onSubmit({ ...values, project_id: values.project_id || null, support_request_id: values.support_request_id || null }))}>
      <div className="form-section">
        <h2 className="form-section-title">Payment details</h2>
        <div className="form-grid">
          <label className="label"><span className="label-text">Client</span><select className="select" {...register("client_id")}><option value="">Select client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{errors.client_id?.message ? <span className="field-error">{errors.client_id.message}</span> : null}</label>
          <label className="label"><span className="label-text">Project</span><select className="select" {...register("project_id")}><option value="">Optional</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="label"><span className="label-text">Amount</span><input className="input" type="number" min="0" step="0.01" {...register("amount")} />{errors.amount?.message ? <span className="field-error">{errors.amount.message}</span> : null}</label>
          <label className="label"><span className="label-text">Method</span><select className="select" {...register("method")}>{paymentMethods.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="label"><span className="label-text">Status</span><select className="select" {...register("status")}>{paymentStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="label"><span className="label-text">Paid date</span><input className="input" type="date" {...register("paid_at")} /></label>
        </div>
      </div>
      <label className="label"><span className="label-text">Notes</span><textarea className="textarea" placeholder="Receipt, transfer note, or context" {...register("notes")} /></label>
      <div className="form-actions"><button className="button" disabled={isSubmitting || disabled}>{disabled ? "Recording..." : "Record payment"}</button></div>
    </form>
  );
}

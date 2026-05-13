"use client";

import { Archive, Trash2 } from "lucide-react";

export function ConfirmDialog({ label, onConfirm, action = "Archive", danger = true }: { label: string; onConfirm: () => void; action?: string; danger?: boolean }) {
  const Icon = action.toLowerCase().includes("delete") ? Trash2 : Archive;
  return (
    <button className={`button ${danger ? "danger" : "secondary"}`} type="button" onClick={() => window.confirm(label) && onConfirm()}>
      <Icon size={16} /> {action}
    </button>
  );
}

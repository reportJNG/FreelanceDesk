"use client";

import { Archive, Trash2 } from "lucide-react";
import { useId, useState } from "react";

export function ConfirmDialog({ label, onConfirm, action = "Archive", danger = true }: { label: string; onConfirm: () => void; action?: string; danger?: boolean }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const Icon = action.toLowerCase().includes("delete") ? Trash2 : Archive;
  return (
    <>
      <button className={`button small ${danger ? "danger" : "secondary"}`} type="button" onClick={() => setOpen(true)}>
        <Icon size={16} /> {action}
      </button>
      {open ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()}>
            <h2 className="dialog-title" id={titleId}>{label}</h2>
            <p className="state-description">This action cannot be undone from this screen.</p>
            <div className="dialog-actions">
              <button className="button secondary" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className={`button ${danger ? "danger" : ""}`} type="button" onClick={() => { onConfirm(); setOpen(false); }}>
                <Icon size={16} /> {action}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

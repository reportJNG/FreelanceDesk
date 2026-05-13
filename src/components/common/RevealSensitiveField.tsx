"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function RevealSensitiveField({ label, value }: { label: string; value?: string | null }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="card">
      <div className="subtle">{label}</div>
      <div className="sensitive-row">
        <code className="code-value">{visible ? value || "Not set" : "Hidden"}</code>
        <button className="button secondary" type="button" onClick={() => setVisible((current) => !current)}>
          {visible ? <EyeOff size={16} /> : <Eye size={16} />} {visible ? "Hide" : "Reveal"}
        </button>
      </div>
    </div>
  );
}

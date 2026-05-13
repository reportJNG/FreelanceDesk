import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyButton({ value }: { value?: string | null }) {
  return <button className="button secondary" type="button" onClick={() => { navigator.clipboard.writeText(value ?? ""); toast.success("Copied"); }}><Copy size={16} /> Copy</button>;
}


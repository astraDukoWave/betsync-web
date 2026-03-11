"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ConfigRowProps {
  label: string;
  value: string | number;
  type?: "text" | "number" | "select";
  options?: string[];
  suffix?: string;
  onSave: (value: string | number) => Promise<void>;
  disabled?: boolean;
}

export function ConfigRow({
  label,
  value,
  type = "text",
  options,
  suffix,
  onSave,
  disabled = false,
}: ConfigRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Sync draft when value changes externally
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const handleSave = async () => {
    if (draft === String(value)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const parsed = type === "number" ? Number(draft) : draft;
      await onSave(parsed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>

      <div className="flex items-center gap-2">
        {editing ? (
          <>
            {type === "select" && options ? (
              <select
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="rounded-md border border-border bg-surface-elevated px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={saving}
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-1">
                <Input
                  ref={inputRef}
                  type={type}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={saving}
                  className="h-7 w-28 text-sm px-2 font-mono"
                />
                {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-green-400 hover:text-green-300 disabled:opacity-50 transition-colors"
              title="Save"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-mono text-foreground">
              {value}{suffix && <span className="text-muted-foreground text-xs ml-0.5">{suffix}</span>}
            </span>
            {!disabled && (
              <button
                onClick={() => setEditing(true)}
                className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

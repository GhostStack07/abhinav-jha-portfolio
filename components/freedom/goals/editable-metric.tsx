"use client";

import { useState } from "react";
import { Check, Pencil } from "lucide-react";

interface EditableMetricProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}

export function EditableMetric({
  label,
  value,
  icon,
  color = "#d4af37",
  onChange,
  prefix = "",
  suffix = "",
}: EditableMetricProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const save = () => {
    const num = parseFloat(draft);
    if (!isNaN(num) && num >= 0) onChange(num);
    setEditing(false);
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[#232329] bg-[#111113] group"
      style={{ borderColor: editing ? `${color}50` : undefined }}
    >
      <div style={{ color }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500">{label}</p>
        {editing ? (
          <input
            autoFocus
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-full text-sm font-bold bg-transparent text-white outline-none border-b border-[#d4af37] pb-0.5"
          />
        ) : (
          <p className="text-sm font-bold text-white truncate">
            {prefix}{value.toLocaleString()}{suffix ? ` ${suffix}` : ""}
          </p>
        )}
      </div>
      <button
        onClick={() => {
          if (editing) {
            save();
          } else {
            setDraft(String(value));
            setEditing(true);
          }
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center hover:bg-[#d4af37]/10"
        style={{ color }}
      >
        {editing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

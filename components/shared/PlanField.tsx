"use client"

interface PlanFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function PlanField({
  label,
  value,
  onChange,
  placeholder = "...",
  minHeight = "70px",
}: PlanFieldProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-3.5 bg-primary/40 rounded-full" />
        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight }}
        className="w-full px-4 py-3 text-sm bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed transition-all"
      />
    </div>
  )
}

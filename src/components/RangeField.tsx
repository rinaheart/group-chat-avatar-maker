import { useId } from 'react';

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
}

export function RangeField({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: RangeFieldProps) {
  const id = useId();
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <label htmlFor={id} className="text-[var(--muted)]">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-xs font-medium tabular-nums text-[var(--fg)]">
          {displayValue}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        className="mt-1.5 h-6 w-full cursor-pointer accent-[var(--brand)]"
      />
    </div>
  );
}

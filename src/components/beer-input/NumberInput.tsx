import { clsx, type ClassValue } from "clsx";

export function NumberInput({
  label,
  description,
  value,
  onChange,
  onBlur,
  className,
  disabled = false,
  small = false,
}: {
  label: string;
  description?: string;
  value?: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  className?: ClassValue;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <div className={clsx("field border", { small, label }, className)}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        onBlur={onBlur}
        disabled={disabled}
      />
      <label>{label}</label>
      {description && <span className="helper">{description}</span>}
    </div>
  );
}

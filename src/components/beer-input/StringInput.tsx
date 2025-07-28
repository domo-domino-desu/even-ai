import { clsx, type ClassValue } from "clsx";

export function StringInput({
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
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: ClassValue;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <div className={clsx("field border", { small, label }, className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
      />
      <label>{label}</label>
      {description && <span className="helper">{description}</span>}
    </div>
  );
}

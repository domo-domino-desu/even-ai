import { clsx, type ClassValue } from "clsx";

export function BooleanInput({
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
  value?: boolean;
  onChange: (value: boolean) => void;
  onBlur?: () => void;
  className?: ClassValue;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <div className={clsx("field border suffix", { small, label }, className)}>
      <select
        value={value ? "true" : "false"}
        onChange={(e) => onChange(e.target.value === "true")}
        onBlur={onBlur}
        disabled={disabled}
        className={clsx({ small, label })}
      >
        <option value={"true"}>是</option>
        <option value={"false"}>否</option>
      </select>
      <label>{label}</label>
      <i>arrow_drop_down</i>
      {description && <span className="helper">{description}</span>}
    </div>
  );
}

import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <select
          className={cn(
            "w-full px-4 py-2 rounded-lg border-2 bg-surface text-text-primary",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors",
            error
              ? "border-error focus:ring-error focus:border-error"
              : "border-surface-elevated hover:border-primary-300",
            className
          )}
          ref={ref}
          {...props}
        >
          {!props.value && (
            <option value="" disabled>
              선택해주세요
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";


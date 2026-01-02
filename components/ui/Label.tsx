import { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export function Label({
  children,
  required,
  className,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-text-primary mb-2",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  );
}


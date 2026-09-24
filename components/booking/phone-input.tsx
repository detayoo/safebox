"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function formatUsPhone(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}) {
  return (
    <Input
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="(555) 123-4567"
      value={value}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      className={cn(className)}
      onChange={(event) => onChange(formatUsPhone(event.target.value))}
      onBlur={onBlur}
    />
  );
}

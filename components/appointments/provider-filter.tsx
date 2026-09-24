"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Provider } from "@/lib/schemas/appointment";

const ALL = "all";

export function ProviderFilter({
  providers,
  value,
  onChange,
}: {
  providers: Provider[];
  value: string;
  onChange: (providerId: string) => void;
}) {
  return (
    <Select
      value={value || ALL}
      onValueChange={(next) => onChange(next === ALL ? "" : next)}
    >
      <SelectTrigger size="sm" className="w-[190px]">
        <SelectValue placeholder="All providers" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All providers</SelectItem>
        {providers.map((provider) => (
          <SelectItem key={provider.id} value={provider.id}>
            {provider.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

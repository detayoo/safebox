"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFailureToggle } from "@/lib/stores/failure-toggle";

export function FailureToggle() {
  const enabled = useFailureToggle((state) => state.enabled);
  const setEnabled = useFailureToggle((state) => state.setEnabled);

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="simulate-failure"
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-label="Simulate failed requests"
      />
      <Label
        htmlFor="simulate-failure"
        className="text-muted-foreground hidden cursor-pointer text-xs font-normal whitespace-nowrap sm:inline"
      >
        Simulate failures
      </Label>
    </div>
  );
}

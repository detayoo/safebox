"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MIN_REASON_LENGTH = 10;

export function CancelAppointmentDialog({
  open,
  onOpenChange,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const trimmed = reason.trim();
  const tooShort = trimmed.length < MIN_REASON_LENGTH;
  const showError = touched && tooShort;

  function reset() {
    setReason("");
    setTouched(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this appointment?</DialogTitle>
          <DialogDescription>
            This cannot be undone. The patient will need to book again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="cancellation-reason">Reason for cancelling</Label>
          <Textarea
            id="cancellation-reason"
            value={reason}
            rows={3}
            placeholder="e.g. Patient called to reschedule"
            aria-invalid={showError}
            aria-describedby="cancellation-reason-help"
            onChange={(event) => {
              setReason(event.target.value);
              setTouched(true);
            }}
          />
          {/* Space is always reserved, so the dialog does not jump. */}
          <p
            id="cancellation-reason-help"
            role={showError ? "alert" : undefined}
            className={
              showError
                ? "text-destructive text-xs"
                : "text-muted-foreground text-xs"
            }
          >
            {showError
              ? `Please give at least ${MIN_REASON_LENGTH} characters (${trimmed.length}/${MIN_REASON_LENGTH}).`
              : `At least ${MIN_REASON_LENGTH} characters.`}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Keep appointment
          </Button>
          <Button
            variant="destructive"
            disabled={pending || tooShort}
            onClick={() => onConfirm(trimmed)}
          >
            {pending ? "Cancelling…" : "Cancel appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

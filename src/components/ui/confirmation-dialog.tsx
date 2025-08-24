import { AlertTriangle, X } from "lucide-react";
import * as React from "react";

import { cn } from "@app/core/lib/utils";

import { Button } from "./button";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleCancel = React.useCallback(() => {
    if (onCancel) onCancel();
    onOpenChange(false);
  }, [onCancel, onOpenChange]);

  const handleConfirm = () => {
    onConfirm();
    // Note: Don't close dialog here - let the parent handle it after successful action
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open && !isLoading) {
        handleCancel();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, isLoading, handleCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isLoading ? undefined : handleCancel}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isLoading) {
            handleCancel();
          }
        }}
        role="presentation"
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-lg bg-background p-6 shadow-lg",
          "mx-4 animate-in duration-200 fade-in-0 zoom-in-95",
        )}
      >
        {/* Close button */}
        <button
          onClick={isLoading ? undefined : handleCancel}
          disabled={isLoading}
          className={cn(
            "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity",
            "hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          {variant === "destructive" && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <h2 className="text-lg leading-none font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="sm:order-1"
          >
            {cancelLabel}
          </Button>

          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
            className="sm:order-2"
          >
            {isLoading && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

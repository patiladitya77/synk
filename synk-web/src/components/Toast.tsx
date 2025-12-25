"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";

type ToastVariant = "success" | "error";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
};

export default function Toast({
  message,
  variant = "success",
  duration = 4000,
  onClose,
}: ToastProps) {
  const [progress, setProgress] = useState("100%");

  useEffect(() => {
    const start = setTimeout(() => setProgress("0%"), 50);
    const close = setTimeout(onClose, duration);

    return () => {
      clearTimeout(start);
      clearTimeout(close);
    };
  }, [duration, onClose]);

  const isError = variant === "error";

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`relative overflow-hidden rounded-lg border bg-background text-foreground shadow-lg flex items-start gap-3 px-4 py-3 w-85
        ${isError ? "animate-shake" : ""}`}
      >
        {/* Icon */}
        {isError ? (
          <XCircle className="text-destructive mt-0.5" size={20} />
        ) : (
          <CheckCircle className="text-primary mt-0.5" size={20} />
        )}

        {/* Message */}
        <p className="flex-1 text-sm leading-relaxed">{message}</p>

        {/* Close */}
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition"
        >
          <X size={16} />
        </button>

        {/* Progress bar */}
        <div
          className={`absolute bottom-0 left-0 h-0.5 transition-[width] ease-linear
            ${isError ? "bg-destructive" : "bg-primary"}`}
          style={{
            width: progress,
            transitionDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  );
}

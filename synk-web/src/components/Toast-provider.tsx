"use client";

import { createContext, useContext, useState } from "react";
import Toast from "@/components/Toast";
type ToastVariant = "success" | "error";

type ToastContextType = {
  showToast: (
    message: string,
    variant: ToastVariant,
    duration?: number
  ) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);

  const showToast = (
    message: string,
    variant: ToastVariant = "success",
    duration = 4000
  ) => {
    setToast({ message, variant });

    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
}

export const useGlobalToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useGlobalToast must be used within ToastProvider");
  }
  return ctx;
};

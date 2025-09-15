"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import React, { createContext, useContext, useState } from "react";

interface ToastContextType {
  showToast: (
    title: string,
    description?: string,
    variant?: "default" | "destructive" | "success"
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  open: boolean;
}

export function ToastContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (
    title: string,
    description?: string,
    variant: "default" | "destructive" | "success" = "default"
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = {
      id,
      title,
      description,
      variant,
      open: true,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after 6 seconds for success toasts, 5 seconds for others
    const duration = variant === "success" ? 6000 : 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getToastIcon = (variant?: "default" | "destructive" | "success") => {
    switch (variant) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "destructive":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastProvider>
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            open={toast.open}
            onOpenChange={(open) => {
              if (!open) {
                removeToast(toast.id);
              }
            }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 pt-0.5">
                {getToastIcon(toast.variant)}
              </div>
              <div className="grid gap-1 flex-1">
                <ToastTitle className="font-semibold">{toast.title}</ToastTitle>
                {toast.description && (
                  <ToastDescription className="text-sm">
                    {toast.description}
                  </ToastDescription>
                )}
              </div>
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

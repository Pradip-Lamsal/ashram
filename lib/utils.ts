import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
    englishToNepaliDateFormatted,
    englishToNepaliDateTime,
} from "./nepali-date-utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `Rs. ${new Intl.NumberFormat("en-IN").format(amount)}`;
}

// Updated to use Nepali dates by default
export function formatDate(date: Date): string {
  return englishToNepaliDateFormatted(date);
}

export function formatDateTime(date: Date): string {
  return englishToNepaliDateTime(date);
}

// Keep English formatters for backward compatibility when needed
export function formatEnglishDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatEnglishDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function generateReceiptNumber(): string {
  const prefix = "ASH";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
}

export function generateQRData(
  receiptNumber: string,
  amount: number,
  donorName: string
): string {
  return JSON.stringify({
    receiptNumber,
    amount,
    donorName,
    timestamp: new Date().toISOString(),
    organization: "Ashram Management System",
  });
}

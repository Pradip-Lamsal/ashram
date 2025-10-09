// Nepali Date Utilities
// This file provides utilities for converting between English and Nepali dates
// and formatting dates consistently across the application

// Nepali months names
export const NEPALI_MONTHS = [
  "बैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फाल्गुन",
  "चैत्र",
];

// Nepali weekday names
export const NEPALI_WEEKDAYS = [
  "आइतबार",
  "सोमबार",
  "मंगलबार",
  "बुधबार",
  "बिहिबार",
  "शुक्रबार",
  "शनिबार",
];

/**
 * Convert English date to Nepali date string using basic conversion
 * This is a simplified approach that adds ~57 years to approximate Nepali date
 */
export function englishToNepaliDate(englishDate: Date | string): string {
  try {
    const date =
      typeof englishDate === "string" ? new Date(englishDate) : englishDate;

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    // Simple approximation: Add ~57 years to get Nepali year
    // This is a basic conversion - for more accuracy, you'd need the full conversion library
    const englishYear = date.getFullYear();
    const nepaliYear = englishYear + 57; // Rough conversion
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${nepaliYear}/${String(month).padStart(2, "0")}/${String(
      day
    ).padStart(2, "0")}`;
  } catch (error) {
    console.warn("Error converting to Nepali date:", error);
    return formatEnglishDate(
      typeof englishDate === "string" ? new Date(englishDate) : englishDate
    );
  }
}

/**
 * Convert English date to formatted Nepali date with month name
 */
export function englishToNepaliDateFormatted(
  englishDate: Date | string
): string {
  try {
    const date =
      typeof englishDate === "string" ? new Date(englishDate) : englishDate;

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    const englishYear = date.getFullYear();
    const nepaliYear = englishYear + 57;
    const monthIndex = date.getMonth();
    const day = date.getDate();

    const monthName = NEPALI_MONTHS[monthIndex] || monthIndex + 1;
    return `${day} ${monthName} ${nepaliYear}`;
  } catch (error) {
    console.warn("Error formatting Nepali date:", error);
    return formatEnglishDate(
      typeof englishDate === "string" ? new Date(englishDate) : englishDate
    );
  }
}

/**
 * Convert English date to Nepali date with time
 */
export function englishToNepaliDateTime(englishDate: Date | string): string {
  try {
    const date =
      typeof englishDate === "string" ? new Date(englishDate) : englishDate;

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    const nepaliDateStr = englishToNepaliDateFormatted(date);
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${nepaliDateStr}, ${timeStr}`;
  } catch (error) {
    console.warn("Error formatting Nepali date time:", error);
    return formatEnglishDateTime(
      typeof englishDate === "string" ? new Date(englishDate) : englishDate
    );
  }
}

/**
 * Get today's date in Nepali format
 */
export function getTodayNepaliDate(): string {
  return englishToNepaliDate(new Date());
}

/**
 * Get today's formatted date in Nepali
 */
export function getTodayNepaliDateFormatted(): string {
  return englishToNepaliDateFormatted(new Date());
}

/**
 * Convert Nepali date string to English Date object (simplified)
 */
export function nepaliToEnglishDate(nepaliDateStr: string): Date | null {
  try {
    // Parse Nepali date string (format: YYYY/MM/DD or YYYY-MM-DD)
    const parts = nepaliDateStr.replace(/[\/\-]/g, "/").split("/");
    if (parts.length !== 3) {
      return null;
    }

    const nepaliYear = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed in Date
    const day = parseInt(parts[2]);

    if (isNaN(nepaliYear) || isNaN(month) || isNaN(day)) {
      return null;
    }

    // Simple conversion: subtract ~57 years from Nepali year
    const englishYear = nepaliYear - 57;
    return new Date(englishYear, month, day);
  } catch (error) {
    console.warn("Error converting Nepali to English date:", error);
    return null;
  }
}

/**
 * Fallback English date formatters
 */
function formatEnglishDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatEnglishDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Get current date in format suitable for Nepali date picker
 */
export function getCurrentNepaliDateString(): string {
  return getTodayNepaliDate();
}

/**
 * Validate if a string is a valid Nepali date format
 */
export function isValidNepaliDate(dateStr: string): boolean {
  try {
    const converted = nepaliToEnglishDate(dateStr);
    return converted !== null;
  } catch {
    return false;
  }
}

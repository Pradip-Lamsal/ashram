"use client";

import { nepaliToEnglishDate } from "@/lib/nepali-date-utils";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const NepaliDatePickerLib = dynamic(
  () =>
    import("nepali-datepicker-reactjs").then((mod) => ({
      default: mod.NepaliDatePicker,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-10 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
        <span className="text-sm text-gray-500">
          Loading Nepali Calendar...
        </span>
      </div>
    ),
  }
);

interface NepaliDatePickerProps {
  value?: string;
  onChange: (nepaliDateString: string, approximateEnglishDate?: Date) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export function NepaliDatePicker({
  value = "",
  onChange,
  className = "",
  disabled = false,
  error = false,
}: NepaliDatePickerProps) {
  const inputClassName = `w-full rounded-md border px-3 py-2 text-sm ${
    error ? "border-red-500" : "border-input"
  } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`;

  return (
    <NepaliDatePickerLib
      inputClassName={inputClassName}
      value={value}
      onChange={(nepaliDateString: string) => {
        // Now dateString is in Nepali format since valueLocale is "ne"
        try {
          const approximateEnglishDate = nepaliToEnglishDate(nepaliDateString);
          if (approximateEnglishDate) {
            console.log("Nepali date conversion:", {
              input: nepaliDateString,
              output: approximateEnglishDate.toDateString(),
            });
            onChange(nepaliDateString, approximateEnglishDate);
          } else {
            console.warn("Failed to convert Nepali date:", nepaliDateString);
            // Use current date as fallback for storage, but keep Nepali string
            onChange(nepaliDateString, new Date());
          }
        } catch (error) {
          console.log("Date conversion error:", error);
          onChange(nepaliDateString, new Date());
        }
      }}
      options={{
        calenderLocale: "ne",
        valueLocale: "ne",
      }}
    />
  );
}

export default NepaliDatePicker;

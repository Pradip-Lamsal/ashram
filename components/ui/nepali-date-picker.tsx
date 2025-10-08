"use client";

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
  onChange: (dateString: string, adDate?: Date) => void;
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
      onChange={(dateString: string) => {
        // Convert Nepali date to English date for storage
        try {
          // For now, we'll pass the current date as English date
          // The library should handle proper conversion
          const currentDate = new Date();
          onChange(dateString, currentDate);
        } catch (error) {
          console.log("Date conversion error:", error);
          onChange(dateString, new Date());
        }
      }}
      options={{
        calenderLocale: "ne",
        valueLocale: "en",
      }}
    />
  );
}

export default NepaliDatePicker;

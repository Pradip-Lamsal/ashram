declare module "nepali-datepicker-reactjs" {
  export interface NepaliDatePickerProps {
    inputClassName?: string;
    value?: string;
    onChange?: (value: string) => void;
    options?: {
      calenderLocale?: string;
      valueLocale?: string;
    };
  }

  export const NepaliDatePicker: React.FC<NepaliDatePickerProps>;
}

declare module "nepali-datepicker-reactjs/dist/index.css";

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NepaliDatePicker } from "@/components/ui/nepali-date-picker";
import { useState } from "react";

export default function TestDatePage() {
  const [startDateNepali, setStartDateNepali] = useState("");
  const [endDateNepali, setEndDateNepali] = useState("");
  const [startDateEnglish, setStartDateEnglish] = useState<Date | null>(null);
  const [endDateEnglish, setEndDateEnglish] = useState<Date | null>(null);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Nepali Date Picker Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Start Date (शुरुवाती मिति)</h3>
              <NepaliDatePicker
                value={startDateNepali}
                onChange={(
                  nepaliDateString: string,
                  approximateEnglishDate?: Date
                ) => {
                  console.log("Start date picker onChange:", {
                    nepaliDateString,
                    approximateEnglishDate,
                  });
                  setStartDateNepali(nepaliDateString);
                  setStartDateEnglish(approximateEnglishDate || null);
                }}
              />
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                <div>
                  <strong>Nepali:</strong> {startDateNepali || "None selected"}
                </div>
                <div>
                  <strong>English:</strong>{" "}
                  {startDateEnglish ? startDateEnglish.toDateString() : "None"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">End Date (अन्तिम मिति)</h3>
              <NepaliDatePicker
                value={endDateNepali}
                onChange={(
                  nepaliDateString: string,
                  approximateEnglishDate?: Date
                ) => {
                  console.log("End date picker onChange:", {
                    nepaliDateString,
                    approximateEnglishDate,
                  });
                  setEndDateNepali(nepaliDateString);
                  setEndDateEnglish(approximateEnglishDate || null);
                }}
              />
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                <div>
                  <strong>Nepali:</strong> {endDateNepali || "None selected"}
                </div>
                <div>
                  <strong>English:</strong>{" "}
                  {endDateEnglish ? endDateEnglish.toDateString() : "None"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">
              Display Format (जस्तै Receipt मा देखिन्छ):
            </h4>
            {startDateNepali && endDateNepali ? (
              <div className="text-lg">
                <span className="font-medium text-emerald-600">
                  {startDateNepali} देखि {endDateNepali} सम्म
                </span>
              </div>
            ) : (
              <div className="text-gray-500">
                Select both dates to see the display format
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <div className="text-sm space-y-1">
              <div>Check browser console for detailed onChange logs</div>
              <div>Test different dates to ensure conversion accuracy</div>
              <div>
                Verify that different selected dates produce different results
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { generateReceiptPDFWithPlaywright } from "./playwright-pdf-generator";

// Enhanced PDF generation with Playwright fallback to Puppeteer
export async function generateReceiptPDF(receiptData: {
  receiptNumber: string;
  donorName: string;
  amount: number;
  donationType: string;
  includeLogos: boolean;
  address?: string;
  email?: string;
  phone?: string;
  receivedBy?: string;
  donationDate?: string;
  amountInWords?: string;
  notes?: string;
  donationItemsList?: Array<{
    item: string;
    amount: number;
  }>;
  donationItemsText?: string;
  donorId?: string;
  donationDay?: string;
  nepaliDate?: string;
  startDate?: string;
  endDate?: string;
  startDateNepali?: string;
  endDateNepali?: string;
  dateOfDonation?: string;
  createdAt?: string;
  paymentMode?: string;
  createdBy?: string;
}): Promise<Buffer> {
  console.log(
    "🎭 Attempting PDF generation with Playwright for better font support..."
  );

  try {
    // Try Playwright first - better for Devanagari fonts
    const result = await generateReceiptPDFWithPlaywright(receiptData);
    console.log("✅ Playwright PDF generation successful!");
    return result;
  } catch (playwrightError) {
    console.warn(
      "⚠️ Playwright failed, falling back to Puppeteer:",
      playwrightError
    );

    try {
      // Fallback to Puppeteer
      console.log("🔄 Trying Puppeteer fallback...");
      const result = await generateReceiptPDF(receiptData);
      console.log("✅ Puppeteer fallback successful!");
      return result;
    } catch (puppeteerError) {
      console.error("❌ Both Playwright and Puppeteer failed:", puppeteerError);
      throw new Error(
        `PDF generation failed with both engines. Playwright: ${
          playwrightError instanceof Error
            ? playwrightError.message
            : String(playwrightError)
        }. Puppeteer: ${
          puppeteerError instanceof Error
            ? puppeteerError.message
            : String(puppeteerError)
        }`
      );
    }
  }
}

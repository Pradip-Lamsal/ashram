import { generateReceiptPDFWithPlaywright } from "./playwright-pdf-generator";

// Production-ready PDF generation with enhanced Playwright reliability
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
    "🎭 Generating production-quality PDF with proper Nepali fonts..."
  );

  try {
    // Use Playwright for consistent local/production PDF generation
    const result = await generateReceiptPDFWithPlaywright(receiptData);
    console.log("✅ High-quality PDF generated successfully!");
    return result;
  } catch (playwrightError) {
    console.error("❌ Playwright PDF generation failed:", playwrightError);

    // Provide detailed error for production debugging
    const errorMessage =
      playwrightError instanceof Error
        ? playwrightError.message
        : String(playwrightError);

    throw new Error(
      `Production PDF generation failed: ${errorMessage}. Please check server logs for Playwright configuration issues.`
    );
  }
}

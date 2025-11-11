import { generatePDFWithPDFKit } from "./pdfkit-generator";

// Production-ready PDF generation with enhanced Puppeteer reliability
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
    // Use PDFKit with TTF font support for better Unicode handling
    const result = await generatePDFWithPDFKit({
      receiptNumber: receiptData.receiptNumber,
      donorName: receiptData.donorName,
      donorId: receiptData.donorId,
      amount: receiptData.amount,
      createdAt: receiptData.createdAt || new Date().toISOString(),
      donationType: receiptData.donationType,
      paymentMode: receiptData.paymentMode || "Unknown",
      dateOfDonation: receiptData.dateOfDonation,
      startDate: receiptData.startDate,
      endDate: receiptData.endDate,
      includeLogos: receiptData.includeLogos,
    });
    console.log("✅ High-quality PDF generated successfully!");
    return result;
  } catch (pdfkitError) {
    console.error("❌ PDFKit generation failed:", pdfkitError);

    // Provide detailed error for production debugging
    const errorMessage =
      pdfkitError instanceof Error ? pdfkitError.message : String(pdfkitError);

    throw new Error(
      `Production PDF generation failed: ${errorMessage}. Please check server logs for Playwright configuration issues.`
    );
  }
}

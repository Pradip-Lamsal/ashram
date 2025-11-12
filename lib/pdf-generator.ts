import { getFontAsBase64 } from "@/lib/font-loader";
import * as fs from "fs";
import jsPDF from "jspdf";
import * as path from "path";

interface ReceiptData {
  receiptNumber: string;
  donorName: string;
  donorId?: string;
  amount: number;
  createdAt: string;
  donationType: string;
  paymentMode: string;
  dateOfDonation?: string;
  startDate?: string;
  endDate?: string;
  startDateNepali?: string;
  endDateNepali?: string;
  notes?: string;
  createdBy?: string;
  includeLogos?: boolean;
}

// Function to load logo as base64
function loadLogoAsBase64(logoPath: string): string | null {
  try {
    const fullPath = path.join(process.cwd(), "public", logoPath);
    if (fs.existsSync(fullPath)) {
      const imageBuffer = fs.readFileSync(fullPath);
      return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
    }
    console.warn(`Logo not found: ${fullPath}`);
    return null;
  } catch (error) {
    console.error(`Error loading logo ${logoPath}:`, error);
    return null;
  }
}

async function generatePDFWithJSPDF(receiptData: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "🚀 Starting jsPDF generation with improved Nepali format..."
      );

      const doc = new jsPDF("p", "pt", "a4");

      // Load Nepali font for better Unicode support
      try {
        const fontBase64 = getFontAsBase64();
        if (fontBase64) {
          doc.addFileToVFS("NotoSansDevanagari.ttf", fontBase64);
          doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
          doc.setFont("NotoSansDevanagari");
          console.log("✅ Nepali font loaded successfully");
        } else {
          console.log("⚠️ Nepali font not found, using default font");
          doc.setFont("helvetica");
        }
      } catch (error) {
        console.warn("Failed to load Nepali font:", error);
        doc.setFont("helvetica");
      }

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 30;

      // Nepali labels mapping
      const DONATION_TYPE_LABELS: Record<string, string> = {
        "General Donation": "अक्षयकोष",
        "Seva Donation": "मुठ्ठी दान",
        Annadanam: "गुरुकुलम",
        "Vastra Danam": "जिन्सी सामग्री",
        "Building Fund": "भण्डारा",
        "Festival Sponsorship": "विशेष पूजा",
        "Puja Sponsorship": "आजीवन सदस्यता",
      };

      // Load logos if includeLogos is true
      let logo1Base64: string | null = null;
      let logo2Base64: string | null = null;

      if (receiptData.includeLogos) {
        logo1Base64 = loadLogoAsBase64("logo11.jpeg");
        logo2Base64 = loadLogoAsBase64("logo22.jpeg");
      }

      // Header layout with logos and registration numbers
      const headerStartY = y;

      // Left side - Logo 1 and registration numbers
      if (logo1Base64) {
        try {
          doc.addImage(logo1Base64, "JPEG", 50, headerStartY, 40, 40);
        } catch (error) {
          console.warn("Could not add logo1:", error);
        }
      }

      // Left registration numbers (below logo1)
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text("जि.प्र.का.ल.पु.द.नं. ४५४५/०६८", 50, headerStartY + 50);
      doc.text("पान नं ६००५९५६९०", 50, headerStartY + 62);

      // Right side - Logo 2 and registration number
      if (logo2Base64) {
        try {
          doc.addImage(
            logo2Base64,
            "JPEG",
            pageWidth - 90,
            headerStartY,
            40,
            40
          );
        } catch (error) {
          console.warn("Could not add logo2:", error);
        }
      }

      // Right registration number (below logo2)
      doc.text("स.क.प.आवद्धता नं. ३५०९१", pageWidth - 140, headerStartY + 50);

      // Center content area
      y = headerStartY + 30;

      // Sacred OM symbol (centered)
      doc.setFontSize(18);
      doc.setTextColor(255, 102, 0); // Orange color
      const omText = "ॐ";
      const omWidth = doc.getTextWidth(omText);
      doc.text(omText, (pageWidth - omWidth) / 2, y);

      // Main header - श्रीराधासर्वेश्वरो विजयते (centered)
      y += 20;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const headerText = "श्रीराधासर्वेश्वरो विजयते";
      const headerWidth = doc.getTextWidth(headerText);
      doc.text(headerText, (pageWidth - headerWidth) / 2, y);

      // Main organization name (centered)
      y += 20;
      doc.setFontSize(16);
      const mainTitle = "श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर";
      const mainTitleWidth = doc.getTextWidth(mainTitle);
      doc.text(mainTitle, (pageWidth - mainTitleWidth) / 2, y);

      // Subtitle (centered)
      y += 18;
      doc.setFontSize(12);
      const subtitle = "व्यवस्थापन तथा सञ्चालन समिति";
      const subtitleWidth = doc.getTextWidth(subtitle);
      doc.text(subtitle, (pageWidth - subtitleWidth) / 2, y);

      // Address (centered)
      y += 18;
      doc.setFontSize(10);
      const address = "ललितपुर म.न.पा.-९, शङ्खमूल, ललितपुर";
      const addressWidth = doc.getTextWidth(address);
      doc.text(address, (pageWidth - addressWidth) / 2, y);

      // Phone number (centered)
      y += 15;
      const phone = "फोन नं. ०१-५९१५६६७";
      const phoneWidth = doc.getTextWidth(phone);
      doc.text(phone, (pageWidth - phoneWidth) / 2, y);

      // Email (centered, blue color)
      y += 15;
      doc.setTextColor(0, 0, 255); // Blue color
      const email = "E-mail: jashankhamul@gmail.com";
      const emailWidth = doc.getTextWidth(email);
      doc.text(email, (pageWidth - emailWidth) / 2, y);

      // Receipt number box (centered, matching the image)
      y += 25;
      const receiptBoxWidth = 200;
      const receiptBoxHeight = 30;
      const receiptBoxX = (pageWidth - receiptBoxWidth) / 2;

      // Orange border rectangle
      doc.setDrawColor(255, 102, 0);
      doc.setLineWidth(1);
      doc.rect(receiptBoxX, y, receiptBoxWidth, receiptBoxHeight);

      // Receipt number text
      doc.setFontSize(12);
      doc.setTextColor(255, 102, 0);
      const receiptText = `Receipt #${receiptData.receiptNumber}`;
      const receiptTextWidth = doc.getTextWidth(receiptText);
      doc.text(receiptText, (pageWidth - receiptTextWidth) / 2, y + 18);

      // Issue date
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const issueDate = `Issued on ${new Date(
        receiptData.createdAt
      ).toLocaleDateString()}`;
      const issueDateWidth = doc.getTextWidth(issueDate);
      doc.text(issueDate, (pageWidth - issueDateWidth) / 2, y + 27);

      // Horizontal line separator
      y += 45;
      doc.setDrawColor(255, 102, 0);
      doc.setLineWidth(1);
      doc.line(50, y, pageWidth - 50, y);

      y += 20;

      // Two column layout for donor and receipt info (matching image layout)
      const leftColumnX = 50;
      const rightColumnX = 320;

      // Left Column - Donor Information
      doc.setFontSize(12);
      doc.setTextColor(74, 144, 226);
      doc.text("👤 Donor Information", leftColumnX, y);

      y += 15;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Name:", leftColumnX, y);
      doc.text(receiptData.donorName, leftColumnX + 50, y);

      if (receiptData.donorId) {
        y += 12;
        doc.text("Donor ID:", leftColumnX, y);
        doc.text(receiptData.donorId, leftColumnX + 50, y);
      }

      // Right Column - Receipt Details (reset y position)
      const rightColumnStartY = y - (receiptData.donorId ? 27 : 15);
      doc.setFontSize(12);
      doc.setTextColor(74, 144, 226);
      doc.text("📄 Receipt Details", rightColumnX, rightColumnStartY);

      let rightY = rightColumnStartY + 15;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      // Format donation date (handle Seva Donation period)
      let donationDateText = "N/A";
      if (receiptData.donationType === "Seva Donation") {
        // Prefer Nepali date strings if available
        if (receiptData.startDateNepali && receiptData.endDateNepali) {
          donationDateText = `${receiptData.startDateNepali} देखि ${receiptData.endDateNepali} सम्म`;
        } else if (receiptData.startDate && receiptData.endDate) {
          const startDate = new Date(
            receiptData.startDate
          ).toLocaleDateString();
          const endDate = new Date(receiptData.endDate).toLocaleDateString();
          donationDateText = `${startDate} देखि ${endDate} सम्म`;
        }
      } else if (receiptData.dateOfDonation) {
        donationDateText = new Date(
          receiptData.dateOfDonation
        ).toLocaleDateString();
      }

      doc.text("Donation Date:", rightColumnX, rightY);
      doc.text(donationDateText, rightColumnX + 70, rightY);

      rightY += 12;
      doc.text("Issued By:", rightColumnX, rightY);
      doc.text("System", rightColumnX + 70, rightY);

      // Move y to after both columns
      y = Math.max(y + 12, rightY + 20);

      // Donation Information Box (matching image style)
      const donationBoxY = y;
      const donationBoxHeight = 60;

      // Main donation box with light background
      doc.setFillColor(255, 248, 220); // Light beige
      doc.setDrawColor(255, 102, 0);
      doc.setLineWidth(1);
      doc.rect(50, donationBoxY, pageWidth - 100, donationBoxHeight, "FD");

      // Donation Information header
      doc.setFontSize(12);
      doc.setTextColor(255, 102, 0);
      const donationHeader = "Donation Information";
      const donationHeaderWidth = doc.getTextWidth(donationHeader);
      doc.text(
        donationHeader,
        (pageWidth - donationHeaderWidth) / 2,
        donationBoxY + 15
      );

      // Three column grid inside donation box
      const col1X = 70;
      const col2X = 240;
      const col3X = 410;
      const gridY = donationBoxY + 25;

      // Column 1 - Donation Type
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(200, 200, 200);
      doc.rect(col1X, gridY, 150, 25, "FD");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("DONATION TYPE", col1X + 5, gridY + 8);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const nepaliDonationType =
        DONATION_TYPE_LABELS[receiptData.donationType] ||
        receiptData.donationType;
      doc.text(nepaliDonationType, col1X + 5, gridY + 18);

      // Column 2 - Donation Period (if applicable)
      doc.rect(col2X, gridY, 150, 25, "FD");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("DONATION PERIOD", col2X + 5, gridY + 8);
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      if (receiptData.donationType === "Seva Donation") {
        // Prefer Nepali date strings if available
        if (receiptData.startDateNepali && receiptData.endDateNepali) {
          doc.text(
            `${receiptData.startDateNepali} देखि`,
            col2X + 5,
            gridY + 15
          );
          doc.text(`${receiptData.endDateNepali} सम्म`, col2X + 5, gridY + 22);
        } else if (receiptData.startDate && receiptData.endDate) {
          const startDate = new Date(
            receiptData.startDate
          ).toLocaleDateString();
          const endDate = new Date(receiptData.endDate).toLocaleDateString();
          doc.text(`${startDate} देखि`, col2X + 5, gridY + 15);
          doc.text(`${endDate} सम्म`, col2X + 5, gridY + 22);
        } else {
          doc.text("Period not specified", col2X + 5, gridY + 18);
        }
      } else {
        doc.text("Single Donation", col2X + 5, gridY + 18);
      }

      // Column 3 - Payment Mode
      doc.rect(col3X, gridY, 120, 25, "FD");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("PAYMENT MODE", col3X + 5, gridY + 8);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 255);
      doc.text("💻 " + receiptData.paymentMode, col3X + 5, gridY + 18);

      y = donationBoxY + donationBoxHeight + 15;

      // Amount section (prominent display)
      doc.setFillColor(255, 248, 220);
      doc.setDrawColor(255, 102, 0);
      doc.rect(50, y, pageWidth - 100, 35, "FD");

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const amountLabelWidth = doc.getTextWidth("Amount Donated");
      doc.text("Amount Donated", (pageWidth - amountLabelWidth) / 2, y + 12);

      doc.setFontSize(16);
      doc.setTextColor(255, 102, 0);
      const amountText = `₹${receiptData.amount.toLocaleString()}`;
      const amountWidth = doc.getTextWidth(amountText);
      doc.text(amountText, (pageWidth - amountWidth) / 2, y + 25);

      y += 45;

      // Amount in Words section (matching image style)
      const wordsBoxY = y;
      const wordsBoxHeight = 40;

      // Light background with dashed border
      doc.setFillColor(255, 250, 205);
      doc.rect(50, wordsBoxY, pageWidth - 100, wordsBoxHeight, "F");

      // Dashed border simulation
      doc.setDrawColor(255, 102, 0);
      doc.setLineWidth(1);
      doc.setLineDashPattern([3, 2], 0);
      doc.rect(50, wordsBoxY, pageWidth - 100, wordsBoxHeight);
      doc.setLineDashPattern([], 0); // Reset line pattern

      // Amount in Words header
      doc.setFontSize(12);
      doc.setTextColor(255, 102, 0);
      const wordsHeader = "Amount in Words";
      const wordsHeaderWidth = doc.getTextWidth(wordsHeader);
      doc.text(wordsHeader, (pageWidth - wordsHeaderWidth) / 2, wordsBoxY + 15);

      // English and Nepali amount in words
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const englishWords = `Rupees ${receiptData.amount.toLocaleString()} Only`;
      const englishWordsWidth = doc.getTextWidth(englishWords);
      doc.text(
        englishWords,
        (pageWidth - englishWordsWidth) / 2,
        wordsBoxY + 25
      );

      doc.setFontSize(11);
      const nepaliWords = `रुपैयाँ ${convertToNepaliWords(
        receiptData.amount
      )} मात्र`;
      const nepaliWordsWidth = doc.getTextWidth(nepaliWords);
      doc.text(nepaliWords, (pageWidth - nepaliWordsWidth) / 2, wordsBoxY + 35);

      y = wordsBoxY + wordsBoxHeight + 20;

      // Final separator line
      doc.setDrawColor(255, 102, 0);
      doc.setLineWidth(1);
      doc.line(50, y, pageWidth - 50, y);

      y += 30;

      // Signature section (bottom right)
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Authorized Signature", pageWidth - 130, y);

      // Signature line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - 130, y + 20, pageWidth - 50, y + 20);

      // Date
      doc.setFontSize(9);
      doc.text(
        `Date: ${new Date().toLocaleDateString()}`,
        pageWidth - 130,
        y + 30
      );

      // Convert to buffer
      const pdfOutput = doc.output("arraybuffer");
      const buffer = Buffer.from(pdfOutput);

      console.log("✅ PDF generated successfully with improved Nepali format");
      resolve(buffer);
    } catch (err) {
      console.error("❌ PDF generation failed:", err);
      reject(err);
    }
  });
}

// Helper function to convert numbers to Nepali words (simplified)
function convertToNepaliWords(amount: number): string {
  if (amount === 0) return "शून्य";

  const ones = ["", "एक", "दुई", "तीन", "चार", "पाँच", "छ", "सात", "आठ", "नौ"];
  const teens = [
    "दश",
    "एघार",
    "बाह्र",
    "तेह्र",
    "चौध",
    "पन्ध्र",
    "सोह्र",
    "सत्र",
    "अठार",
    "उन्नाइस",
  ];
  const tens = [
    "",
    "",
    "बीस",
    "तीस",
    "चालीस",
    "पचास",
    "साठी",
    "सत्तरी",
    "अस्सी",
    "नब्बे",
  ];

  if (amount < 10) return ones[amount];
  if (amount < 20) return teens[amount - 10];
  if (amount < 100) {
    const ten = Math.floor(amount / 10);
    const one = amount % 10;
    return tens[ten] + (one > 0 ? " " + ones[one] : "");
  }
  if (amount < 1000) {
    const hundred = Math.floor(amount / 100);
    const remainder = amount % 100;
    let result = ones[hundred] + " सय";
    if (remainder > 0) result += " " + convertToNepaliWords(remainder);
    return result;
  }
  if (amount < 100000) {
    const thousand = Math.floor(amount / 1000);
    const remainder = amount % 1000;
    let result = convertToNepaliWords(thousand) + " हजार";
    if (remainder > 0) result += " " + convertToNepaliWords(remainder);
    return result;
  }

  // For larger numbers, use simplified conversion
  return amount.toLocaleString() + " रुपैयाँ";
}

// Production-ready PDF generation
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
  console.log("🎭 Generating PDF with enhanced Nepali format...");

  try {
    const result = await generatePDFWithJSPDF({
      receiptNumber: receiptData.receiptNumber,
      donorName: receiptData.donorName,
      donorId: receiptData.donorId,
      amount: receiptData.amount,
      createdAt: receiptData.createdAt || new Date().toISOString(),
      donationType: receiptData.donationType,
      paymentMode: receiptData.paymentMode || "Offline",
      dateOfDonation: receiptData.dateOfDonation,
      startDate: receiptData.startDate,
      endDate: receiptData.endDate,
      startDateNepali: receiptData.startDateNepali,
      endDateNepali: receiptData.endDateNepali,
      notes: receiptData.notes,
      createdBy: receiptData.createdBy,
      includeLogos: receiptData.includeLogos,
    });
    console.log("✅ PDF generated successfully with Nepali formatting!");
    return result;
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`PDF generation failed: ${errorMessage}`);
  }
}

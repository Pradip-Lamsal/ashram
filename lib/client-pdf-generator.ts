import { formatDate } from "@/lib/utils";
import jsPDF from "jspdf";

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
}

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

// Helper function to convert numbers to Nepali words
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

export const generateClientSidePDF = (receipt: ReceiptData): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF("p", "pt", "a4");

      // Set font for better Nepali support
      // Note: Client-side font loading is complex, using helvetica as fallback
      // The server-side PDF generation will handle Nepali fonts properly
      doc.setFont("helvetica");

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 30;

      // Header layout with registration numbers (as shown in image)
      const headerStartY = y;

      // Left side registration numbers
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text("जि.प्र.का.ल.पु.द.नं. ४५४५/०६८", 50, headerStartY);
      doc.text("पान नं ६००५९५६९०", 50, headerStartY + 12);

      // Right side registration number
      doc.text("स.क.प.आवद्धता नं. ३५०९१", pageWidth - 150, headerStartY);

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
      const receiptText = `Receipt #${receipt.receiptNumber}`;
      const receiptTextWidth = doc.getTextWidth(receiptText);
      doc.text(receiptText, (pageWidth - receiptTextWidth) / 2, y + 18);

      // Issue date
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const issueDate = `Issued on ${formatDate(new Date(receipt.createdAt))}`;
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
      doc.text(receipt.donorName, leftColumnX + 50, y);

      if (receipt.donorId) {
        y += 12;
        doc.text("Donor ID:", leftColumnX, y);
        doc.text(receipt.donorId, leftColumnX + 50, y);
      }

      // Right Column - Receipt Details (reset y position)
      const rightColumnStartY = y - (receipt.donorId ? 27 : 15);
      doc.setFontSize(12);
      doc.setTextColor(74, 144, 226);
      doc.text("📄 Receipt Details", rightColumnX, rightColumnStartY);

      let rightY = rightColumnStartY + 15;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      // Format donation date (handle Seva Donation period)
      let donationDateText = "N/A";
      if (
        receipt.donationType === "Seva Donation" &&
        receipt.startDateNepali &&
        receipt.endDateNepali
      ) {
        donationDateText = `${receipt.startDateNepali} देखि ${receipt.endDateNepali} सम्म`;
      } else if (receipt.dateOfDonation) {
        donationDateText = formatDate(new Date(receipt.dateOfDonation));
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
        DONATION_TYPE_LABELS[receipt.donationType] || receipt.donationType;
      doc.text(nepaliDonationType, col1X + 5, gridY + 18);

      // Column 2 - Donation Period (if applicable)
      doc.rect(col2X, gridY, 150, 25, "FD");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("DONATION PERIOD", col2X + 5, gridY + 8);
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      if (
        receipt.donationType === "Seva Donation" &&
        receipt.startDateNepali &&
        receipt.endDateNepali
      ) {
        doc.text(`${receipt.startDateNepali} देखि`, col2X + 5, gridY + 15);
        doc.text(`${receipt.endDateNepali} सम्म`, col2X + 5, gridY + 22);
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
      doc.text("💻 " + receipt.paymentMode, col3X + 5, gridY + 18);

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
      const amountText = `₹${receipt.amount.toLocaleString()}`;
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
      const englishWords = `Rupees ${receipt.amount.toLocaleString()} Only`;
      const englishWordsWidth = doc.getTextWidth(englishWords);
      doc.text(
        englishWords,
        (pageWidth - englishWordsWidth) / 2,
        wordsBoxY + 25
      );

      doc.setFontSize(11);
      const nepaliWords = `रुपैयाँ ${convertToNepaliWords(
        receipt.amount
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

      // Save the PDF
      doc.save(`Receipt-${receipt.receiptNumber}.pdf`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

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
  return new Promise(async (resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF("p", "pt", "a4");

      // Set font for better Nepali support using Google Fonts loaded in layout
      // Use Times font which has better Unicode support for Devanagari script
      // The Google Fonts (Poppins, Noto Sans Devanagari) are loaded in layout
      // but jsPDF has limited client-side font support
      doc.setFont("times", "normal");

      // Enhanced character spacing for better Nepali text rendering
      doc.setCharSpace(1.0); // Increased spacing for better Nepali character display      // Page dimensions
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

      // Enhanced header rendering with complete Nepali content (OM + Sanskrit + Org name)
      y = headerStartY + 30;
      let imageRendered = false;

      try {
        const { renderNepaliHeaderAsImage, DEFAULT_NEPALI_HEADER_CONFIG } =
          await import("./nepali-text-renderer");
        const nepaliHeaderImage = await renderNepaliHeaderAsImage(
          DEFAULT_NEPALI_HEADER_CONFIG
        );

        if (nepaliHeaderImage) {
          // Calculate image dimensions for complete header
          const imageWidth = 350;
          const imageHeight = 100;
          const imageX = (pageWidth - imageWidth) / 2;

          // Add complete header image to PDF (OM + Sanskrit + Org name)
          doc.addImage(
            nepaliHeaderImage,
            "PNG",
            imageX,
            y,
            imageWidth,
            imageHeight
          );
          console.log(
            "✅ Complete Nepali header image embedded in client-side PDF"
          );
          y += imageHeight + 15;
          imageRendered = true;
        }
      } catch (error) {
        console.warn(
          "⚠️ Client-side image rendering failed, using text fallback:",
          error
        );
      }

      // Fallback to text rendering if image failed
      if (!imageRendered) {
        console.log("⚠️ Using text fallback for client-side header");

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

        // Organization name fallback text
        y += 22;
        doc.setFontSize(16);
        const orgText = "श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर";
        const orgWidth = doc.getTextWidth(orgText);
        doc.text(orgText, (pageWidth - orgWidth) / 2, y);

        y += 20;
        doc.setFontSize(14);
        doc.setTextColor(20, 20, 20);
        const subtitle = "व्यवस्थापन तथा सञ्चालन समिति";
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, (pageWidth - subtitleWidth) / 2, y);
        y += 10;
      }

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

      y += 18; // Increased header spacing
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Name:", leftColumnX, y);
      doc.text(receipt.donorName, leftColumnX + 55, y); // Increased label spacing

      if (receipt.donorId) {
        y += 15; // Increased row spacing
        doc.text("Donor ID:", leftColumnX, y);
        doc.text(receipt.donorId, leftColumnX + 55, y); // Increased label spacing
      }

      // Right Column - Receipt Details (reset y position with improved spacing)
      const rightColumnStartY = y - (receipt.donorId ? 30 : 18); // Adjusted for new spacing
      doc.setFontSize(12);
      doc.setTextColor(74, 144, 226);
      doc.text("📄 Receipt Details", rightColumnX, rightColumnStartY);

      let rightY = rightColumnStartY + 18; // Increased header spacing
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      // Format donation date (handle Seva Donation period) - matches ReceiptModal logic
      let donationDateText = "N/A";
      if (receipt.donationType === "Seva Donation") {
        // If we have Nepali date strings, use them directly (more accurate)
        if (receipt.startDateNepali && receipt.endDateNepali) {
          donationDateText = `${receipt.startDateNepali} - ${receipt.endDateNepali}`;
        }
        // Fallback to converting English dates to Nepali
        else if (receipt.startDate && receipt.endDate) {
          const startDate = formatDate(new Date(receipt.startDate));
          const endDate = formatDate(new Date(receipt.endDate));
          donationDateText = `${startDate} - ${endDate}`;
        }
      }
      // For regular donations, show the donation date
      else if (receipt.dateOfDonation) {
        donationDateText = formatDate(new Date(receipt.dateOfDonation));
      }

      doc.text("Donation Date:", rightColumnX, rightY);
      // Improved spacing and line breaks for long dates
      const maxDateWidth = 160; // Maximum width for date text
      const dateLines = doc.splitTextToSize(donationDateText, maxDateWidth);
      if (dateLines.length > 1) {
        // Multi-line date (for Seva Donation ranges)
        doc.text(dateLines[0], rightColumnX + 80, rightY);
        doc.text(dateLines[1] || "", rightColumnX + 80, rightY + 10);
        rightY += 10; // Extra space for multi-line
      } else {
        // Single line date
        doc.text(donationDateText, rightColumnX + 80, rightY);
      }

      rightY += 15; // Increased spacing
      doc.text("Issued By:", rightColumnX, rightY);
      doc.text("System", rightColumnX + 80, rightY);

      // Move y to after both columns
      y = Math.max(y + 12, rightY + 20);

      // Donation Information Box (matching image style)
      const donationBoxY = y;
      const donationBoxHeight = 70;

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

      // Two column grid inside donation box (removed donation period)
      const col1X = 100;
      const col2X = 350;
      const gridY = donationBoxY + 25;

      // Column 1 - Donation Type
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(200, 200, 200);
      doc.rect(col1X, gridY, 180, 25, "FD");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("DONATION TYPE", col1X + 5, gridY + 8);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const nepaliDonationType =
        DONATION_TYPE_LABELS[receipt.donationType] || receipt.donationType;
      doc.text(nepaliDonationType, col1X + 5, gridY + 18);

      // Column 2 - Payment Mode
      doc.rect(col2X, gridY, 180, 25, "FD");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("PAYMENT MODE", col2X + 5, gridY + 8);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 255);
      doc.text("💻 " + receipt.paymentMode, col2X + 5, gridY + 18);

      y = donationBoxY + donationBoxHeight + 25;

      // Enhanced Amount section with premium styling
      const amountBoxHeight = 50;
      const amountMargin = 40;

      // Gradient background effect
      doc.setFillColor(255, 245, 215); // Light golden
      doc.roundedRect(
        amountMargin,
        y,
        pageWidth - amountMargin * 2,
        amountBoxHeight,
        10,
        10,
        "F"
      );

      // Inner shadow effect
      doc.setFillColor(250, 235, 195);
      doc.roundedRect(
        amountMargin + 3,
        y + 3,
        pageWidth - amountMargin * 2 - 6,
        amountBoxHeight - 6,
        8,
        8,
        "F"
      );

      // Premium border
      doc.setDrawColor(200, 130, 50);
      doc.setLineWidth(1);
      doc.roundedRect(
        amountMargin + 4,
        y + 4,
        pageWidth - amountMargin * 2 - 8,
        amountBoxHeight - 8,
        8,
        8,
        "FD"
      );

      // Amount label
      doc.setFontSize(10);
      doc.setTextColor(120, 80, 0); // Dark golden
      const amountLabelWidth = doc.getTextWidth("Amount Donated");
      doc.text("Amount Donated", (pageWidth - amountLabelWidth) / 2, y + 16);

      // Main amount - larger and more prominent
      doc.setFontSize(20);
      doc.setTextColor(180, 80, 0); // Rich orange
      const amountText = `रु ${receipt.amount.toLocaleString()}`;
      const amountWidth = doc.getTextWidth(amountText);
      doc.text(amountText, (pageWidth - amountWidth) / 2, y + 32);

      y += 55;

      // Amount in Words section - Enhanced Premium Style
      const wordsBoxY = y;
      const wordsBoxHeight = 55;
      const wordsBoxMargin = 35;

      // Gradient-like layered background
      doc.setFillColor(245, 225, 180); // Light golden background
      doc.roundedRect(
        wordsBoxMargin,
        wordsBoxY,
        pageWidth - wordsBoxMargin * 2,
        wordsBoxHeight,
        12,
        12,
        "F"
      );

      // Inner shadow effect with darker border
      doc.setFillColor(240, 215, 165);
      doc.roundedRect(
        wordsBoxMargin + 2,
        wordsBoxY + 2,
        pageWidth - wordsBoxMargin * 2 - 4,
        wordsBoxHeight - 4,
        10,
        10,
        "F"
      );

      // Premium border with rounded corners
      doc.setDrawColor(200, 140, 60); // Rich golden border
      doc.setLineWidth(1.5);
      doc.roundedRect(
        wordsBoxMargin,
        wordsBoxY,
        pageWidth - wordsBoxMargin * 2,
        wordsBoxHeight,
        12,
        12,
        "S"
      );

      // Subtle dashed accent border inside
      doc.setDrawColor(220, 165, 85);
      doc.setLineWidth(0.8);
      doc.setLineDashPattern([4, 3], 0);
      doc.roundedRect(
        wordsBoxMargin + 8,
        wordsBoxY + 6,
        pageWidth - wordsBoxMargin * 2 - 16,
        wordsBoxHeight - 12,
        6,
        6,
        "S"
      );
      doc.setLineDashPattern([], 0); // Reset line pattern

      // Amount in Words header - Enhanced
      doc.setFontSize(11);
      doc.setTextColor(160, 100, 20); // Rich golden brown
      const wordsHeader = "Amount in Words";
      const wordsHeaderWidth = doc.getTextWidth(wordsHeader);
      doc.text(wordsHeader, (pageWidth - wordsHeaderWidth) / 2, wordsBoxY + 18);

      // English amount in words - Enhanced styling
      doc.setFontSize(10);
      doc.setTextColor(80, 60, 40); // Dark brown for better readability
      const englishWords = `Rupees ${receipt.amount.toLocaleString()} Only`;
      const englishWordsWidth = doc.getTextWidth(englishWords);
      doc.text(
        englishWords,
        (pageWidth - englishWordsWidth) / 2,
        wordsBoxY + 30
      );

      // Nepali amount in words - Enhanced with better contrast
      doc.setFontSize(11);
      doc.setTextColor(100, 70, 30); // Warm brown for Nepali text
      const nepaliWords = `रुपैयाँ ${convertToNepaliWords(
        receipt.amount
      )} मात्र`;
      const nepaliWordsWidth = doc.getTextWidth(nepaliWords);
      doc.text(nepaliWords, (pageWidth - nepaliWordsWidth) / 2, wordsBoxY + 40);

      y = wordsBoxY + wordsBoxHeight + 35;

      // Enhanced final separator with gradient effect
      doc.setDrawColor(255, 140, 60); // Lighter orange
      doc.setLineWidth(2);
      doc.line(60, y, pageWidth - 60, y);

      // Shadow line below
      doc.setDrawColor(220, 120, 40);
      doc.setLineWidth(0.8);
      doc.line(60, y + 1, pageWidth - 60, y + 1);

      // Decorative dots at ends
      doc.setFillColor(255, 102, 0);
      doc.circle(60, y, 2, "F");
      doc.circle(pageWidth - 60, y, 2, "F");

      y += 35;

      // Enhanced Signature section with professional styling
      const signatureBoxWidth = 140;
      const signatureBoxHeight = 50;
      const signatureX = pageWidth - signatureBoxWidth - 30;

      // Subtle background for signature area
      doc.setFillColor(248, 248, 250); // Very light gray
      doc.roundedRect(
        signatureX - 5,
        y - 5,
        signatureBoxWidth + 10,
        signatureBoxHeight,
        8,
        8,
        "F"
      );

      // Border for signature area
      doc.setDrawColor(200, 200, 210);
      doc.setLineWidth(1);
      doc.roundedRect(
        signatureX - 5,
        y - 5,
        signatureBoxWidth + 10,
        signatureBoxHeight,
        8,
        8,
        "S"
      );

      // Signature label with enhanced styling
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 100); // Professional gray-blue
      doc.text("Authorized Signature", signatureX, y + 10);

      // Premium signature line with gradient effect
      doc.setDrawColor(120, 120, 140);
      doc.setLineWidth(1.2);
      doc.line(signatureX, y + 25, signatureX + signatureBoxWidth - 15, y + 25);

      // Accent line above signature
      doc.setDrawColor(180, 180, 190);
      doc.setLineWidth(0.5);
      doc.line(signatureX, y + 24, signatureX + signatureBoxWidth - 15, y + 24);

      // Enhanced date with better positioning
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 120);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, signatureX, y + 37);

      // Save the PDF
      doc.save(`Receipt-${receipt.receiptNumber}.pdf`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

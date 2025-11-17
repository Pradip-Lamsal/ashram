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
  return new Promise(async (resolve, reject) => {
    try {
      console.log(
        "🚀 Starting jsPDF generation with improved Nepali format..."
      );

      const doc = new jsPDF("p", "pt", "a4");

      // Load Google Fonts for better Unicode support
      try {
        // Try to load local font first, then fallback to enhanced Times font
        const fontBase64 = getFontAsBase64();
        if (fontBase64) {
          // Add the font file to jsPDF virtual file system
          doc.addFileToVFS("NotoSansDevanagari.ttf", fontBase64);

          // Register the font with jsPDF
          doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");

          // Set as active font
          doc.setFont("NotoSansDevanagari", "normal");

          // Enhanced character spacing for better Nepali rendering
          doc.setCharSpace(0.8); // Increased spacing for clarity
          doc.setR2L(false); // Ensure left-to-right text direction

          console.log(
            "✅ Nepali font loaded successfully with enhanced spacing"
          );
        } else {
          console.log(
            "⚠️ Local Nepali font not found, using enhanced Times font for better Unicode support"
          );
          // Use Times for better Unicode support than Helvetica
          // Times has better Unicode character coverage for Devanagari
          doc.setFont("times", "normal");
          doc.setCharSpace(1.0); // More spacing for fallback font
        }
      } catch (error) {
        console.warn("Failed to load fonts:", error);
        // Enhanced fallback to Times font which has better Unicode support
        doc.setFont("times", "normal");
        doc.setCharSpace(1.0);
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
          console.log("✅ Nepali header image embedded in PDF");
          y += imageHeight + 15;
          imageRendered = true;
        }
      } catch (error) {
        console.warn(
          "⚠️ Server-side image rendering failed, using text fallback:",
          error
        );
      }

      // Fallback to text rendering if image failed
      if (!imageRendered) {
        console.log("⚠️ Using enhanced text fallback for server-side header");

        // Sacred OM symbol (centered) - Enhanced with subtle background
        doc.setFillColor(255, 248, 230); // Very light orange background
        doc.circle(pageWidth / 2, y + 5, 15, "F");
        doc.setFontSize(20);
        doc.setTextColor(220, 85, 0); // Deeper orange color
        const omText = "ॐ";
        const omWidth = doc.getTextWidth(omText);
        doc.text(omText, (pageWidth - omWidth) / 2, y + 8);

        // Main header - श्रीराधासर्वेश्वरो विजयते (centered) - Enhanced typography
        y += 25;
        doc.setFontSize(11);
        doc.setTextColor(180, 50, 0); // Rich orange-red
        const headerText = "श्रीराधासर्वेश्वरो विजयते";
        const headerWidth = doc.getTextWidth(headerText);
        doc.text(headerText, (pageWidth - headerWidth) / 2, y);

        // Organization name fallback text
        y += 25;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        const mainTitle = "श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर";
        const mainTitleWidth = doc.getTextWidth(mainTitle);
        doc.text(mainTitle, (pageWidth - mainTitleWidth) / 2, y);

        y += 22;
        doc.setFontSize(14);
        doc.setTextColor(20, 20, 20);
        const subtitle = "व्यवस्थापन तथा सञ्चालन समिति";
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, (pageWidth - subtitleWidth) / 2, y);
        y += 10;
      }

      // Address (centered) - Better hierarchy
      y += 20;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Lighter gray
      const address = "ललितपुर म.न.पा.-९, शङ्खमूल, ललितपुर";
      const addressWidth = doc.getTextWidth(address);
      doc.text(address, (pageWidth - addressWidth) / 2, y);

      // Phone number (centered) - Consistent styling
      y += 14;
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      const phone = "फोन नं. ०१-५९१५६६७";
      const phoneWidth = doc.getTextWidth(phone);
      doc.text(phone, (pageWidth - phoneWidth) / 2, y);

      // Email (centered, blue color) - Enhanced blue
      y += 14;
      doc.setTextColor(20, 100, 180); // Professional blue
      doc.setFontSize(9);
      const email = "E-mail: jashankhamul@gmail.com";
      const emailWidth = doc.getTextWidth(email);
      doc.text(email, (pageWidth - emailWidth) / 2, y);

      // Receipt number box (centered) - Enhanced with gradient-like effect and shadow
      y += 28;
      const receiptBoxWidth = 220;
      const receiptBoxHeight = 35;
      const receiptBoxX = (pageWidth - receiptBoxWidth) / 2;

      // Shadow effect
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(
        receiptBoxX + 2,
        y + 2,
        receiptBoxWidth,
        receiptBoxHeight,
        3,
        3,
        "F"
      );

      // Main box with gradient-like effect
      doc.setFillColor(255, 250, 240); // Light cream background
      doc.setDrawColor(220, 85, 0); // Deep orange border
      doc.setLineWidth(2);
      doc.roundedRect(
        receiptBoxX,
        y,
        receiptBoxWidth,
        receiptBoxHeight,
        4,
        4,
        "FD"
      );

      // Inner subtle border
      doc.setDrawColor(255, 200, 150); // Light orange
      doc.setLineWidth(0.5);
      doc.roundedRect(
        receiptBoxX + 1,
        y + 1,
        receiptBoxWidth - 2,
        receiptBoxHeight - 2,
        3,
        3,
        "D"
      );

      // Receipt number text - Enhanced typography
      doc.setFontSize(14);
      doc.setTextColor(180, 50, 0); // Rich orange-red
      const receiptText = `Receipt #${receiptData.receiptNumber}`;
      const receiptTextWidth = doc.getTextWidth(receiptText);
      doc.text(receiptText, (pageWidth - receiptTextWidth) / 2, y + 20);

      // Issue date - Better positioning and styling
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const issueDate = `Issued on ${new Date(
        receiptData.createdAt
      ).toLocaleDateString()}`;
      const issueDateWidth = doc.getTextWidth(issueDate);
      doc.text(issueDate, (pageWidth - issueDateWidth) / 2, y + 30);

      // Horizontal line separator
      y += 45;
      doc.setDrawColor(255, 102, 0);
      doc.setLineWidth(1);
      doc.line(50, y, pageWidth - 50, y);

      y += 20;

      // Two column layout for donor and receipt info (matching image layout)
      const leftColumnX = 50;
      const rightColumnX = 320;

      // Left Column - Donor Information - Enhanced card design
      const cardPadding = 8;
      const cardHeight = receiptData.donorId ? 45 : 35;

      // Donor info card background
      doc.setFillColor(248, 250, 255); // Very light blue
      doc.setDrawColor(180, 200, 230); // Light blue border
      doc.setLineWidth(1);
      doc.roundedRect(
        leftColumnX - cardPadding,
        y - 5,
        250,
        cardHeight,
        3,
        3,
        "FD"
      );

      // Header with icon styling
      doc.setFontSize(11);
      doc.setTextColor(60, 120, 200); // Professional blue
      doc.text("👤 Donor Information", leftColumnX, y + 5);

      y += 18;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Name:", leftColumnX, y);
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text(receiptData.donorName, leftColumnX + 45, y);

      if (receiptData.donorId) {
        y += 13;
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text("Donor ID:", leftColumnX, y);
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(receiptData.donorId, leftColumnX + 45, y);
      }

      // Right Column - Receipt Details - Enhanced card design
      const rightColumnStartY = y - (receiptData.donorId ? 31 : 18);

      // Receipt details card background
      doc.setFillColor(252, 248, 255); // Very light purple
      doc.setDrawColor(200, 180, 230); // Light purple border
      doc.setLineWidth(1);
      doc.roundedRect(
        rightColumnX - cardPadding,
        rightColumnStartY - 5,
        250,
        cardHeight,
        3,
        3,
        "FD"
      );

      // Header with icon styling
      doc.setFontSize(11);
      doc.setTextColor(120, 60, 200); // Professional purple
      doc.text("📄 Receipt Details", rightColumnX, rightColumnStartY + 5);

      let rightY = rightColumnStartY + 18;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);

      // Format donation date (handle Seva Donation period) - matches ReceiptModal logic
      let donationDateText = "N/A";
      if (receiptData.donationType === "Seva Donation") {
        // If we have Nepali date strings, use them directly (more accurate)
        if (receiptData.startDateNepali && receiptData.endDateNepali) {
          donationDateText = `${receiptData.startDateNepali} - ${receiptData.endDateNepali}`;
        }
        // Fallback to converting English dates to Nepali
        else if (receiptData.startDate && receiptData.endDate) {
          const startDate = new Date(
            receiptData.startDate
          ).toLocaleDateString();
          const endDate = new Date(receiptData.endDate).toLocaleDateString();
          donationDateText = `${startDate} - ${endDate}`;
        }
      }
      // For regular donations, show the donation date
      else if (receiptData.dateOfDonation) {
        donationDateText = new Date(
          receiptData.dateOfDonation
        ).toLocaleDateString();
      }

      doc.text("Donation Date:", rightColumnX, rightY);
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text(donationDateText, rightColumnX + 65, rightY);

      rightY += 13;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Issued By:", rightColumnX, rightY);
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text("System", rightColumnX + 65, rightY);

      // Move y to after both columns
      y = Math.max(y + 12, rightY + 20);

      // Donation Information Box - Premium design with enhanced visual hierarchy
      const donationBoxY = y;
      const donationBoxHeight = 85;
      const boxMargin = 40;

      // Subtle shadow effect
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(
        boxMargin + 2,
        donationBoxY + 2,
        pageWidth - boxMargin * 2,
        donationBoxHeight,
        6,
        6,
        "F"
      );

      // Main donation box with gradient-like layering
      doc.setFillColor(255, 252, 245); // Warm cream
      doc.setDrawColor(220, 85, 0);
      doc.setLineWidth(2);
      doc.roundedRect(
        boxMargin,
        donationBoxY,
        pageWidth - boxMargin * 2,
        donationBoxHeight,
        8,
        8,
        "FD"
      );

      // Inner accent border
      doc.setFillColor(255, 248, 235); // Lighter cream
      doc.setDrawColor(255, 180, 100);
      doc.setLineWidth(1);
      doc.roundedRect(
        boxMargin + 3,
        donationBoxY + 3,
        pageWidth - boxMargin * 2 - 6,
        donationBoxHeight - 6,
        6,
        6,
        "FD"
      );

      // Header section with enhanced typography
      doc.setFontSize(14);
      doc.setTextColor(180, 50, 0);
      const donationHeader = "🎁 Donation Information";
      const donationHeaderWidth = doc.getTextWidth(donationHeader);
      doc.text(
        donationHeader,
        (pageWidth - donationHeaderWidth) / 2,
        donationBoxY + 18
      );

      // Subtle underline for header
      const underlineY = donationBoxY + 22;
      doc.setDrawColor(255, 180, 100);
      doc.setLineWidth(1);
      doc.line(
        (pageWidth - donationHeaderWidth) / 2,
        underlineY,
        (pageWidth + donationHeaderWidth) / 2,
        underlineY
      );

      // Two column grid with enhanced card design (removed donation period)
      const col1X = 100;
      const col2X = 350;
      const gridY = donationBoxY + 40;
      const gridCardWidth = 180;
      const gridCardHeight = 38;

      // Column 1 - Donation Type - Enhanced card
      doc.setFillColor(250, 248, 255); // Very light purple
      doc.setDrawColor(180, 160, 220);
      doc.setLineWidth(1);
      doc.roundedRect(col1X, gridY, gridCardWidth, gridCardHeight, 4, 4, "FD");

      doc.setFontSize(7);
      doc.setTextColor(120, 100, 160);
      doc.text("DONATION TYPE", col1X + 6, gridY + 9);
      doc.setFontSize(11);
      doc.setTextColor(60, 40, 100);
      const nepaliDonationType =
        DONATION_TYPE_LABELS[receiptData.donationType] ||
        receiptData.donationType;
      doc.text(nepaliDonationType, col1X + 6, gridY + 22);

      // Column 2 - Payment Mode - Enhanced card
      doc.setFillColor(255, 248, 250); // Very light pink
      doc.setDrawColor(220, 160, 180);
      doc.setLineWidth(1);
      doc.roundedRect(col2X, gridY, gridCardWidth, gridCardHeight, 4, 4, "FD");

      doc.setFontSize(7);
      doc.setTextColor(160, 100, 120);
      doc.text("PAYMENT MODE", col2X + 6, gridY + 9);
      doc.setFontSize(11);
      doc.setTextColor(30, 100, 180);
      doc.text("💻 " + receiptData.paymentMode, col2X + 6, gridY + 22);

      y = donationBoxY + donationBoxHeight + 28;

      // Amount section - Premium highlight design
      const amountBoxHeight = 55;
      const amountMargin = 35;

      // Shadow effect for amount box
      doc.setFillColor(235, 235, 235);
      doc.roundedRect(
        amountMargin + 3,
        y + 3,
        pageWidth - amountMargin * 2,
        amountBoxHeight,
        8,
        8,
        "F"
      );

      // Main amount box with enhanced styling
      doc.setFillColor(255, 250, 240); // Warm cream
      doc.setDrawColor(200, 120, 0); // Golden orange
      doc.setLineWidth(2);
      doc.roundedRect(
        amountMargin,
        y,
        pageWidth - amountMargin * 2,
        amountBoxHeight,
        10,
        10,
        "FD"
      );

      // Inner glow effect
      doc.setFillColor(255, 245, 225); // Lighter cream
      doc.setDrawColor(255, 200, 100); // Light golden
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
      doc.text("Amount Donated", (pageWidth - amountLabelWidth) / 2, y + 20);

      // Main amount - larger and more prominent
      doc.setFontSize(20);
      doc.setTextColor(180, 80, 0); // Rich orange
      const amountText = `रु ${receiptData.amount.toLocaleString()}`;
      const amountWidth = doc.getTextWidth(amountText);
      doc.text(amountText, (pageWidth - amountWidth) / 2, y + 38);
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
      doc.text(wordsHeader, (pageWidth - wordsHeaderWidth) / 2, wordsBoxY + 22);

      // English amount in words - Enhanced styling
      doc.setFontSize(10);
      doc.setTextColor(80, 60, 40); // Dark brown for better readability
      const englishWords = `Rupees ${receiptData.amount.toLocaleString()} Only`;
      const englishWordsWidth = doc.getTextWidth(englishWords);
      doc.text(
        englishWords,
        (pageWidth - englishWordsWidth) / 2,
        wordsBoxY + 36
      );

      // Nepali amount in words - Enhanced with better contrast
      doc.setFontSize(11);
      doc.setTextColor(100, 70, 30); // Warm brown for Nepali text
      const nepaliWords = `रुपैयाँ ${convertToNepaliWords(
        receiptData.amount
      )} मात्र`;
      const nepaliWordsWidth = doc.getTextWidth(nepaliWords);
      doc.text(nepaliWords, (pageWidth - nepaliWordsWidth) / 2, wordsBoxY + 46);

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

      y += 45;

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

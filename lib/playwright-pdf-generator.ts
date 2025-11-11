import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";
import { Browser, Page } from "playwright";
import playwright from "playwright-core";
import { getDonationTypeLabel } from "./donation-labels";
import { englishToNepaliDateFormatted } from "./nepali-date-utils";

// Smart browser launch detection for local vs actual serverless environments
const launchBrowser = async () => {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";
  const isServerless =
    isVercel || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;

  console.log("🔍 Environment detection:", {
    NODE_ENV: process.env.NODE_ENV,
    isProduction,
    VERCEL: process.env.VERCEL,
    isVercel,
    AWS_LAMBDA: process.env.AWS_LAMBDA_FUNCTION_NAME,
    NETLIFY: process.env.NETLIFY,
    isServerless,
  });

  if (isServerless) {
    console.log(
      "🏭 Launching serverless-optimized Chromium for actual serverless environment"
    );

    // Use @sparticuz/chromium for actual serverless environments
    return await playwright.chromium.launch({
      args: [
        ...chromium.args,
        "--font-render-hinting=none",
        "--enable-font-antialiasing",
        "--force-color-profile=srgb",
        "--lang=en-US,ne-NP",
        "--disable-font-subpixel-positioning",
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    console.log(
      `🛠️ Launching local Playwright Chromium (NODE_ENV: ${
        isProduction ? "production" : "development"
      })`
    );

    // Use local Playwright for both development and local production testing
    return await playwright.chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--enable-font-antialiasing",
        "--force-color-profile=srgb",
        "--lang=en-US,ne-NP",
        "--disable-font-subpixel-positioning",
        "--font-render-hinting=none",
        "--enable-webgl",
        "--enable-accelerated-2d-canvas",
      ],
    });
  }
};

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

export async function generateReceiptPDFWithPlaywright(receiptData: {
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
  // Environment detection for debugging
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";

  console.log(
    `🌍 Environment: ${isProduction ? "Production" : "Development"} ${
      isVercel ? "(Vercel)" : "(Local)"
    }`
  );
  console.log(`📁 Working directory: ${process.cwd()}`);
  console.log(
    "🎭 Starting Playwright PDF generation for:",
    receiptData.receiptNumber
  );

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return englishToNepaliDateFormatted(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const formatDonationDateForPDF = () => {
    if (receiptData.donationType === "Seva Donation") {
      if (receiptData.startDateNepali && receiptData.endDateNepali) {
        return `${receiptData.startDateNepali} देखि ${receiptData.endDateNepali} सम्म`;
      }
      if (receiptData.startDate && receiptData.endDate) {
        const startNepali = englishToNepaliDateFormatted(
          new Date(receiptData.startDate)
        );
        const endNepali = englishToNepaliDateFormatted(
          new Date(receiptData.endDate)
        );
        return `${startNepali} देखि ${endNepali} सम्म`;
      }
    }
    if (receiptData.dateOfDonation) {
      return englishToNepaliDateFormatted(new Date(receiptData.dateOfDonation));
    }
    return "N/A";
  };

  const formatCurrency = (amount: number) => {
    return `रु ${new Intl.NumberFormat("en-IN").format(amount)}`;
  };

  // Enhanced Nepali number conversion
  const convertToNepaliWords = (amount: number): string => {
    const ones = [
      "",
      "एक",
      "दुई",
      "तीन",
      "चार",
      "पाँच",
      "छ",
      "सात",
      "आठ",
      "नौ",
    ];
    const teens = [
      "दस",
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
    const hundreds = [
      "",
      "एक सय",
      "दुई सय",
      "तीन सय",
      "चार सय",
      "पाँच सय",
      "छ सय",
      "सात सय",
      "आठ सय",
      "नौ सय",
    ];

    if (amount === 0) return "शून्य";
    if (amount < 0) return "ऋणात्मक " + convertToNepaliWords(-amount);

    let words = "";

    if (amount >= 10000000) {
      const crores = Math.floor(amount / 10000000);
      words += convertToNepaliWords(crores) + " करोड ";
      amount %= 10000000;
    }

    if (amount >= 100000) {
      const lakhs = Math.floor(amount / 100000);
      words += convertToNepaliWords(lakhs) + " लाख ";
      amount %= 100000;
    }

    if (amount >= 1000) {
      const thousands = Math.floor(amount / 1000);
      words += convertToNepaliWords(thousands) + " हजार ";
      amount %= 1000;
    }

    if (amount >= 100) {
      const hundredDigit = Math.floor(amount / 100);
      words += hundreds[hundredDigit] + " ";
      amount %= 100;
    }

    if (amount >= 20) {
      const tensDigit = Math.floor(amount / 10);
      const onesDigit = amount % 10;
      words += tens[tensDigit];
      if (onesDigit > 0) {
        words += " " + ones[onesDigit];
      }
    } else if (amount >= 10) {
      words += teens[amount - 10];
    } else if (amount > 0) {
      words += ones[amount];
    }

    return words.trim();
  };

  // Enhanced logo loading with better error handling and debugging
  const getDataUrl = (filename: string) => {
    try {
      const imgPath = path.resolve(process.cwd(), "public", filename);
      console.log(`📸 Loading image from: ${imgPath}`);

      // Check if file exists
      if (!fs.existsSync(imgPath)) {
        console.error(`❌ Image file not found: ${imgPath}`);
        // List available files for debugging
        const publicDir = path.resolve(process.cwd(), "public");
        try {
          const files = fs.readdirSync(publicDir);
          console.log(`📁 Available files in public/: ${files.join(", ")}`);
        } catch {
          console.error("Could not read public directory");
        }
        return "";
      }

      const data = fs.readFileSync(imgPath);
      const ext = path.extname(imgPath).slice(1).toLowerCase();

      // Validate image extension
      const validExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      if (!validExtensions.includes(ext)) {
        console.warn(`⚠️ Unsupported image format: ${ext}`);
        return "";
      }

      const base64Data = data.toString("base64");
      const dataUrl = `data:image/${ext};base64,${base64Data}`;

      console.log(
        `✅ Image loaded successfully: ${filename} (${Math.round(
          base64Data.length / 1024
        )}KB)`
      );
      return dataUrl;
    } catch (err) {
      console.error(`❌ Failed to load image ${filename}:`, err);
      return "";
    }
  };

  const includeLogos = receiptData?.includeLogos ?? true;
  const logoLeft = includeLogos ? getDataUrl("logo11.jpeg") : "";
  const logoRight = includeLogos ? getDataUrl("logo22.jpeg") : "";

  // Comprehensive font embedding with ALL possible formats
  const getEmbeddedFontCss = () => {
    const fontPaths = [
      path.resolve(
        process.cwd(),
        "public/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf"
      ),
      path.resolve(process.cwd(), "public/noto-devanagari.ttf"),
      path.resolve(process.cwd(), "public/fonts/noto-devanagari.ttf"),
    ];

    console.log("🔍 Searching for font files...");
    console.log(`Working directory: ${process.cwd()}`);

    for (const fontPath of fontPaths) {
      try {
        console.log(`Checking font path: ${fontPath}`);

        if (fs.existsSync(fontPath)) {
          const fontData = fs.readFileSync(fontPath);
          const fontBase64 = fontData.toString("base64");

          console.log(
            `✅ Font embedded successfully from ${fontPath} (${Math.round(
              fontBase64.length / 1024
            )}KB)`
          );

          // Create multiple @font-face declarations for better compatibility
          return `
            @font-face {
              font-family: 'NotoSansDevanagariEmbedded';
              src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
              font-weight: normal;
              font-style: normal;
              font-display: block;
            }
            @font-face {
              font-family: 'NotoDevanagari';
              src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
              font-weight: 100 900;
              font-style: normal;
              font-display: block;
            }
            @font-face {
              font-family: 'DevanagariFont';
              src: url(data:application/x-font-ttf;base64,${fontBase64}) format('truetype');
              font-weight: normal;
              font-style: normal;
              font-display: block;
            }
          `;
        } else {
          console.log(`❌ Font not found at: ${fontPath}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load font from ${fontPath}:`, error);
      }
    }

    console.warn("⚠️ No font files found, relying on web fonts only");
    return "";
  };

  const embeddedFontCss = getEmbeddedFontCss();

  const webFontCss = `
    @charset "UTF-8";
    
    ${embeddedFontCss}
    
    /* Primary: Google Fonts CDN for reliable access */
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=block');
    
    /* Tertiary: System font fallbacks */
    @font-face {
      font-family: 'DevanagariUnicode';
      src: local('Noto Sans Devanagari'), local('NotoSansDevanagari-Regular'),
           local('Mangal'), local('Devanagari Sangam MN'), local('Sanskrit Text');
      unicode-range: U+0900-097F, U+1CD0-1CFF, U+A8E0-A8FF;
    }
    
    /* Aggressive embedded font loading - multiple attempts */
    * {
      font-family: 'NotoSansDevanagariEmbedded', 'NotoDevanagari', 'DevanagariFont', 'Noto Sans Devanagari', 'Mangal', 'Devanagari Sangam MN', Arial, sans-serif !important;
    }
    
    body, h1, h2, h3, h4, h5, h6, p, div, span {
      font-family: 'NotoSansDevanagariEmbedded', 'NotoDevanagari', 'DevanagariFont', 'Noto Sans Devanagari', 'Mangal', 'Devanagari Sangam MN', Arial, sans-serif !important;
      -webkit-font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
      font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-variant-ligatures: common-ligatures;
    }
    
    /* Force Nepali font on all Nepali content */
    .nepali-text, .header-center, .header-center *, [class*="nepali"] {
      font-family: 'NotoSansDevanagariEmbedded', 'NotoDevanagari', 'DevanagariFont' !important;
      unicode-bidi: normal;
      direction: ltr;
      font-variant-ligatures: common-ligatures;
      font-kerning: normal;
      font-weight: 400;
      font-size: inherit;
    }
    
    /* Specific targeting for common Devanagari Unicode ranges */
    *:lang(ne), *[lang="ne"], *[dir="ltr"] {
      font-family: 'NotoSansDevanagariEmbedded', 'NotoDevanagari', 'DevanagariFont' !important;
    }
  `;

  // Create receipt object
  const receipt = {
    receiptNumber: receiptData.receiptNumber,
    donorName: receiptData.donorName,
    amount: receiptData.amount,
    donationType: receiptData.donationType,
    donorId: receiptData.donorId || "",
    createdAt: receiptData.donationDate || new Date().toISOString(),
    createdBy: receiptData.receivedBy || "System",
    paymentMode: "Cash",
    notes: receiptData.notes || "",
    dateOfDonation: receiptData.donationDate,
    startDate: receiptData.startDate,
    endDate: receiptData.endDate,
    startDateNepali: receiptData.startDateNepali,
    endDateNepali: receiptData.endDateNepali,
  };

  // Enhanced HTML template with better font loading
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ne" dir="ltr">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt ${receipt.receiptNumber}</title>
        <style>
          /* Production-ready web fonts for consistent rendering */
          ${webFontCss}

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Noto Sans Devanagari', 'Mangal', 'Devanagari Sangam MN', 'Sanskrit Text', 'Kokila', Arial, sans-serif;
            line-height: 1.4;
            color: #374151;
            background-color: white;
            padding: 15px;
            font-size: 12px;
            text-rendering: optimizeLegibility;
          }
          
          .receipt-container {
            max-width: 100%;
            margin: 0 auto;
            background-color: white;
          }

          .header {
            border-bottom: 2px solid #ea580c;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          
          .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }
          
          .header-left, .header-center, .header-right {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .header-left { flex: 0 0 140px; flex-direction: column; align-items: flex-start; }
          .header-center { flex: 1 1 auto; flex-direction: column; align-items: center; text-align: center; }
          .header-right { flex: 0 0 140px; flex-direction: column; align-items: flex-end; }

          .pan, .reg {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 4px;
            font-weight: 600;
          }

          .logo { width: 50px; height: 50px; object-fit: contain; border-radius: 4px; }

          .header-center h1 {
            color: #ea580c;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 4px;
            display: block;
          }
          
          .header .subtitle {
            color: #dc2626;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .receipt-number {
            background: linear-gradient(135deg, #fef3c7, #fed7aa);
            border: 2px solid #ea580c;
            border-radius: 6px;
            padding: 8px 15px;
            display: inline-block;
          }
          
          .receipt-number .number {
            font-size: 16px;
            font-weight: bold;
            color: #ea580c;
            margin-bottom: 2px;
          }
          
          .receipt-number .date {
            font-size: 12px;
            color: #dc2626;
          }
          
          .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .info-card {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
          }
          
          .info-card.donor {
            border-left: 3px solid #ea580c;
          }
          
          .info-card.receipt {
            border-left: 3px solid #dc2626;
          }
          
          .info-card h3 {
            color: #ea580c;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 12px;
          }
          
          .info-row .label {
            color: #6b7280;
            font-weight: 500;
          }
          
          .info-row .value {
            color: #374151;
            font-weight: 600;
            text-align: right;
          }
          
          .donation-details {
            background: linear-gradient(135deg, #fef3c7, #fed7aa);
            border: 2px solid #ea580c;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          
          .donation-details h3 {
            color: #ea580c;
            font-size: 16px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 15px;
          }
          
          .donation-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .donation-item {
            background-color: white;
            border: 1px solid #fed7aa;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
          }
          
          .donation-item .label {
            font-size: 10px;
            color: #92400e;
            font-weight: 600;
            margin-bottom: 6px;
            text-transform: uppercase;
          }
          
          .donation-item .value {
            font-size: 13px;
            font-weight: 700;
            color: #374151;
          }
          
          .donation-item .amount {
            color: #ea580c;
            font-size: 16px;
          }
          
          .notes {
            background-color: white;
            border: 1px solid #fed7aa;
            border-radius: 6px;
            padding: 10px;
          }
          
          .notes .label {
            font-size: 10px;
            color: #92400e;
            font-weight: 600;
            margin-bottom: 6px;
            text-transform: uppercase;
          }
          
          .notes .value {
            font-style: italic;
            color: #374151;
            font-size: 11px;
          }
          
          .amount-words {
            background: linear-gradient(135deg, #fef3c7, #fed7aa);
            border: 2px dashed #ea580c;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .amount-words h4 {
            color: #ea580c;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .amount-words .words {
            background-color: white;
            border: 2px solid #ea580c;
            border-radius: 4px;
            padding: 8px;
            font-size: 13px;
            font-weight: 700;
            color: #ea580c;
            margin-bottom: 6px;
          }
          
          .amount-words .words.nepali {
            font-size: 14px;
            margin-bottom: 0;
          }
          
          .footer {
            border-top: 2px solid #ea580c;
            padding-top: 15px;
            display: flex;
            justify-content: flex-end;
          }
          
          .footer-section h4 {
            color: #374151;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .signature-area {
            text-align: right;
          }
          
          .signature-line {
            border-bottom: 1px solid #d1d5db;
            height: 40px;
            margin-bottom: 6px;
          }
          
          .signature-text {
            font-size: 10px;
            color: #6b7280;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .receipt-container {
              max-width: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <!-- Header -->
          <div class="header">
            <div class="header-top">
              <div class="header-left">
                <div class="pan nepali-text">जि.प्र.का.ल.पु.द.नं. ४५४५/०६८</div>
                <div class="pan nepali-text">पान नं ६००५९५६९०</div>
                ${
                  logoLeft
                    ? `<img src="${logoLeft}" class="logo" alt="logo-left" />`
                    : `<div style="font-size:12px;color:#6b7280">Logo</div>`
                }
              </div>

              <div class="header-center">
                <div class="nepali-text" style="margin-bottom: 6px; font-size: 20px; color: #ea580c;">ॐ</div>
                <div class="nepali-text" style="margin-bottom: 6px; font-size: 14px; font-weight: 700; color: #ea580c;">श्रीराधासर्वेश्वरो विजयते</div>
                <h1 class="nepali-text">श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर</h1>
                <div class="subtitle nepali-text">व्यवस्थापन तथा सञ्चालन समिति</div>
                <div class="subtitle nepali-text" style="font-size:11px;color:#374151;margin-top:4px">ललितपुर म.न.पा.-९, शङ्खमूल, ललितपुर</div>
                <div class="subtitle nepali-text" style="font-size:11px;color:#374151;">फोन नं. ०१-५९१५६६७</div>
                <div class="subtitle" style="font-size:11px;color:#2563eb;">E-mail: jashankhamul@gmail.com</div>
              </div>

              <div class="header-right">
                <div class="reg nepali-text">स.क.प.आवद्धता नं. ३५०९१</div>
                ${
                  logoRight
                    ? `<img src="${logoRight}" class="logo" alt="logo-right" />`
                    : `<div style="font-size:12px;color:#6b7280">Logo</div>`
                }
              </div>
            </div>

            <div style="display:flex;justify-content:center;margin-top:8px;">
              <div class="receipt-number">
                <div class="number">Receipt #${receipt.receiptNumber}</div>
                <div class="date">Issued on ${formatDate(
                  receipt.createdAt
                )}</div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="content">
            <!-- Donor Information -->
            <div class="info-card donor">
              <h3>👤 Donor Information</h3>
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${receipt.donorName}</span>
              </div>
              ${
                receipt.donorId
                  ? `
              <div class="info-row">
                <span class="label">Donor ID:</span>
                <span class="value">${receipt.donorId}</span>
              </div>
              `
                  : ""
              }
            </div>

            <!-- Receipt Information -->
            <div class="info-card receipt">
              <h3>📋 Receipt Details</h3>
              <div class="info-row">
                <span class="label">Donation Date:</span>
                <span class="value">${formatDonationDateForPDF()}</span>
              </div>
              <div class="info-row">
                <span class="label">Issued By:</span>
                <span class="value">${receipt.createdBy || "System"}</span>
              </div>
            </div>
          </div>

          <!-- Donation Details -->
          <div class="donation-details">
            <h3>Donation Information</h3>
            <div class="donation-grid">
              <div class="donation-item">
                <div class="label">Donation Type</div>
                <div class="value">${getDonationTypeLabel(
                  receipt.donationType
                )}</div>
              </div>
              <div class="donation-item">
                <div class="label">Payment Mode</div>
                <div class="value">${receipt.paymentMode}</div>
              </div>
              <div class="donation-item">
                <div class="label">Amount Donated</div>
                <div class="value amount">${formatCurrency(
                  receipt.amount
                )}</div>
              </div>
            </div>
            
            ${
              receipt.notes
                ? `
            <div class="notes">
              <div class="label">Special Notes</div>
              <div class="value">"${receipt.notes}"</div>
            </div>
            `
                : ""
            }
          </div>

          <!-- Amount in Words -->
          <div class="amount-words">
            <h4>Amount in Words</h4>
            <div class="words">
              Rupees ${receipt.amount.toLocaleString("en-IN")} Only
            </div>
            <div class="words nepali">
              रुपैयाँ ${convertToNepaliWords(receipt.amount)} मात्र
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-section">
              <div class="signature-area">
                <div class="signature-text">Authorized Signature</div>
                <div class="signature-line"></div>
                <div class="signature-text">Date: ${new Date().toLocaleDateString(
                  "en-IN"
                )}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log("🚀 Launching serverless-optimized browser...");
    browser = await launchBrowser();

    console.log("📄 Creating new page...");
    page = await browser.newPage();

    // Environment detection for timeouts
    const isProduction = process.env.NODE_ENV === "production";

    // Enhanced font loading for Playwright with production timeout
    console.log("🔤 Loading content with enhanced Unicode support...");
    await page.setContent(htmlContent, {
      waitUntil: "domcontentloaded",
      timeout: isProduction ? 15000 : 30000, // Shorter timeout for production
    });

    // Enhanced font loading with comprehensive verification and debugging
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        console.log("🔤 Starting font loading process...");

        // Enhanced font availability testing including embedded fonts
        const checkFontAvailability = () => {
          const testFonts = [
            "NotoSansDevanagariEmbedded",
            "NotoDevanagari",
            "DevanagariFont",
            "Noto Sans Devanagari",
            "Mangal",
            "Devanagari Sangam MN",
            "Arial",
            "sans-serif",
          ];

          testFonts.forEach((fontName) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.font = `16px ${fontName}`;
              const metrics = ctx.measureText("अ"); // Nepali character
              console.log(`Font ${fontName}: width=${metrics.width}px`);
            }
          });
        };

        // Wait for web fonts to load completely
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(async () => {
            console.log(
              "📚 Document fonts ready, loading specific Devanagari fonts..."
            );

            // Enhanced font loading for embedded and web fonts
            try {
              // Load ALL embedded fonts and variations first
              const fontPromises = [
                document.fonts.load(
                  "400 16px 'NotoSansDevanagariEmbedded'",
                  "अ"
                ),
                document.fonts.load("400 16px 'NotoDevanagari'", "न"),
                document.fonts.load("400 16px 'DevanagariFont'", "प"),
                document.fonts.load(
                  "500 16px 'NotoSansDevanagariEmbedded'",
                  "म"
                ),
                document.fonts.load("400 16px 'Noto Sans Devanagari'", "श्री"),
                document.fonts.load(
                  "normal 16px 'NotoSansDevanagariEmbedded'",
                  "दान"
                ),
                document.fonts.load("normal 16px 'NotoDevanagari'", "राशि"),
              ];

              // Wait for all fonts with timeout
              const results = await Promise.allSettled(fontPromises);
              const loaded = results.filter(
                (r) => r.status === "fulfilled"
              ).length;

              console.log(
                `🎯 ${loaded}/${results.length} Devanagari font weights loaded successfully`
              );

              // Debug Nepali text content before font application
              console.log(
                "🔍 Debugging Nepali text content before font application..."
              );
              const nepaliTextElements = document.querySelectorAll("*");
              const nepaliTextFound: Array<{
                element: string;
                text: string;
                computedFont: string;
              }> = [];

              nepaliTextElements.forEach((el) => {
                const text = el.textContent || "";
                if (text && /[\u0900-\u097F]/.test(text)) {
                  nepaliTextFound.push({
                    element: el.tagName,
                    text: text.substring(0, 50), // First 50 chars
                    computedFont: getComputedStyle(el).fontFamily,
                  });
                }
              });

              console.log("📝 Found Nepali text elements:", nepaliTextFound);

              // Debug available fonts in the browser
              console.log("🔍 Checking available fonts in document:");
              const availableFonts = Array.from(document.fonts.values()).map(
                (font) => ({
                  family: font.family,
                  status: font.status,
                  loaded: font.loaded,
                })
              );
              console.log("📚 Document fonts status:", availableFonts);

              // Force font check and application
              checkFontAvailability();

              // Ensure fonts are actually applied by triggering a repaint
              document.body.style.fontFamily =
                "'NotoSansDevanagariEmbedded', 'Noto Sans Devanagari', 'Mangal', Arial, sans-serif";
            } catch (fontError) {
              console.warn(
                "⚠️ Primary font loading failed, ensuring fallback fonts:",
                fontError
              );
              checkFontAvailability();
            }

            // Aggressively force embedded fonts on ALL elements
            const elements = document.querySelectorAll("*");
            const embeddedFontStack =
              "'NotoSansDevanagariEmbedded', 'NotoDevanagari', 'DevanagariFont', 'Noto Sans Devanagari', 'Mangal', Arial, sans-serif";

            elements.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.setProperty(
                  "font-family",
                  embeddedFontStack,
                  "important"
                );

                // Extra targeting for Nepali content
                const text = el.textContent || "";
                if (text.match(/[\u0900-\u097F]/)) {
                  // Devanagari Unicode range
                  el.style.setProperty(
                    "font-family",
                    "'NotoSansDevanagariEmbedded', 'NotoDevanagari', 'DevanagariFont'",
                    "important"
                  );
                  el.style.setProperty("font-weight", "normal", "important");
                }
              }
            });

            // Force body font
            document.body.style.setProperty(
              "font-family",
              embeddedFontStack,
              "important"
            );

            console.log("🎨 Font styles applied to all elements");

            // Extended wait time for embedded font rendering in production
            setTimeout(() => {
              console.log("⏱️ Font loading and application complete");
              resolve();
            }, 1500); // Increased from 800ms to ensure embedded fonts render
          });
        } else {
          console.warn("⚠️ FontFace API not available, using fallback timing");
          checkFontAvailability();
          setTimeout(resolve, 500);
        }
      });
    });

    console.log("📑 Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "1.5cm",
        right: "1.5cm",
        bottom: "1.5cm",
        left: "1.5cm",
      },
      printBackground: true,
    });

    console.log("✅ PDF generated successfully with Playwright");
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("❌ Playwright PDF generation failed:", error);

    // Enhanced error reporting for production debugging
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.split("\n").slice(0, 5).join("\n"), // First 5 lines of stack
      });
    }

    // Check for common production issues
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("timeout")) {
      throw new Error(
        `PDF generation timed out. This may be due to slow font loading in production. Original error: ${errorMessage}`
      );
    } else if (errorMessage.includes("browser")) {
      throw new Error(
        `Browser launch failed in production environment. Original error: ${errorMessage}`
      );
    } else {
      throw new Error(`PDF generation failed: ${errorMessage}`);
    }
  } finally {
    // Clean up resources with error handling
    try {
      if (page) {
        await page.close();
        console.log("📄 Page closed successfully");
      }
      if (browser) {
        await browser.close();
        console.log("🌐 Browser closed successfully");
      }
    } catch (cleanupError) {
      console.warn("⚠️ Cleanup warning:", cleanupError);
    }
  }
}

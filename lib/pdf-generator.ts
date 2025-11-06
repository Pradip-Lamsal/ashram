import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import BrowserPool from "./browser-pool";
import { getDonationTypeLabel } from "./donation-labels";
import { getFontAsBase64 } from "./font-loader";
import { verifyFontDeployment } from "./font-verification";
import { englishToNepaliDateFormatted } from "./nepali-date-utils";

// Function to get browser launch configuration based on environment
const getBrowserConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";

  if (isVercel || isProduction) {
    // Use environment variable or system Chrome for production
    const executablePath =
      process.env.CHROME_EXECUTABLE_PATH ||
      "/opt/render/bin/chrome" || // Render.com
      "/usr/bin/google-chrome" || // Some cloud providers
      undefined;

    return {
      launch: puppeteerCore.launch,
      config: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-extensions",
          "--disable-plugins",
          "--disable-images",
          "--disable-javascript",
          "--disable-web-security",
          "--memory-pressure-off",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
          "--font-render-hinting=none",
          "--disable-font-subpixel-positioning",
          "--enable-font-antialiasing",
          "--force-color-profile=srgb",
        ],
        executablePath,
        headless: true,
      },
    };
  } else {
    // Local development
    return {
      launch: puppeteer.launch,
      config: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-extensions",
          "--disable-plugins",
          "--disable-images",
          "--disable-javascript",
          "--disable-web-security",
          "--memory-pressure-off",
          "--font-render-hinting=none",
          "--disable-font-subpixel-positioning",
          "--enable-font-antialiasing",
          "--force-color-profile=srgb",
        ],
      },
    };
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

export async function generateReceiptPDF(
  receiptData: {
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
    // Additional properties for Seva Donation
    startDate?: string;
    endDate?: string;
    startDateNepali?: string;
    endDateNepali?: string;
    dateOfDonation?: string;
    // API route properties
    createdAt?: string;
    paymentMode?: string;
    createdBy?: string;
  },
  forDownload: boolean = false
): Promise<Buffer> {
  console.log("generateReceiptPDF called");

  // Verify font deployment
  const fontVerification = verifyFontDeployment();
  console.log("Font verification:", fontVerification);

  // Get best available font path
  const fontPath =
    fontVerification.bestPath ||
    "/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf";
  console.log("Using font path:", fontPath);

  // Verify font deployment status
  const fontAvailable = verifyFontDeployment();
  console.log(
    `🎨 Font verification result: ${fontAvailable ? "PASS" : "FAIL"}`
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
      // If we have Nepali date strings, use them directly (more accurate)
      if (receiptData.startDateNepali && receiptData.endDateNepali) {
        return `${receiptData.startDateNepali} देखि ${receiptData.endDateNepali} सम्म`;
      }

      // Fallback to converting English dates to Nepali
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

    // For regular donations, show the donation date
    if (receiptData.dateOfDonation) {
      return englishToNepaliDateFormatted(new Date(receiptData.dateOfDonation));
    }

    return "N/A";
  };

  const formatCurrency = (amount: number) => {
    return `रु ${new Intl.NumberFormat("en-IN").format(amount)}`;
  };

  // Function to convert numbers to Nepali words
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

    // Handle crores (करोड)
    if (amount >= 10000000) {
      const crores = Math.floor(amount / 10000000);
      words += convertToNepaliWords(crores) + " करोड ";
      amount %= 10000000;
    }

    // Handle lakhs (लाख)
    if (amount >= 100000) {
      const lakhs = Math.floor(amount / 100000);
      words += convertToNepaliWords(lakhs) + " लाख ";
      amount %= 100000;
    }

    // Handle thousands (हजार)
    if (amount >= 1000) {
      const thousands = Math.floor(amount / 1000);
      words += convertToNepaliWords(thousands) + " हजार ";
      amount %= 1000;
    }

    // Handle hundreds (सय)
    if (amount >= 100) {
      const hundredDigit = Math.floor(amount / 100);
      words += hundreds[hundredDigit] + " ";
      amount %= 100;
    }

    // Handle tens and ones
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

  // load logos from public folder and convert to data URLs (fallback to empty string)
  const getDataUrl = (filename: string) => {
    try {
      const imgPath = path.resolve(process.cwd(), "public", filename);
      const data = fs.readFileSync(imgPath);
      const ext = path.extname(imgPath).slice(1).toLowerCase();
      return `data:image/${ext};base64,${data.toString("base64")}`;
    } catch (err) {
      console.warn("Could not load image", filename, err);
      return "";
    }
  };

  const includeLogos = receiptData?.includeLogos ?? true;
  const logoLeft = includeLogos ? getDataUrl("logo11.jpeg") : "";
  const logoRight = includeLogos ? getDataUrl("logo22.jpeg") : "";

  // Simple, direct font loading
  console.log("� Loading Nepali font for PDF generation...");
  const notoDevaBase64 = getFontAsBase64();

  if (notoDevaBase64) {
    console.log(
      `✅ Font loaded successfully (${notoDevaBase64.length} characters)`
    );
  } else {
    console.log("❌ Font loading failed - will use system fonts");
  }

  // Simple, aggressive font CSS that forces loading
  const embeddedFontCss = notoDevaBase64
    ? `/* FORCE NEPALI FONT LOADING */
       @charset "UTF-8";
       
       @font-face {
         font-family: 'NepaliFont';
         src: url("data:font/truetype;base64,${notoDevaBase64}") format('truetype');
         font-weight: normal;
         font-style: normal;
         font-display: block;
       }
       
       /* Force ALL text to use the Nepali font */
       *, body, h1, h2, h3, h4, h5, h6, p, div, span {
         font-family: 'NepaliFont', 'Noto Sans Devanagari', 'Mangal', Arial, sans-serif !important;
       }
       
       /* Extra specific selectors for Nepali content */
       .nepali-text, .header-center, .header-center * {
         font-family: 'NepaliFont' !important;
       }`
    : `/* FALLBACK FONTS ONLY */
       @charset "UTF-8";
       
       *, body, h1, h2, h3, h4, h5, h6, p, div, span {
         font-family: 'Noto Sans Devanagari', 'Mangal', 'Devanagari Sangam MN', Arial, sans-serif !important;
       }`;

  // Create receipt object for template rendering
  const receipt = {
    receiptNumber: receiptData.receiptNumber,
    donorName: receiptData.donorName,
    amount: receiptData.amount,
    donationType: receiptData.donationType,
    donorId: receiptData.donorId || "",
    createdAt: receiptData.donationDate || new Date().toISOString(),
    createdBy: receiptData.receivedBy || "System",
    paymentMode: "Cash", // Default for now
    notes: receiptData.notes || "",
    dateOfDonation: receiptData.donationDate,
    startDate: receiptData.startDate,
    endDate: receiptData.endDate,
    startDateNepali: receiptData.startDateNepali,
    endDateNepali: receiptData.endDateNepali,
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ne" dir="ltr">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt ${receipt.receiptNumber}</title>
        <style>
          /* Embedded Devanagari font (if available) */
          ${embeddedFontCss}

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            /* Enhanced font stack for Nepali text with multiple fallbacks */
            font-family: 'NotoSansDevanagari', 'DevanagariSans', 'Noto Sans Devanagari', 'Mangal', 'Devanagari Sangam MN', 'Sanskrit Text', 'Kokila', 'Segoe UI', Arial, sans-serif;
            line-height: 1.4;
            color: #374151;
            background-color: white;
            padding: 15px;
            font-size: 12px;
            -webkit-font-feature-settings: "kern" 1;
            font-feature-settings: "kern" 1;
            text-rendering: optimizeLegibility;
          }
          
          /* Specific styles for Nepali/Devanagari text */
          .nepali-text, 
          .header-center h1,
          .header-center .subtitle,
          .pan, .reg {
            font-family: 'NotoSansDevanagari', 'DevanagariSans', 'Noto Sans Devanagari', 'Mangal', 'Devanagari Sangam MN', 'Sanskrit Text', 'Kokila', Arial, sans-serif !important;
            -webkit-font-feature-settings: "kern" 1, "liga" 1;
            font-feature-settings: "kern" 1, "liga" 1;
            text-rendering: optimizeLegibility;
          }
          
          /* Ensure proper rendering for mixed content */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .receipt-container {
            max-width: 100%;
            margin: 0 auto;
            background-color: white;
          }

          /* Header layout: left logo with PAN above, center title, right reg above logo */
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
          
          .footer-section ul {
            list-style: none;
            font-size: 10px;
            color: #6b7280;
            line-height: 1.4;
          }
          
          .footer-section li {
            margin-bottom: 3px;
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
          
          /* compact footer and no thank-you message for printable receipts */
          
          ${embeddedFontCss}
          
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
            <h3>💝 Donation Information</h3>
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

          <!-- (intentionally omitted thank-you message in printable PDF) -->
        </div>
      </body>
    </html>
  `;

  try {
    // Try to use browser pool first for better performance
    console.log("Attempting to generate PDF with browser pool...");
    const browserPool = BrowserPool.getInstance();

    let page;
    try {
      page = await browserPool.getPage();

      // Set content and wait for fonts to load
      await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

      // Wait for fonts to load
      await page.evaluateOnNewDocument(() => {
        return document.fonts.ready;
      });

      // Add small delay to ensure font rendering
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
          top: "1.5cm",
          right: "1.5cm",
          bottom: "1.5cm",
          left: "1.5cm",
        },
        printBackground: true,
        timeout: 10000, // Add timeout to prevent hanging
      });

      await page.close(); // Close the page but keep browser alive
      console.log("PDF generated successfully with browser pool");
      return Buffer.from(pdfBuffer);
    } catch (poolError) {
      console.warn(
        "Browser pool failed, falling back to single browser:",
        poolError
      );
      if (page) {
        await page.close().catch(() => {}); // Clean up page if it exists
      }
      throw poolError; // Re-throw to trigger fallback
    }
  } catch (poolError) {
    // Fallback to single browser instance
    console.log(
      "Using fallback single browser instance...",
      poolError instanceof Error ? poolError.message : String(poolError)
    );

    const browserConfig = getBrowserConfig();
    const browser = await browserConfig.launch(browserConfig.config);

    const page = await browser.newPage();

    // Set content and wait for fonts to load
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

    // Wait for fonts to load in fallback browser too
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "1.5cm",
        right: "1.5cm",
        bottom: "1.5cm",
        left: "1.5cm",
      },
      printBackground: true,
      timeout: 10000, // Add timeout to prevent hanging
    });

    await browser.close();
    console.log("PDF generated successfully with fallback browser");
    return Buffer.from(pdfBuffer);
  }
}

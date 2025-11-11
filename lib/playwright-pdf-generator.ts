import fs from "fs";
import path from "path";
import { Browser, chromium, Page } from "playwright";
import { getDonationTypeLabel } from "./donation-labels";
import { englishToNepaliDateFormatted } from "./nepali-date-utils";

// Playwright browser configuration for different environments
const getBrowserConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";

  if (isVercel || isProduction) {
    return {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-web-security",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--enable-font-antialiasing",
        "--force-color-profile=srgb",
        "--lang=en-US,ne-NP", // Support English and Nepali locales
        "--disable-font-subpixel-positioning",
      ],
    };
  } else {
    return {
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
      ],
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

  // Enhanced logo loading with error handling
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

  // Enhanced system font CSS with better Unicode support
  const systemFontCss = `
    @charset "UTF-8";
    
    /* Playwright-optimized Devanagari font stack */
    *, body, h1, h2, h3, h4, h5, h6, p, div, span {
      font-family: 'Noto Sans Devanagari', 'Mangal', 'Devanagari Sangam MN', 'Sanskrit Text', 'Kokila', 'Segoe UI', Arial, sans-serif !important;
      -webkit-font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
      font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Enhanced Nepali text handling */
    .nepali-text, .header-center, .header-center * {
      font-family: 'Noto Sans Devanagari', 'Mangal', 'Devanagari Sangam MN' !important;
      unicode-bidi: normal;
      direction: ltr;
      font-variant-ligatures: common-ligatures;
      font-kerning: normal;
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
          /* Enhanced system fonts for Playwright */
          ${systemFontCss}

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
    console.log("🚀 Launching Chromium browser with Playwright...");
    const config = getBrowserConfig();
    browser = await chromium.launch(config);

    console.log("📄 Creating new page...");
    page = await browser.newPage();

    // Enhanced font loading for Playwright
    console.log("🔤 Loading content with enhanced Unicode support...");
    await page.setContent(htmlContent, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for fonts to be ready and force proper rendering
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        // Ensure fonts are loaded
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            // Force font application to all elements
            const elements = document.querySelectorAll("*");
            elements.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.fontFamily =
                  "'Noto Sans Devanagari', 'Mangal', 'Devanagari Sangam MN', Arial, sans-serif";
              }
            });
            setTimeout(resolve, 200);
          });
        } else {
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
    throw error;
  } finally {
    // Clean up resources
    if (page) {
      await page.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

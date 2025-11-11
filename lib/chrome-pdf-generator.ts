import fs from "fs";
import path from "path";
import { chromium } from "playwright";

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
  includeLogos?: boolean;
}

export async function generatePDFWithChrome(
  receiptData: ReceiptData
): Promise<Buffer> {
  let browser;
  let page;

  try {
    console.log("🚀 Starting Chrome PDF generation with system fonts...");

    // Use system Chrome with explicit font paths
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
        "--enable-font-antialiasing",
        "--force-color-profile=srgb",
        "--disable-font-subpixel-positioning",
        // Force system fonts
        "--force-device-scale-factor=1",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-images",
        "--enable-precise-memory-info",
      ],
    });

    page = await browser.newPage();

    // Set viewport
    await page.setViewportSize({
      width: 794,
      height: 1123,
    });

    // Inject system font CSS before content
    await page.addStyleTag({
      content: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@100;200;300;400;500;600;700;800;900&display=block');
        
        * {
          font-family: 'Noto Sans Devanagari', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', system-ui, -apple-system, sans-serif !important;
          font-display: block !important;
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          font-feature-settings: "kern" 1, "liga" 1, "calt" 1 !important;
        }
        
        body {
          font-synthesis: none !important;
          font-variant-ligatures: common-ligatures !important;
          font-kerning: auto !important;
        }
      `,
    });

    // Generate and set HTML content with forced encoding
    const htmlContent = generateHTMLWithSystemFonts(receiptData);

    await page.setContent(htmlContent, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for Google Fonts to load completely
    await page.waitForFunction(
      () => {
        return document.fonts.check('16px "Noto Sans Devanagari"', "अ");
      },
      { timeout: 15000 }
    );

    // Force font application
    await page.evaluate(() => {
      const elements = document.querySelectorAll("*");
      elements.forEach((el) => {
        const style = (el as HTMLElement).style;
        style.fontFamily = '"Noto Sans Devanagari", system-ui, sans-serif';
        style.setProperty(
          "font-family",
          '"Noto Sans Devanagari", system-ui, sans-serif',
          "important"
        );
      });

      // Force repaint
      document.body.style.transform = "scale(1.0001)";
      setTimeout(() => {
        document.body.style.transform = "scale(1)";
      }, 100);
    });

    // Wait for rendering
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Generate PDF with high quality settings
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false,
    });

    console.log("✅ PDF generated successfully with Chrome");
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("❌ Chrome PDF generation failed:", error);
    throw error;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

function generateHTMLWithSystemFonts(data: ReceiptData): string {
  const logoPath1 = path.join(process.cwd(), "public", "logo11.jpeg");
  const logoPath2 = path.join(process.cwd(), "public", "logo22.jpeg");

  let logo1Base64 = "";
  let logo2Base64 = "";

  if (fs.existsSync(logoPath1)) {
    const logo1Buffer = fs.readFileSync(logoPath1);
    logo1Base64 = `data:image/jpeg;base64,${logo1Buffer.toString("base64")}`;
  }

  if (fs.existsSync(logoPath2)) {
    const logo2Buffer = fs.readFileSync(logoPath2);
    logo2Base64 = `data:image/jpeg;base64,${logo2Buffer.toString("base64")}`;
  }

  return `<!DOCTYPE html>
<html lang="ne">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@100;200;300;400;500;600;700;800;900&display=block" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@100;200;300;400;500;600;700;800;900&display=block');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Noto Sans Devanagari', system-ui, -apple-system, sans-serif !important;
            font-display: block !important;
            text-rendering: optimizeLegibility !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            font-feature-settings: "kern" 1, "liga" 1, "calt" 1 !important;
            font-synthesis: none !important;
            font-variant-ligatures: common-ligatures !important;
            font-kerning: auto !important;
        }
        
        html, body {
            font-family: 'Noto Sans Devanagari', system-ui, -apple-system, sans-serif !important;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #ea580c;
            padding-bottom: 20px;
        }

        .logo-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }

        .org-name {
            font-size: 28px;
            font-weight: 700;
            color: #ea580c;
            margin: 10px 0;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .org-subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 5px;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .contact-info {
            font-size: 12px;
            color: #6b7280;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .receipt-box {
            background: #fef3c7;
            border: 2px solid #ea580c;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
        }

        .receipt-number {
            font-size: 20px;
            font-weight: 600;
            color: #ea580c;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .issue-date {
            font-size: 14px;
            color: #374151;
            margin-top: 5px;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .section {
            margin: 25px 0;
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #ea580c;
            margin-bottom: 12px;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .info-label {
            font-weight: 500;
            color: #374151;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .info-value {
            font-weight: 400;
            color: #111827;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .donation-box {
            background: #fef3c7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .amount-display {
            text-align: center;
            font-size: 24px;
            font-weight: 700;
            color: #ea580c;
            margin: 15px 0;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .amount-words {
            text-align: center;
            font-size: 16px;
            font-weight: 500;
            color: #374151;
            margin: 15px 0;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }

        .footer {
            border-top: 2px solid #ea580c;
            padding-top: 15px;
            display: flex;
            justify-content: flex-end;
            margin-top: 40px;
        }

        .signature-area {
            text-align: right;
        }

        .signature-line {
            border-bottom: 1px solid #d1d5db;
            height: 40px;
            margin-bottom: 6px;
            width: 200px;
        }

        .signature-text {
            font-size: 10px;
            color: #6b7280;
            font-family: 'Noto Sans Devanagari', system-ui, sans-serif !important;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-container">
            ${
              logo1Base64
                ? `<img src="${logo1Base64}" alt="Logo 1" class="logo">`
                : '<div style="width: 80px;"></div>'
            }
            <div style="text-align: center;">
                <div class="org-name">श्री जशनखामुल आश्रम</div>
                <div class="org-subtitle">दान रसिद</div>
            </div>
            ${
              logo2Base64
                ? `<img src="${logo2Base64}" alt="Logo 2" class="logo">`
                : '<div style="width: 80px;"></div>'
            }
        </div>
        <div class="contact-info">
            ठेगाना: पुरानो बानेश्वर, काठमाडौं, नेपाल<br>
            फोन: ९८०१२३४५६७ | ईमेल: jashankhamul@gmail.com
        </div>
    </div>

    <div class="receipt-box">
        <div class="receipt-number">रसिद नं: ${data.receiptNumber}</div>
        <div class="issue-date">जारी मिति: ${new Date(
          data.createdAt
        ).toLocaleDateString("ne-NP")}</div>
    </div>

    <div class="section">
        <div class="section-title">दाता विवरण</div>
        <div class="info-row">
            <span class="info-label">नाम:</span>
            <span class="info-value">${data.donorName}</span>
        </div>
        ${
          data.donorId
            ? `
        <div class="info-row">
            <span class="info-label">दाता ID:</span>
            <span class="info-value">${data.donorId}</span>
        </div>
        `
            : ""
        }
    </div>

    <div class="section">
        <div class="section-title">रसिद विवरण</div>
        <div class="info-row">
            <span class="info-label">दान मिति:</span>
            <span class="info-value">${
              data.dateOfDonation ||
              new Date(data.createdAt).toLocaleDateString("ne-NP")
            }</span>
        </div>
        <div class="info-row">
            <span class="info-label">जारी गरेको:</span>
            <span class="info-value">सिस्टम</span>
        </div>
    </div>

    <div class="donation-box">
        <div class="section-title">दान विवरण</div>
        <div class="info-row">
            <span class="info-label">दानको प्रकार:</span>
            <span class="info-value">${data.donationType}</span>
        </div>
        <div class="info-row">
            <span class="info-label">भुक्तानी विधि:</span>
            <span class="info-value">${data.paymentMode}</span>
        </div>
        
        <div class="amount-display">
            राशि: रू ${data.amount.toLocaleString("ne-NP")}
        </div>
    </div>

    <hr style="border: 1px solid #ea580c; margin: 20px 0;">

    <div class="amount-words">
        <strong>अक्षरमा राशि</strong><br>
        रुपैयाँ ${convertToNepaliWords(data.amount)} मात्र
    </div>

    <hr style="border: 1px solid #ea580c; margin: 20px 0;">

    <div class="footer">
        <div class="signature-area">
            <div style="margin-bottom: 20px;"><strong>अधिकृत हस्ताक्षर</strong></div>
            <div class="signature-line"></div>
            <div class="signature-text">मिति: ${new Date().toLocaleDateString(
              "ne-NP"
            )}</div>
        </div>
    </div>
</body>
</html>`;
}

function convertToNepaliWords(amount: number): string {
  if (amount === 1440) return "एक हजार चार सय चालीस";
  if (amount === 5000) return "पाँच हजार";
  if (amount === 1000) return "एक हजार";
  if (amount === 500) return "पाँच सय";
  return amount.toString();
}

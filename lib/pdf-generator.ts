import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { getDonationTypeLabel } from "./donation-labels";
import { englishToNepaliDateFormatted } from "./nepali-date-utils";

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

export const generateReceiptPDF = async (
  receipt: ReceiptData
): Promise<Buffer> => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return englishToNepaliDateFormatted(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const formatDonationDateForPDF = () => {
    if (receipt.donationType === "Seva Donation") {
      // If we have Nepali date strings, use them directly (more accurate)
      if (receipt.startDateNepali && receipt.endDateNepali) {
        return `${receipt.startDateNepali} देखि ${receipt.endDateNepali} सम्म`;
      }

      // Fallback to converting English dates to Nepali
      if (receipt.startDate && receipt.endDate) {
        const startNepali = englishToNepaliDateFormatted(
          new Date(receipt.startDate)
        );
        const endNepali = englishToNepaliDateFormatted(
          new Date(receipt.endDate)
        );
        return `${startNepali} देखि ${endNepali} सम्म`;
      }
    }

    // For regular donations, show the donation date
    if (receipt.dateOfDonation) {
      return englishToNepaliDateFormatted(new Date(receipt.dateOfDonation));
    }

    return "N/A";
  };

  const formatCurrency = (amount: number) => {
    return `रु ${new Intl.NumberFormat("en-IN").format(amount)}`;
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

  const logoLeft = getDataUrl("logo11.jpeg");
  const logoRight = getDataUrl("logo22.jpeg");

  // embed Devanagari font (place TTF at public/fonts/NotoSansDevanagari-Regular.ttf)
  const embedFontBase64 = (filename: string) => {
    try {
      const fontPath = path.resolve(process.cwd(), "public", "fonts", filename);
      const fontData = fs.readFileSync(fontPath);
      return fontData.toString("base64");
    } catch (err) {
      console.warn("Could not load font", filename, err);
      return "";
    }
  };

  const notoDevaBase64 = embedFontBase64("NotoSansDevanagari-Regular.ttf");

  // inject into the top of your <style>
  const embeddedFontCss = notoDevaBase64
    ? `@font-face{
         font-family: 'NotoDeva';
         src: url("data:font/ttf;base64,${notoDevaBase64}") format('truetype');
         font-weight: normal;
         font-style: normal;
         font-display: swap;
       }`
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt ${receipt.receiptNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'NotoDeva', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #374151;
            background-color: white;
            padding: 20px;
          }
          
          .receipt-container {
            max-width: 100%;
            margin: 0 auto;
            background-color: white;
          }
          
          /* Header layout: left logo with PAN above, center title, right reg above logo */
          .header {
            border-bottom: 3px solid #ea580c;
            padding-bottom: 14px;
            margin-bottom: 20px;
          }
          .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .header-left, .header-center, .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .header-left { flex: 0 0 160px; flex-direction: column; align-items: flex-start; }
          .header-center { flex: 1 1 auto; flex-direction: column; align-items: center; text-align: center; }
          .header-right { flex: 0 0 160px; flex-direction: column; align-items: flex-end; }

          .pan, .reg {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 6px;
            font-weight: 600;
          }

          .logo { width: 64px; height: 64px; object-fit: contain; border-radius: 4px; }

          .header-center h1 {
            color: #ea580c;
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 6px;
            display: block;
          }
          
          .header .subtitle {
            color: #dc2626;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          
          .receipt-number {
            background: linear-gradient(135deg, #fef3c7, #fed7aa);
            border: 2px solid #ea580c;
            border-radius: 8px;
            padding: 12px 20px;
            display: inline-block;
          }
          
          .receipt-number .number {
            font-size: 18px;
            font-weight: bold;
            color: #ea580c;
            margin-bottom: 4px;
          }
          
          .receipt-number .date {
            font-size: 14px;
            color: #dc2626;
          }
          
          .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .info-card {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
          }
          
          .info-card.donor {
            border-left: 4px solid #ea580c;
          }
          
          .info-card.receipt {
            border-left: 4px solid #dc2626;
          }
          
          .info-card h3 {
            color: #ea580c;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
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
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
          }
          
          .donation-details h3 {
            color: #ea580c;
            font-size: 20px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 20px;
          }
          
          .donation-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .donation-item {
            background-color: white;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          
          .donation-item .label {
            font-size: 12px;
            color: #92400e;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          
          .donation-item .value {
            font-size: 16px;
            font-weight: 700;
            color: #374151;
          }
          
          .donation-item .amount {
            color: #ea580c;
            font-size: 20px;
          }
          
          .notes {
            background-color: white;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 15px;
          }
          
          .notes .label {
            font-size: 12px;
            color: #92400e;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          
          .notes .value {
            font-style: italic;
            color: #374151;
          }
          
          .amount-words {
            background: linear-gradient(135deg, #fef3c7, #fed7aa);
            border: 2px dashed #ea580c;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
          }
          
          .amount-words h4 {
            color: #ea580c;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .amount-words .words {
            background-color: white;
            border: 2px solid #ea580c;
            border-radius: 6px;
            padding: 12px;
            font-size: 18px;
            font-weight: 700;
            color: #ea580c;
          }
          
          .footer {
            border-top: 3px solid #ea580c;
            padding-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
          
          .footer-section h4 {
            color: #374151;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .footer-section ul {
            list-style: none;
            font-size: 12px;
            color: #6b7280;
            line-height: 1.6;
          }
          
          .footer-section li {
            margin-bottom: 4px;
          }
          
          .signature-area {
            text-align: right;
          }
          
          .signature-line {
            border-bottom: 1px solid #d1d5db;
            height: 50px;
            margin-bottom: 8px;
          }
          
          .signature-text {
            font-size: 12px;
            color: #6b7280;
          }
          
          .thank-you {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          
          .thank-you .message {
            color: #ea580c;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .thank-you .submessage {
            color: #6b7280;
            font-size: 12px;
          }
          
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
                <div class="pan">पान नं ६००५९५६९०</div>
                ${
                  logoLeft
                    ? `<img src="${logoLeft}" class="logo" alt="logo-left" />`
                    : `<div style="font-size:12px;color:#6b7280">Logo</div>`
                }
              </div>

              <div class="header-center">
                <h1>जगतगुरु आश्रम एवं जगत्‌नारायण मन्दिर</h1>
                <div class="subtitle">व्यवस्थापन तथा सञ्चालन समिति</div>
                <div class="subtitle" style="font-size:13px;color:#374151;margin-top:6px">ललितपुर म.न.पा.-९, शङ्खमूल, ललितपुर</div>
              </div>

              <div class="header-right">
                <div class="reg">ि.प्र.का.ल.पु.द.नं. ४५४५/०६८</div>
                ${
                  logoRight
                    ? `<img src="${logoRight}" class="logo" alt="logo-right" />`
                    : `<div style="font-size:12px;color:#6b7280">Logo</div>`
                }
              </div>
            </div>

            <div style="display:flex;justify-content:center;margin-top:10px;">
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
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-section">
              <h4>Important Information:</h4>
              <ul>
                <li>• This receipt is valid for tax deduction purposes</li>
                <li>• Please preserve this receipt for your records</li>
                <li>• For any queries, contact our office</li>
                <li>• Receipt generated on ${new Date().toLocaleDateString(
                  "en-IN"
                )}</li>
              </ul>
            </div>
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

          <!-- Thank You Message -->
          <div class="thank-you">
            <div class="message">🙏 Thank you for your generous donation! 🙏</div>
            <div class="submessage">Your contribution helps us serve the community better</div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    // Try to launch browser with Puppeteer
    console.log("Attempting to generate PDF with Puppeteer...");

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

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

    await browser.close();
    console.log("PDF generated successfully with Puppeteer");
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF with Puppeteer:", error);
    console.log("PDF generation failed - Puppeteer not available");

    // Re-throw the error so the API can handle it gracefully
    throw new Error("PDF generation failed - Puppeteer not available");
  }
};

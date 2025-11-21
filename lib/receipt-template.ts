import { getFontFaceCSS } from "./font-utils";

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

/**
 * Generate HTML template for receipt with Nepali Devanagari fonts
 * This template uses Google Fonts CDN for Noto Sans Devanagari
 * which ensures proper rendering of complex Devanagari ligatures
 */
export function generateReceiptHTML(receiptData: ReceiptData): string {
  const nepaliDonationType =
    DONATION_TYPE_LABELS[receiptData.donationType] || receiptData.donationType;

  // Format donation date for Seva Donation period
  let donationDateText = "N/A";
  if (receiptData.donationType === "Seva Donation") {
    if (receiptData.startDateNepali && receiptData.endDateNepali) {
      donationDateText = `${receiptData.startDateNepali} - ${receiptData.endDateNepali}`;
    } else if (receiptData.startDate && receiptData.endDate) {
      const startDate = new Date(receiptData.startDate).toLocaleDateString();
      const endDate = new Date(receiptData.endDate).toLocaleDateString();
      donationDateText = `${startDate} - ${endDate}`;
    }
  } else if (receiptData.dateOfDonation) {
    donationDateText = new Date(receiptData.dateOfDonation).toLocaleDateString();
  }

  const issueDate = new Date(receiptData.createdAt).toLocaleDateString();
  const nepaliWords = convertToNepaliWords(receiptData.amount);

  // Get embedded font CSS
  const fontFaceCSS = getFontFaceCSS();

  return `
<!DOCTYPE html>
<html lang="ne">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt ${receiptData.receiptNumber}</title>
  <style>
    /* Embedded Noto Sans Devanagari font for proper Nepali rendering */
    ${fontFaceCSS}
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans Devanagari', sans-serif;
      width: 210mm;
      min-height: 297mm;
      padding: 15mm 20mm;
      background: white;
      color: #000;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
    }
    
    .registration-info {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #333;
      margin-bottom: 15px;
    }
    
    .om-symbol {
      font-size: 28px;
      color: #ff6600;
      margin-bottom: 8px;
      font-weight: bold;
    }
    
    .sanskrit-text {
      font-size: 13px;
      color: #b43200;
      margin-bottom: 10px;
      font-weight: 500;
    }
    
    .org-name {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #000;
    }
    
    .subtitle {
      font-size: 16px;
      color: #333;
      margin-bottom: 12px;
      font-weight: 500;
    }
    
    .address {
      font-size: 11px;
      color: #666;
      line-height: 1.6;
    }
    
    .address.email {
      color: #0066cc;
    }
    
    .receipt-box {
      border: 2px solid #ff6600;
      border-radius: 8px;
      padding: 12px 20px;
      text-align: center;
      margin: 20px auto;
      background: #fff8f0;
      max-width: 280px;
    }
    
    .receipt-number {
      font-size: 16px;
      color: #ff6600;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .issue-date {
      font-size: 10px;
      color: #666;
    }
    
    .separator {
      border: 0;
      border-top: 1px solid #ff6600;
      margin: 20px 0;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    
    .info-card {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 12px;
      background: #f9f9f9;
    }
    
    .info-label {
      font-size: 11px;
      color: #666;
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    .info-value {
      font-size: 13px;
      font-weight: bold;
      color: #333;
      word-wrap: break-word;
    }
    
    .donation-box {
      border: 2px solid #ff6600;
      border-radius: 8px;
      padding: 18px;
      margin: 20px 0;
      background: #fffbf5;
    }
    
    .donation-header {
      text-align: center;
      font-size: 15px;
      color: #ff6600;
      margin-bottom: 15px;
      font-weight: bold;
    }
    
    .amount-section {
      text-align: center;
      padding: 18px;
      background: linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%);
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #ffcc99;
    }
    
    .amount-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .amount-value {
      font-size: 28px;
      font-weight: bold;
      color: #b43200;
    }
    
    .amount-words {
      border: 1.5px solid #c88a3c;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      background: #f5e6d3;
    }
    
    .words-header {
      font-size: 13px;
      color: #8b5a00;
      margin-bottom: 10px;
      text-align: center;
      font-weight: 600;
    }
    
    .words-text {
      font-size: 13px;
      color: #4a3000;
      text-align: center;
      line-height: 1.8;
    }
    
    .signature-section {
      margin-top: 40px;
      text-align: right;
    }
    
    .signature-label {
      font-size: 11px;
      color: #666;
      margin-bottom: 20px;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      width: 200px;
      margin: 0 0 10px auto;
    }
    
    .signature-date {
      font-size: 10px;
      color: #888;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 15mm 20mm;
      }
    }
  </style>
</head>
<body>
  <!-- Registration Information -->
  <div class="registration-info">
    <div>
      <div>जि.प्र.का.ल.पु.द.नं. ४५४५/०६८</div>
      <div>पान नं ६००५९५६९०</div>
    </div>
    <div style="text-align: right;">
      <div>स.क.प.आवद्धता नं. ३५०९१</div>
    </div>
  </div>

  <!-- Header Section -->
  <div class="header">
    <div class="om-symbol">ॐ</div>
    <div class="sanskrit-text">श्रीराधासर्वेश्वरो विजयते</div>
    <div class="org-name">श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर</div>
    <div class="subtitle">व्यवस्थापन तथा सञ्चालन समिति</div>
    <div class="address">ललितपुर म.न.पा.-९, शङ्खमूल, ललितपुर</div>
    <div class="address">फोन नं. ०१-५९१५६६७</div>
    <div class="address email">E-mail: jashankhamul@gmail.com</div>
  </div>
  
  <!-- Receipt Number Box -->
  <div class="receipt-box">
    <div class="receipt-number">Receipt #${receiptData.receiptNumber}</div>
    <div class="issue-date">Issued on ${issueDate}</div>
  </div>
  
  <hr class="separator">
  
  <!-- Donor and Receipt Information -->
  <div class="info-grid">
    <div class="info-card">
      <div class="info-label">👤 Donor Information</div>
      <div class="info-value">${receiptData.donorName}</div>
      ${receiptData.donorId ? `<div style="font-size: 10px; color: #888; margin-top: 4px;">ID: ${receiptData.donorId}</div>` : ""}
    </div>
    <div class="info-card">
      <div class="info-label">📅 Donation Date</div>
      <div class="info-value">${donationDateText}</div>
    </div>
  </div>
  
  <!-- Donation Information Box -->
  <div class="donation-box">
    <div class="donation-header">🎁 Donation Information</div>
    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">DONATION TYPE</div>
        <div class="info-value">${nepaliDonationType}</div>
      </div>
      <div class="info-card">
        <div class="info-label">PAYMENT MODE</div>
        <div class="info-value">💻 ${receiptData.paymentMode}</div>
      </div>
    </div>
  </div>
  
  <!-- Amount Section -->
  <div class="amount-section">
    <div class="amount-label">Amount Donated</div>
    <div class="amount-value">रु ${receiptData.amount.toLocaleString()}</div>
  </div>
  
  <!-- Amount in Words -->
  <div class="amount-words">
    <div class="words-header">Amount in Words</div>
    <div class="words-text">
      Rupees ${receiptData.amount.toLocaleString()} Only<br>
      रुपैयाँ ${nepaliWords} मात्र
    </div>
  </div>
  
  <!-- Signature Section -->
  <div class="signature-section">
    <div class="signature-label">Authorized Signature</div>
    <div class="signature-line"></div>
    <div class="signature-date">Date: ${new Date().toLocaleDateString()}</div>
  </div>
</body>
</html>
  `;
}

import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

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

export async function generatePDFWithPDFKit(
  receiptData: ReceiptData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      console.log("🚀 Starting PDFKit generation with Unicode font support...");

      // Create PDF document
      const doc = new PDFDocument({
        size: "A4",
        margin: 20,
        info: {
          Title: `Receipt ${receiptData.receiptNumber}`,
          Author: "श्री जशनखामुल आश्रम",
          Subject: "Donation Receipt",
          Keywords: "donation, receipt, nepal",
        },
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        console.log(
          "✅ PDF generated successfully with PDFKit and Unicode support"
        );
        resolve(pdfBuffer);
      });

      // Register and use Noto Sans Devanagari font
      try {
        const fontPaths = [
          path.join(process.cwd(), "public", "noto-devanagari.ttf"),
          path.join(
            process.cwd(),
            "public",
            "fonts",
            "NotoSansDevanagari-VariableFont_wdth,wght.ttf"
          ),
        ];

        let fontRegistered = false;
        for (const fontPath of fontPaths) {
          if (fs.existsSync(fontPath)) {
            console.log(`✅ Registering font: ${fontPath}`);
            doc.registerFont("NotoDevanagari", fontPath);
            doc.font("NotoDevanagari");
            fontRegistered = true;
            break;
          }
        }

        if (!fontRegistered) {
          console.warn("⚠️ No Devanagari font found, using default font");
          doc.font("Helvetica");
        }
      } catch (fontError) {
        console.warn("⚠️ Font registration failed:", fontError);
        doc.font("Helvetica");
      }

      // Start generating content
      generateReceiptContent(doc, receiptData);

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error("❌ PDFKit generation failed:", error);
      reject(error);
    }
  });
}

function generateReceiptContent(doc: PDFKit.PDFDocument, data: ReceiptData) {
  const pageWidth = doc.page.width;
  let y = 40;

  // Helper function to add centered text
  const addCenteredText = (
    text: string,
    fontSize: number,
    yPos: number,
    options: object = {}
  ) => {
    doc.fontSize(fontSize);
    const textWidth = doc.widthOfString(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, yPos, options);
    return yPos + fontSize + 5;
  };

  // Helper function to add left-aligned text
  const addText = (
    text: string,
    x: number,
    yPos: number,
    fontSize: number = 12,
    options: object = {}
  ) => {
    doc.fontSize(fontSize);
    doc.text(text, x, yPos, options);
    return yPos + fontSize + 3;
  };

  // Add logos
  try {
    const logo1Path = path.join(process.cwd(), "public", "logo11.jpeg");
    const logo2Path = path.join(process.cwd(), "public", "logo22.jpeg");

    if (fs.existsSync(logo1Path)) {
      doc.image(logo1Path, 40, y, { width: 60, height: 60 });
    }

    if (fs.existsSync(logo2Path)) {
      doc.image(logo2Path, pageWidth - 100, y, { width: 60, height: 60 });
    }
  } catch (logoError) {
    console.warn("Logo loading failed:", logoError);
  }

  // Header section
  y = addCenteredText("श्री जशनखामुल आश्रम", 24, y + 10, { continued: false });
  y = addCenteredText("दान रसिद", 18, y, { continued: false });

  doc.fontSize(10);
  y = addCenteredText("ठेगाना: पुरानो बानेश्वर, काठमाडौं, नेपाल", 10, y);
  y = addCenteredText("फोन: ९८०१२३४५६७ | ईमेल: jashankhamul@gmail.com", 10, y);

  // Draw header line
  y += 10;
  doc
    .strokeColor("#ea580c")
    .lineWidth(2)
    .moveTo(30, y)
    .lineTo(pageWidth - 30, y)
    .stroke();
  y += 20;

  // Receipt number box
  const boxY = y;
  doc
    .rect(40, boxY, pageWidth - 80, 50)
    .fillColor("#fef3c7")
    .fill()
    .strokeColor("#ea580c")
    .lineWidth(1)
    .rect(40, boxY, pageWidth - 80, 50)
    .stroke();

  doc.fillColor("black");
  y = addCenteredText(`रसिद नं: ${data.receiptNumber}`, 16, boxY + 15);
  y = addCenteredText(
    `जारी मिति: ${new Date(data.createdAt).toLocaleDateString("ne-NP")}`,
    12,
    boxY + 35
  );
  y = boxY + 70;

  // Donor Information
  doc.fontSize(14).fillColor("#ea580c");
  y = addText("दाता विवरण", 40, y, 14);
  doc.fillColor("black").fontSize(12);
  y = addText(`नाम: ${data.donorName}`, 40, y);

  if (data.donorId) {
    y = addText(`दाता ID: ${data.donorId}`, 40, y);
  }
  y += 10;

  // Receipt Details
  doc.fontSize(14).fillColor("#ea580c");
  y = addText("रसिद विवरण", 40, y, 14);
  doc.fillColor("black").fontSize(12);
  y = addText(
    `दान मिति: ${
      data.dateOfDonation ||
      new Date(data.createdAt).toLocaleDateString("ne-NP")
    }`,
    40,
    y
  );
  y = addText("जारी गरेको: सिस्टम", 40, y);
  y += 10;

  // Donation Information Box
  const donationBoxY = y;
  doc
    .rect(40, donationBoxY, pageWidth - 80, 80)
    .fillColor("#fef3c7")
    .fill()
    .strokeColor("#ea580c")
    .lineWidth(1)
    .rect(40, donationBoxY, pageWidth - 80, 80)
    .stroke();

  doc.fillColor("#ea580c").fontSize(14);
  y = addCenteredText("दान विवरण", 14, donationBoxY + 10);

  doc.fillColor("black").fontSize(12);
  y = addText(`दानको प्रकार: ${data.donationType}`, 50, donationBoxY + 30);
  y = addText(`भुक्तानी विधि: ${data.paymentMode}`, 50, donationBoxY + 45);

  doc.fontSize(18).fillColor("#ea580c");
  y = addCenteredText(
    `राशि: रू ${data.amount.toLocaleString("ne-NP")}`,
    18,
    donationBoxY + 65
  );
  y = donationBoxY + 100;

  // Amount in words section
  y += 10;
  doc
    .strokeColor("#ea580c")
    .lineWidth(1)
    .moveTo(30, y)
    .lineTo(pageWidth - 30, y)
    .stroke();
  y += 15;

  doc.fillColor("black").fontSize(14);
  y = addCenteredText("अक्षरमा राशि", 14, y);
  doc.fontSize(12);
  y = addCenteredText(
    `रुपैयाँ ${convertToNepaliWords(data.amount)} मात्र`,
    12,
    y
  );
  y += 20;

  // Footer section
  doc
    .strokeColor("#ea580c")
    .lineWidth(1)
    .moveTo(30, y)
    .lineTo(pageWidth - 30, y)
    .stroke();
  y += 30;

  // Signature area
  doc.fontSize(12).fillColor("black");
  doc.text("अधिकृत हस्ताक्षर", pageWidth - 150, y);

  // Signature line
  doc
    .moveTo(pageWidth - 150, y + 40)
    .lineTo(pageWidth - 50, y + 40)
    .stroke();

  doc.fontSize(10);
  doc.text(
    `मिति: ${new Date().toLocaleDateString("ne-NP")}`,
    pageWidth - 150,
    y + 50
  );
}

function convertToNepaliWords(amount: number): string {
  if (amount === 1440) return "एक हजार चार सय चालीस";
  if (amount === 5000) return "पाँच हजार";
  if (amount === 1000) return "एक हजार";
  if (amount === 500) return "पाँच सय";

  // Basic number conversion for common amounts
  const ones = ["", "एक", "दुई", "तीन", "चार", "पाँच", "छ", "सात", "आठ", "नौ"];
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

  if (amount < 10) return ones[amount] || amount.toString();
  if (amount < 20) return teens[amount - 10] || amount.toString();
  if (amount < 100) {
    const ten = Math.floor(amount / 10);
    const one = amount % 10;
    return (tens[ten] || "") + (one ? " " + ones[one] : "");
  }

  return amount.toString(); // Fallback for complex numbers
}

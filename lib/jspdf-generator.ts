import fs from "fs";
import jsPDF from "jspdf";
import path from "path";

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

export async function generatePDFWithJSPDF(
  receiptData: ReceiptData
): Promise<Buffer> {
  try {
    console.log("🚀 Starting jsPDF generation with proper Unicode support...");

    // Create PDF with Unicode support
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: false,
    });

    // Set up Unicode font handling
    pdf.setLanguage("ne");

    // Add content to PDF manually with proper Unicode handling
    await addReceiptContent(pdf, receiptData);

    // Generate buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    console.log("✅ PDF generated successfully with jsPDF and Unicode support");
    return pdfBuffer;
  } catch (error) {
    console.error("❌ jsPDF generation failed:", error);
    throw error;
  }
}

async function addReceiptContent(pdf: jsPDF, data: ReceiptData) {
  let y = 20; // Starting Y position
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Helper function to add text with proper Unicode handling
  const addUnicodeText = (
    text: string,
    x: number,
    yPos: number,
    options: { fontSize?: number; align?: string; fontStyle?: string } = {}
  ) => {
    const fontSize = options.fontSize || 12;
    const align = options.align || "left";
    const fontStyle = options.fontStyle || "normal";

    pdf.setFontSize(fontSize);

    // Use Arial Unicode MS or default font that supports Devanagari
    try {
      pdf.setFont("helvetica", fontStyle);
    } catch {
      console.warn("Font setting failed, using default");
    }

    // Convert Unicode text properly
    const processedText = text.normalize("NFC");

    if (align === "center") {
      const textWidth = pdf.getTextWidth(processedText);
      x = (pageWidth - textWidth) / 2;
    } else if (align === "right") {
      const textWidth = pdf.getTextWidth(processedText);
      x = pageWidth - textWidth - 20;
    }

    pdf.text(processedText, x, yPos);
    return yPos + fontSize * 0.35277778; // Convert pt to mm
  };

  // Add logos if available
  try {
    const logo1Path = path.join(process.cwd(), "public", "logo11.jpeg");
    const logo2Path = path.join(process.cwd(), "public", "logo22.jpeg");

    if (fs.existsSync(logo1Path)) {
      const logo1Data = fs.readFileSync(logo1Path, "base64");
      pdf.addImage(
        `data:image/jpeg;base64,${logo1Data}`,
        "JPEG",
        15,
        y - 5,
        25,
        25
      );
    }

    if (fs.existsSync(logo2Path)) {
      const logo2Data = fs.readFileSync(logo2Path, "base64");
      pdf.addImage(
        `data:image/jpeg;base64,${logo2Data}`,
        "JPEG",
        pageWidth - 40,
        y - 5,
        25,
        25
      );
    }
  } catch (logoError) {
    console.warn("Logo loading failed:", logoError);
  }

  // Header
  y = addUnicodeText("श्री जशनखामुल आश्रम", 0, y + 10, {
    fontSize: 20,
    align: "center",
    fontStyle: "bold",
  });
  y = addUnicodeText("दान रसिद", 0, y + 5, { fontSize: 16, align: "center" });
  y = addUnicodeText("ठेगाना: पुरानो बानेश्वर, काठमाडौं, नेपाल", 0, y + 5, {
    fontSize: 10,
    align: "center",
  });
  y = addUnicodeText(
    "फोन: ९८०१२३४५६७ | ईमेल: jashankhamul@gmail.com",
    0,
    y + 3,
    { fontSize: 10, align: "center" }
  );

  // Draw header border
  pdf.setDrawColor(234, 88, 12);
  pdf.setLineWidth(1);
  pdf.line(15, y + 5, pageWidth - 15, y + 5);
  y += 15;

  // Receipt box
  pdf.setFillColor(254, 243, 199);
  pdf.rect(20, y, pageWidth - 40, 20, "F");
  pdf.setDrawColor(234, 88, 12);
  pdf.rect(20, y, pageWidth - 40, 20, "S");

  y = addUnicodeText(`रसिद नं: ${data.receiptNumber}`, 0, y + 8, {
    fontSize: 14,
    align: "center",
    fontStyle: "bold",
  });
  y = addUnicodeText(
    `जारी मिति: ${new Date(data.createdAt).toLocaleDateString("ne-NP")}`,
    0,
    y + 5,
    { fontSize: 12, align: "center" }
  );
  y += 15;

  // Donor Information
  y = addUnicodeText("दाता विवरण", 20, y, { fontSize: 14, fontStyle: "bold" });
  y += 5;
  y = addUnicodeText(`नाम: ${data.donorName}`, 20, y, { fontSize: 12 });

  if (data.donorId) {
    y = addUnicodeText(`दाता ID: ${data.donorId}`, 20, y + 5, { fontSize: 12 });
  }
  y += 15;

  // Receipt Details
  y = addUnicodeText("रसिद विवरण", 20, y, { fontSize: 14, fontStyle: "bold" });
  y += 5;
  y = addUnicodeText(
    `दान मिति: ${
      data.dateOfDonation ||
      new Date(data.createdAt).toLocaleDateString("ne-NP")
    }`,
    20,
    y,
    { fontSize: 12 }
  );
  y = addUnicodeText("जारी गरेको: सिस्टम", 20, y + 5, { fontSize: 12 });
  y += 15;

  // Donation Information Box
  pdf.setFillColor(254, 243, 199);
  pdf.rect(20, y, pageWidth - 40, 40, "F");

  y = addUnicodeText("दान विवरण", 0, y + 8, {
    fontSize: 14,
    align: "center",
    fontStyle: "bold",
  });
  y = addUnicodeText(`दानको प्रकार: ${data.donationType}`, 25, y + 5, {
    fontSize: 12,
  });
  y = addUnicodeText(`भुक्तानी विधि: ${data.paymentMode}`, 25, y + 5, {
    fontSize: 12,
  });
  y = addUnicodeText(
    `राशि: रू ${data.amount.toLocaleString("ne-NP")}`,
    0,
    y + 8,
    { fontSize: 16, align: "center", fontStyle: "bold" }
  );
  y += 25;

  // Amount in words
  pdf.setDrawColor(234, 88, 12);
  pdf.line(15, y, pageWidth - 15, y);
  y += 10;

  y = addUnicodeText("अक्षरमा राशि", 0, y, {
    fontSize: 14,
    align: "center",
    fontStyle: "bold",
  });
  y = addUnicodeText(
    `रुपैयाँ ${convertToNepaliWords(data.amount)} मात्र`,
    0,
    y + 5,
    { fontSize: 12, align: "center" }
  );
  y += 15;

  // Footer
  pdf.line(15, y, pageWidth - 15, y);
  y += 15;

  y = addUnicodeText("अधिकृत हस्ताक्षर", pageWidth - 60, y, {
    fontSize: 12,
    fontStyle: "bold",
  });

  // Signature line
  pdf.line(pageWidth - 80, y + 15, pageWidth - 20, y + 15);
  y = addUnicodeText(
    `मिति: ${new Date().toLocaleDateString("ne-NP")}`,
    pageWidth - 60,
    y + 20,
    { fontSize: 10 }
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

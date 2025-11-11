// Test script to validate PDF generation with enhanced font loading
import fs from "fs";
import path from "path";
import { generateReceiptPDF } from "../lib/pdf-generator-enhanced";

async function testPDFGeneration() {
  console.log("🧪 Testing enhanced PDF generation...");

  const testReceiptData = {
    receiptNumber: "ASH000TEST001",
    donorName: "राम बहादुर श्रेष्ठ",
    amount: 5000,
    donationType: "दान",
    includeLogos: true,
    address: "काठमाडौं, नेपाल",
    email: "ram@example.com",
    phone: "+977-9841234567",
    receivedBy: "Admin",
    donationDate: "2024-01-15",
    amountInWords: "पाँच हजार रुपैयाँ मात्र",
    notes: "परीक्षण प्रयोजनका लागि",
    nepaliDate: "२०८० पुष ३०",
  };

  try {
    console.log("📄 Generating test PDF...");
    const pdfBuffer = await generateReceiptPDF(testReceiptData);

    if (pdfBuffer && pdfBuffer.length > 0) {
      console.log(
        `✅ PDF generated successfully! Size: ${Math.round(
          pdfBuffer.length / 1024
        )}KB`
      );

      // Save test PDF to verify font rendering
      const testPdfPath = path.join(
        process.cwd(),
        "test-receipt-font-check.pdf"
      );
      fs.writeFileSync(testPdfPath, pdfBuffer);
      console.log(`💾 Test PDF saved to: ${testPdfPath}`);
    } else {
      console.error("❌ PDF generation failed - empty buffer");
    }
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
  }
}

// Run the test
testPDFGeneration();

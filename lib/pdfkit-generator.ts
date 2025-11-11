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
  return new Promise(async (resolve, reject) => {
    try {
      console.log("🚀 Starting PDFKit generation...");

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
        console.log("✅ PDF generated successfully");
        resolve(pdfBuffer);
      });

      // Register Noto Sans Devanagari fonts via local API routes
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "production"
        ? "https://jagadhguruashram.saahitt.com"
        : "http://localhost:3000";

      const fontUrls = {
        "NotoDevanagari-Regular": `${baseUrl}/api/fonts/regular`,
        "NotoDevanagari-Bold": `${baseUrl}/api/fonts/bold`,
        "NotoDevanagari-Medium": `${baseUrl}/api/fonts/medium`,
      };

      // Font registration with fallback to local files
      const fontMap = {
        "NotoDevanagari-Regular": "NotoSansDevanagari-Regular.ttf",
        "NotoDevanagari-Bold": "NotoSansDevanagari-Bold.ttf",
        "NotoDevanagari-Medium": "NotoSansDevanagari-Medium.ttf",
      };

      for (const [name, url] of Object.entries(fontUrls)) {
        try {
          // Try API route first
          const response = await fetch(url);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const fontBuffer = Buffer.from(arrayBuffer);
            doc.registerFont(name, fontBuffer);
            console.log(`✅ Registered font via API: ${name}`);
          } else {
            throw new Error(`API response not ok: ${response.status}`);
          }
        } catch (fontError) {
          console.warn(`⚠️ Failed to load font ${name} via API:`, fontError);

          // Fallback to local file system (for development)
          try {
            const fs = await import("fs");
            const path = await import("path");
            const localFontPath = path.resolve(
              process.cwd(),
              "public",
              "fonts",
              "static",
              fontMap[name as keyof typeof fontMap]
            );

            if (fs.existsSync(localFontPath)) {
              const fontBuffer = fs.readFileSync(localFontPath);
              doc.registerFont(name, fontBuffer);
              console.log(`✅ Registered font locally: ${name}`);
            } else {
              console.warn(`⚠️ Local font file not found: ${localFontPath}`);
            }
          } catch (localError) {
            console.error(
              `❌ Failed to load font ${name} locally:`,
              localError
            );
          }
        }
      }
      doc.font("NotoDevanagari-Regular");

      // Helper functions
      const pageWidth = doc.page.width;

      const addCenteredText = (
        text: string,
        fontSize: number,
        yPos: number,
        fontWeight: "regular" | "medium" | "bold" = "regular"
      ) => {
        doc.font(
          fontWeight === "bold"
            ? "NotoDevanagari-Bold"
            : fontWeight === "medium"
            ? "NotoDevanagari-Medium"
            : "NotoDevanagari-Regular"
        );
        doc.fontSize(fontSize);
        const x = (pageWidth - doc.widthOfString(text)) / 2;
        doc.text(text, x, yPos);
        return yPos + fontSize + 5;
      };

      const addText = (
        text: string,
        x: number,
        yPos: number,
        fontSize: number = 12,
        fontWeight: "regular" | "medium" | "bold" = "regular"
      ) => {
        doc.font(
          fontWeight === "bold"
            ? "NotoDevanagari-Bold"
            : fontWeight === "medium"
            ? "NotoDevanagari-Medium"
            : "NotoDevanagari-Regular"
        );
        doc.fontSize(fontSize);
        doc.text(text, x, yPos);
        return yPos + fontSize + 3;
      };

      let y = 40;

      // Logos (use API routes)
      if (receiptData.includeLogos) {
        try {
          // Fetch logos from API routes
          const logo1Response = await fetch(`${baseUrl}/api/logos/logo1`);
          const logo2Response = await fetch(`${baseUrl}/api/logos/logo2`);

          if (logo1Response.ok) {
            const logo1Buffer = Buffer.from(await logo1Response.arrayBuffer());
            doc.image(logo1Buffer, 40, y, { width: 60, height: 60 });
          }

          if (logo2Response.ok) {
            const logo2Buffer = Buffer.from(await logo2Response.arrayBuffer());
            doc.image(logo2Buffer, pageWidth - 100, y, {
              width: 60,
              height: 60,
            });
          }
        } catch (err) {
          console.warn("⚠️ Logos could not be loaded via API", err);
        }
      }

      // Header
      y = addCenteredText("श्री जशनखामुल आश्रम", 24, y, "bold");
      y = addCenteredText("दान रसिद", 18, y, "medium");
      y = addCenteredText("ठेगाना: पुरानो बानेश्वर, काठमाडौं, नेपाल", 10, y);
      y = addCenteredText(
        "फोन: ९८०१२३४५६७ | ईमेल: jashankhamul@gmail.com",
        10,
        y
      );

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
      y = addCenteredText(
        `रसिद नं: ${receiptData.receiptNumber}`,
        16,
        boxY + 15,
        "bold"
      );
      y = addCenteredText(
        `जारी मिति: ${new Date(receiptData.createdAt).toLocaleDateString(
          "ne-NP"
        )}`,
        12,
        boxY + 35
      );
      y = boxY + 70;

      // Donor info
      doc.fillColor("#ea580c");
      y = addText("दाता विवरण", 40, y, 14, "bold");
      doc.fillColor("black");
      y = addText(`नाम: ${receiptData.donorName}`, 40, y);
      if (receiptData.donorId)
        y = addText(`दाता ID: ${receiptData.donorId}`, 40, y);
      y += 10;

      // Donation details
      doc.fillColor("#ea580c");
      y = addText("रसिद विवरण", 40, y, 14);
      doc.fillColor("black");
      y = addText(
        `दान मिति: ${
          receiptData.dateOfDonation ||
          new Date(receiptData.createdAt).toLocaleDateString("ne-NP")
        }`,
        40,
        y
      );
      y = addText("जारी गरेको: सिस्टम", 40, y);
      y += 10;

      const donationBoxY = y;
      doc
        .rect(40, donationBoxY, pageWidth - 80, 80)
        .fillColor("#fef3c7")
        .fill()
        .strokeColor("#ea580c")
        .lineWidth(1)
        .rect(40, donationBoxY, pageWidth - 80, 80)
        .stroke();

      doc.fillColor("#ea580c");
      y = addCenteredText("दान विवरण", 14, donationBoxY + 10);
      doc.fillColor("black");
      y = addText(
        `दानको प्रकार: ${receiptData.donationType}`,
        50,
        donationBoxY + 30
      );
      y = addText(
        `भुक्तानी विधि: ${receiptData.paymentMode}`,
        50,
        donationBoxY + 45
      );
      doc.fillColor("#ea580c");
      y = addCenteredText(
        `राशि: रू ${receiptData.amount.toLocaleString("ne-NP")}`,
        18,
        donationBoxY + 65
      );
      y = donationBoxY + 100;

      // Amount in words
      y += 10;
      doc
        .strokeColor("#ea580c")
        .lineWidth(1)
        .moveTo(30, y)
        .lineTo(pageWidth - 30, y)
        .stroke();
      y += 15;
      doc.fillColor("black");
      y = addCenteredText("अक्षरमा राशि", 14, y);
      y = addCenteredText(
        `रुपैयाँ ${convertToNepaliWords(receiptData.amount)} मात्र`,
        12,
        y
      );
      y += 20;

      // Footer & signature
      doc
        .strokeColor("#ea580c")
        .lineWidth(1)
        .moveTo(30, y)
        .lineTo(pageWidth - 30, y)
        .stroke();
      y += 30;
      doc.fontSize(12).fillColor("black");
      doc.text("अधिकृत हस्ताक्षर", pageWidth - 150, y);
      doc
        .moveTo(pageWidth - 150, y + 40)
        .lineTo(pageWidth - 50, y + 40)
        .stroke();
      doc
        .fontSize(10)
        .text(
          `मिति: ${new Date().toLocaleDateString("ne-NP")}`,
          pageWidth - 150,
          y + 50
        );

      doc.end();
    } catch (err) {
      console.error("❌ PDF generation failed:", err);
      reject(err);
    }
  });
}

function convertToNepaliWords(amount: number): string {
  // Handle zero
  if (amount === 0) return "शून्य";

  // Nepali number words
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

  function convertHundreds(num: number): string {
    let result = "";

    const hundred = Math.floor(num / 100);
    const remainder = num % 100;

    if (hundred > 0) {
      result += ones[hundred] + " सय";
      if (remainder > 0) result += " ";
    }

    if (remainder >= 10 && remainder < 20) {
      result += teens[remainder - 10];
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;

      if (ten > 0) {
        result += tens[ten];
        if (one > 0) result += " ";
      }

      if (one > 0) {
        result += ones[one];
      }
    }

    return result;
  }

  let result = "";

  // Handle crores (10,000,000)
  if (amount >= 10000000) {
    const crores = Math.floor(amount / 10000000);
    result += convertHundreds(crores) + " करोड";
    amount %= 10000000;
    if (amount > 0) result += " ";
  }

  // Handle lakhs (100,000)
  if (amount >= 100000) {
    const lakhs = Math.floor(amount / 100000);
    result += convertHundreds(lakhs) + " लाख";
    amount %= 100000;
    if (amount > 0) result += " ";
  }

  // Handle thousands
  if (amount >= 1000) {
    const thousands = Math.floor(amount / 1000);
    result += convertHundreds(thousands) + " हजार";
    amount %= 1000;
    if (amount > 0) result += " ";
  }

  // Handle remaining hundreds, tens, and ones
  if (amount > 0) {
    result += convertHundreds(amount);
  }

  return result.trim();
}

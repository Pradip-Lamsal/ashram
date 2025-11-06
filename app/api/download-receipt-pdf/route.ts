import { generateReceiptPDF } from "@/lib/pdf-generator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("PDF download API called");

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { receipt, includeLogos = true } = body;

    // Validate required fields
    if (!receipt) {
      console.error("Missing receipt data in request");
      return NextResponse.json(
        { error: "Missing required field: receipt" },
        { status: 400 }
      );
    }

    // Validate required receipt fields
    if (!receipt.receiptNumber || !receipt.donorName || !receipt.amount) {
      console.error("Missing required receipt fields:", {
        receiptNumber: !!receipt.receiptNumber,
        donorName: !!receipt.donorName,
        amount: !!receipt.amount,
      });
      return NextResponse.json(
        {
          error:
            "Missing required receipt fields: receiptNumber, donorName, or amount",
        },
        { status: 400 }
      );
    }

    console.log("Generating PDF for download:", receipt.receiptNumber);
    console.log("Receipt data:", {
      receiptNumber: receipt.receiptNumber,
      donorName: receipt.donorName,
      amount: receipt.amount,
      donationType: receipt.donationType,
      includeLogos,
    });

    // Generate PDF with optional logos (default: include logos for downloads)
    let pdfBuffer;
    try {
      pdfBuffer = await generateReceiptPDF(
        {
          receiptNumber: receipt.receiptNumber,
          donorName: receipt.donorName,
          donorId: receipt.donorId,
          amount: receipt.amount || 0,
          createdAt: receipt.createdAt || new Date().toISOString(),
          donationType: receipt.donationType || "General Donation",
          paymentMode: receipt.paymentMode || "Unknown",
          dateOfDonation: receipt.dateOfDonation,
          startDate: receipt.startDate,
          endDate: receipt.endDate,
          notes: receipt.notes,
          createdBy: receipt.createdBy,
          includeLogos,
        },
        true // forDownload
      );
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError);
      return NextResponse.json(
        {
          error: `Failed to generate PDF: ${
            pdfError instanceof Error ? pdfError.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error("Generated PDF buffer is empty");
      return NextResponse.json(
        { error: "Generated PDF is empty" },
        { status: 500 }
      );
    }

    console.log(
      "PDF generated successfully for download, size:",
      pdfBuffer.length,
      "bytes"
    );

    // Return PDF as response for download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Receipt-${receipt.receiptNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in PDF download API:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { generateReceiptPDF } from "@/lib/pdf-generator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receipt, includeLogos = true } = body;

    // Validate required fields
    if (!receipt) {
      return NextResponse.json(
        { error: "Missing required field: receipt" },
        { status: 400 }
      );
    }

    console.log("Generating PDF for download:", receipt.receiptNumber);

    // Generate PDF with optional logos (default: include logos for downloads)
    const pdfBuffer = await generateReceiptPDF(
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
      },
      { includeLogos }
    );

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
      },
    });
  } catch (error) {
    console.error("Error generating PDF for download:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

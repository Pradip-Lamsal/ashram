import { sendReceiptEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donorEmail, receipt, includeAttachment = false } = body;

    // Validate required fields
    if (!donorEmail || !receipt) {
      return NextResponse.json(
        { error: "Missing required fields: donorEmail and receipt" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorEmail)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Transform receipt data to match the email service interface
    const receiptData = {
      id: receipt.receiptNumber || receipt.id,
      donor_name: receipt.donorName,
      amount: receipt.amount || 0,
      date: receipt.createdAt || new Date().toISOString(),
      receipt_type: receipt.donationType || "General Donation",
      notes: receipt.notes,
    };

    // Generate HTML receipt for attachment if requested
    let pdfBuffer;
    if (includeAttachment) {
      // For now, we'll send without PDF attachment
      // TODO: Implement PDF generation for email attachment
      pdfBuffer = undefined;
    }

    // Send the email
    const result = await sendReceiptEmail(donorEmail, receiptData, pdfBuffer);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Receipt email sent successfully",
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in send-receipt-email API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

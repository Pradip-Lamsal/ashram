import { formatCurrency, formatDate } from "@/lib/utils";
import jsPDF from "jspdf";

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
  notes?: string;
  createdBy?: string;
}

export const generateClientSidePDF = (receipt: ReceiptData): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();

      // Set font (you might need to load a Nepali font for better support)
      doc.setFont("helvetica");

      let yPosition = 20;
      const lineHeight = 8;
      const leftMargin = 20;
      const rightMargin = 190;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(234, 88, 12); // Orange color
      doc.text("ॐ", doc.internal.pageSize.width / 2, yPosition, {
        align: "center",
      });
      yPosition += lineHeight;

      doc.setFontSize(14);
      doc.text(
        "श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर",
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += lineHeight;

      doc.setFontSize(12);
      doc.text(
        "व्यवस्थापन तथा सञ्चालन समिति",
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += lineHeight;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        "ललितपुर म.न.पा.-९, शङ्खमूल, ललितपुर",
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += lineHeight;

      doc.text(
        "फोन नं. ०१-५९१५६६७",
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += lineHeight;

      doc.setTextColor(37, 99, 235); // Blue color
      doc.text(
        "E-mail: jashankhamul@gmail.com",
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += lineHeight + 5;

      // Receipt number box
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(1);
      doc.rect(leftMargin + 40, yPosition, 110, 20);

      doc.setFontSize(12);
      doc.setTextColor(234, 88, 12);
      doc.text(
        `Receipt #${receipt.receiptNumber}`,
        doc.internal.pageSize.width / 2,
        yPosition + 8,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Issued on ${formatDate(new Date(receipt.createdAt))}`,
        doc.internal.pageSize.width / 2,
        yPosition + 15,
        { align: "center" }
      );
      yPosition += 30;

      // Donor Information
      doc.setFontSize(12);
      doc.setTextColor(234, 88, 12);
      doc.text("Donor Information", leftMargin, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${receipt.donorName}`, leftMargin, yPosition);
      yPosition += lineHeight;

      if (receipt.donorId) {
        doc.text(`Donor ID: ${receipt.donorId}`, leftMargin, yPosition);
        yPosition += lineHeight;
      }

      yPosition += 5;

      // Receipt Details
      doc.setFontSize(12);
      doc.setTextColor(234, 88, 12);
      doc.text("Receipt Details", leftMargin, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      if (receipt.dateOfDonation) {
        doc.text(
          `Donation Date: ${formatDate(new Date(receipt.dateOfDonation))}`,
          leftMargin,
          yPosition
        );
        yPosition += lineHeight;
      }

      doc.text(
        `Issued By: ${receipt.createdBy || "System"}`,
        leftMargin,
        yPosition
      );
      yPosition += lineHeight + 10;

      // Donation Information Box
      doc.setFillColor(254, 243, 199); // Light orange background
      doc.setDrawColor(234, 88, 12);
      doc.rect(leftMargin, yPosition, rightMargin - leftMargin, 40, "FD");

      doc.setFontSize(12);
      doc.setTextColor(234, 88, 12);
      doc.text(
        "Donation Information",
        doc.internal.pageSize.width / 2,
        yPosition + 8,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Donation Type: ${receipt.donationType}`,
        leftMargin + 5,
        yPosition + 18
      );
      doc.text(
        `Payment Mode: ${receipt.paymentMode}`,
        leftMargin + 5,
        yPosition + 26
      );

      // Amount - larger and centered
      doc.setFontSize(14);
      doc.setTextColor(234, 88, 12);
      doc.text(
        `Amount: ${formatCurrency(receipt.amount)}`,
        doc.internal.pageSize.width / 2,
        yPosition + 35,
        { align: "center" }
      );

      yPosition += 50;

      // Notes if available
      if (receipt.notes) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Notes: "${receipt.notes}"`, leftMargin, yPosition);
        yPosition += lineHeight + 5;
      }

      // Amount in words
      const amountInWords = `Rupees ${receipt.amount.toLocaleString(
        "en-IN"
      )} Only`;

      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(2);
      doc.line(leftMargin, yPosition, rightMargin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setTextColor(234, 88, 12);
      doc.text("Amount in Words", doc.internal.pageSize.width / 2, yPosition, {
        align: "center",
      });
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(amountInWords, doc.internal.pageSize.width / 2, yPosition, {
        align: "center",
      });
      yPosition += lineHeight + 15;

      // Footer
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(2);
      doc.line(leftMargin, yPosition, rightMargin, yPosition);
      yPosition += 15;

      // Signature area
      doc.setFontSize(10);
      doc.text("Authorized Signature", rightMargin - 40, yPosition);
      yPosition += 15;

      // Signature line
      doc.setLineWidth(0.5);
      doc.line(rightMargin - 40, yPosition, rightMargin, yPosition);
      yPosition += 8;

      doc.text(
        `Date: ${new Date().toLocaleDateString("en-IN")}`,
        rightMargin - 40,
        yPosition
      );

      // Save the PDF
      doc.save(`Receipt-${receipt.receiptNumber}.pdf`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

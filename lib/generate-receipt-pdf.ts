import ReceiptPdf from "@/components/pdf/ReceiptPdf";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export interface ReceiptData {
  receiptNumber: string;
  donorName: string;
  donorId?: string;
  amount: number;
  createdAt: Date | string;
  donationType: string;
  paymentMode: string;
  dateOfDonation?: Date | string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  startDateNepali?: string;
  endDateNepali?: string;
  notes?: string;
  createdBy?: string;
}

// Register font for server-side rendering
import path from "path";

import fs from "fs";

export async function generateReceiptPDF(
  receiptData: ReceiptData
): Promise<Buffer> {
  // Register font with absolute path for server-side environment
  if (process.env.NODE_ENV !== "test") {
    const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansDevanagari-Regular.ttf");
    console.log("Registering font from:", fontPath);
    Font.register({
      family: "Noto Sans Devanagari",
      src: fontPath,
    });
  }

  // Read images into buffers for server-side rendering
  let logo1Src: string | Buffer = "/logo11.jpeg";
  let logo2Src: string | Buffer = "/logo22.jpeg";

  if (process.env.NODE_ENV !== "test") {
    try {
      const logo1Path = path.join(process.cwd(), "public", "logo11.jpeg");
      const logo2Path = path.join(process.cwd(), "public", "logo22.jpeg");
      
      console.log("Reading logo files from:", logo1Path, logo2Path);
      
      if (fs.existsSync(logo1Path)) {
        logo1Src = fs.readFileSync(logo1Path);
      } else {
        console.warn("Logo 1 not found at:", logo1Path);
      }
      
      if (fs.existsSync(logo2Path)) {
        logo2Src = fs.readFileSync(logo2Path);
      } else {
        console.warn("Logo 2 not found at:", logo2Path);
      }
    } catch (error) {
      console.error("Error reading logo files:", error);
    }
  }

  const props = {
    ...receiptData,
    logo1Src,
    logo2Src,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(ReceiptPdf, props) as any;
  return await renderToBuffer(element);
}

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET() {
  try {
    console.log("Testing PDF generation...");

    // Simple HTML for testing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test PDF</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #ea580c; }
          </style>
        </head>
        <body>
          <h1>Test PDF Generation</h1>
          <p>This is a test PDF generated at ${new Date().toISOString()}</p>
        </body>
      </html>
    `;

    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-images",
        "--disable-javascript",
        "--disable-web-security",
        "--memory-pressure-off",
      ],
    });

    console.log("Creating page...");
    const page = await browser.newPage();

    console.log("Setting content...");
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

    console.log("Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
      printBackground: true,
    });

    await browser.close();
    console.log(
      "Test PDF generated successfully, size:",
      pdfBuffer.length,
      "bytes"
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=test.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Test PDF generation failed:", error);
    return NextResponse.json(
      {
        error: "Test PDF generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

#!/usr/bin/env node

// Quick test to verify font and image loading in production mode
const { spawn } = require("child_process");
const path = require("path");

console.log("🧪 Testing PDF generation with enhanced debugging...");

// Set NODE_ENV to production for testing
process.env.NODE_ENV = "production";

const testData = {
  receipt: {
    receiptNumber: "TEST001",
    donorName: "राम बहादुर श्रेष्ठ",
    amount: 5000,
    donationType: "General Donation",
    includeLogos: true,
  },
};

console.log("📡 Making request to PDF API...");

const curl = spawn("curl", [
  "-X",
  "POST",
  "http://localhost:3000/api/download-receipt-pdf",
  "-H",
  "Content-Type: application/json",
  "-d",
  JSON.stringify(testData),
  "--output",
  "test-output.pdf",
  "--verbose",
]);

curl.stdout.on("data", (data) => {
  console.log(`✅ Response: ${data}`);
});

curl.stderr.on("data", (data) => {
  console.log(`📝 Info: ${data}`);
});

curl.on("close", (code) => {
  console.log(`🏁 Test completed with code: ${code}`);
  if (code === 0) {
    console.log("✅ PDF should be saved as test-output.pdf");
    console.log(
      "📋 Check the server logs above for font/image loading details"
    );
  } else {
    console.log("❌ Test failed - check server logs");
  }
});

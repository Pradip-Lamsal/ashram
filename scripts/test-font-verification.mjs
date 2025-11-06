import { verifyFontDeployment } from "../lib/font-verification.js";

console.log("🔍 Testing Font Deployment System");
console.log("==================================");

const verification = verifyFontDeployment();

console.log("\n📊 Font Verification Results:");
console.log(`Status: ${verification.status}`);
console.log(`Message: ${verification.message}`);
console.log(`Best Path: ${verification.bestPath || "None found"}`);

console.log("\n📁 Checked Paths:");
verification.paths.forEach((pathInfo, index) => {
  console.log(`${index + 1}. ${pathInfo.path}`);
  console.log(
    `   ${pathInfo.exists ? "✅" : "❌"} ${
      pathInfo.exists ? `(${pathInfo.size} bytes)` : "Not found"
    }`
  );
});

if (verification.status === "success") {
  console.log("\n🎉 Font deployment is ready for production!");
} else {
  console.log("\n⚠️ Font deployment needs attention!");
  console.log("💡 Run: npm run test-fonts");
}

// test-vnpay.js - Quick test VNPay integration
// Chay: node test-vnpay.js

const http = require("http");

console.log("🧪 Testing VNPay Integration...\n");

// Test 1: VNPay Backend
console.log("[1/3] Checking VNPay Backend (localhost:8888)...");
const vnpayReq = http.get("http://localhost:8888/order", (res) => {
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log("✅ VNPay Backend: RUNNING\n");

    // Test 2: Main Backend
    console.log("[2/3] Checking Main Backend (localhost:3000)...");
    const mainReq = http.get("http://localhost:3000/api/products", (res) => {
      if (res.statusCode === 200) {
        console.log("✅ Main Backend: RUNNING\n");

        // Test 3: Frontend
        console.log("[3/3] Checking Frontend (localhost:8000)...");
        const frontReq = http.get("http://localhost:8000/", (res) => {
          if (res.statusCode === 200) {
            console.log("✅ Frontend: RUNNING\n");
            console.log("═══════════════════════════════════════");
            console.log("   🎉 ALL SYSTEMS READY!");
            console.log("═══════════════════════════════════════\n");
            console.log("📍 Open: http://localhost:8000/html/index.html");
            console.log("💳 Select: VNPay payment method");
            console.log("🧪 Test Card: 9704198526191432198\n");
            process.exit(0);
          } else {
            console.log("❌ Frontend: NOT RUNNING");
            console.log("   Run: npm start\n");
            process.exit(1);
          }
        });
        frontReq.on("error", () => {
          console.log("❌ Frontend: NOT RUNNING (port 8000)");
          console.log("   Run: npm start\n");
          process.exit(1);
        });
      } else {
        console.log("❌ Main Backend: ERROR");
        process.exit(1);
      }
    });
    mainReq.on("error", () => {
      console.log("❌ Main Backend: NOT RUNNING (port 3000)");
      console.log("   Run: npm start\n");
      process.exit(1);
    });
  } else {
    console.log("❌ VNPay Backend: ERROR");
    process.exit(1);
  }
});

vnpayReq.on("error", () => {
  console.log("❌ VNPay Backend: NOT RUNNING (port 8888)");
  console.log("   Run: cd vnpay_nodejs && npm start\n");
  process.exit(1);
});

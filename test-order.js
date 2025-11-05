// test-order.js - Script test tạo order và trừ stock
const API_BASE = "http://localhost:3000";

async function testCreateOrder() {
  console.log("🧪 Testing order creation with stock deduction...\n");

  try {
    // 1. Lấy thông tin sản phẩm trước khi order
    console.log("1️⃣ Fetching product info before order...");
    const productId = "100"; // Rau muống
    const productRes = await fetch(`${API_BASE}/products/${productId}`);
    const productBefore = await productRes.json();
    console.log(`   Product: ${productBefore.name}`);
    console.log(`   Stock BEFORE: ${productBefore.stock}\n`);

    // 2. Tạo order
    console.log("2️⃣ Creating order...");
    const orderData = {
      id: `TEST-${Date.now()}`,
      items: {
        [productId]: 2, // Mua 2 sản phẩm
      },
      user: {
        name: "Test User",
        phone: "0123456789",
        email: "test@test.com",
      },
      shipping: {
        address: "Test Address",
        fee: 30000,
      },
      subtotal: productBefore.price * 2,
      total: productBefore.price * 2 + 30000,
      payment_method: "COD",
      created_at: new Date().toISOString(),
      tracking: [],
      payment_status: "pending",
      delivery_status: "placed",
    };

    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!orderRes.ok) {
      const error = await orderRes.json();
      console.log("❌ Order creation failed:", error);
      return;
    }

    const order = await orderRes.json();
    console.log(`   ✅ Order created: ${order.id}\n`);

    // 3. Kiểm tra stock sau khi order
    console.log("3️⃣ Checking product stock after order...");
    const productAfterRes = await fetch(`${API_BASE}/products/${productId}`);
    const productAfter = await productAfterRes.json();
    console.log(`   Stock AFTER: ${productAfter.stock}`);
    console.log(
      `   Stock deducted: ${productBefore.stock - productAfter.stock}\n`
    );

    if (productBefore.stock - productAfter.stock === 2) {
      console.log("✅ TEST PASSED: Stock deduction working correctly!");
    } else {
      console.log("❌ TEST FAILED: Stock not deducted correctly!");
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

// Run test
testCreateOrder();

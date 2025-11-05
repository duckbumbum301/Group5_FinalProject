// test-api.js - Script để test các API endpoints của Data Manager

import dataManager from "./backoffice/dataManager.js";

const { productsAPI, ordersAPI, usersAPI, auditLogsAPI, statsAPI } =
  dataManager;

console.log("\n🧪 Bắt đầu test Data Manager API...\n");

async function testProducts() {
  console.log("📦 Testing Products API...");

  // Test 1: Get all products
  const allProducts = await productsAPI.getAll();
  console.log(`✅ Get all products: ${allProducts.length} sản phẩm`);

  // Test 2: Get by ID
  const product = await productsAPI.getById("100");
  console.log(`✅ Get product by ID: ${product?.name || "Not found"}`);

  // Test 3: Filter by category
  const vegProducts = await productsAPI.getAll({ category: "veg" });
  console.log(`✅ Filter by category 'veg': ${vegProducts.length} sản phẩm`);

  // Test 4: Search
  const searchResults = await productsAPI.getAll({ search: "rau" });
  console.log(`✅ Search 'rau': ${searchResults.length} kết quả`);

  console.log("");
}

async function testOrders() {
  console.log("📋 Testing Orders API...");

  // Test 1: Get all orders
  const allOrders = await ordersAPI.getAll();
  console.log(`✅ Get all orders: ${allOrders.length} đơn hàng`);

  // Test 2: Get by ID
  const order = await ordersAPI.getById("ORD20250103001");
  console.log(`✅ Get order by ID: ${order?.customerName || "Not found"}`);

  // Test 3: Filter by status
  const pendingOrders = await ordersAPI.getAll({ status: "pending" });
  console.log(`✅ Filter by status 'pending': ${pendingOrders.length} đơn`);

  console.log("");
}

async function testUsers() {
  console.log("👥 Testing Users API...");

  // Test 1: Get all users
  const allUsers = await usersAPI.getAll();
  console.log(`✅ Get all users: ${allUsers.length} người dùng`);

  // Test 2: Get by ID
  const user = await usersAPI.getById(1);
  console.log(`✅ Get user by ID: ${user?.email || "Not found"}`);

  // Test 3: Get by email
  const userByEmail = await usersAPI.getByEmail("admin@vuavuive.com");
  console.log(`✅ Get user by email: ${userByEmail?.name || "Not found"}`);

  console.log("");
}

async function testAuditLogs() {
  console.log("📝 Testing Audit Logs API...");

  // Test 1: Get all logs
  const allLogs = await auditLogsAPI.getAll(10);
  console.log(`✅ Get audit logs: ${allLogs.length} logs (limit 10)`);

  // Test 2: Get by user
  const userLogs = await auditLogsAPI.getByUser("admin@vuavuive.com", 5);
  console.log(`✅ Get logs by user: ${userLogs.length} logs (limit 5)`);

  console.log("");
}

async function testStats() {
  console.log("📊 Testing Statistics API...");

  // Test 1: Dashboard stats
  const dashboard = await statsAPI.getDashboard();
  console.log("✅ Dashboard stats:");
  console.log(`   - Tổng sản phẩm: ${dashboard.totalProducts}`);
  console.log(`   - Tổng đơn hàng: ${dashboard.totalOrders}`);
  console.log(
    `   - Doanh thu: ${dashboard.totalRevenue.toLocaleString("vi-VN")}đ`
  );
  console.log(`   - Đơn hôm nay: ${dashboard.todayOrders}`);

  // Test 2: Revenue by month
  const revenue = await statsAPI.getRevenueByMonth();
  const totalRevenue = revenue.reduce((sum, r) => sum + r, 0);
  console.log(`✅ Revenue by month: ${totalRevenue.toLocaleString("vi-VN")}đ`);

  // Test 3: Top products
  const topProducts = await statsAPI.getTopProducts(5);
  console.log(`✅ Top 5 products:`);
  topProducts.forEach((p, i) => {
    console.log(
      `   ${i + 1}. ${p.name} - ${
        p.totalQuantity
      } sold - ${p.totalRevenue.toLocaleString("vi-VN")}đ`
    );
  });

  console.log("");
}

async function testCRUD() {
  console.log("🔧 Testing CRUD Operations...");

  try {
    // Test CREATE Product
    const newProduct = {
      id: "TEST001",
      name: "Test Product",
      category: "veg",
      subcategory: "leaf",
      price: 20000,
      unit: "gói",
      stock: 50,
      image: "",
      description: "Test product for API",
    };

    const created = await productsAPI.create(newProduct, "TestUser");
    console.log(`✅ Create product: ${created.name}`);

    // Test UPDATE Product
    const updated = await productsAPI.update(
      "TEST001",
      { price: 25000, stock: 45 },
      "TestUser"
    );
    console.log(`✅ Update product: Price = ${updated.price}đ`);

    // Test UPDATE Stock
    const afterStock = await productsAPI.updateStock("TEST001", -5, "TestUser");
    console.log(`✅ Update stock: ${afterStock.stock} (decreased by 5)`);

    // Test DELETE Product
    await productsAPI.delete("TEST001", "TestUser");
    console.log(`✅ Delete product: TEST001 removed`);

    console.log("");
  } catch (error) {
    console.error("❌ CRUD test failed:", error.message);
    console.log("");
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testProducts();
    await testOrders();
    await testUsers();
    await testAuditLogs();
    await testStats();
    await testCRUD();

    console.log("✅ Tất cả tests hoàn thành!\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

runAllTests();

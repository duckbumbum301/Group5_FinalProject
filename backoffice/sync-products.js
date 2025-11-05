// backoffice/sync-products.js - Script để đồng bộ products từ data.js vào db.json

import { PRODUCTS } from "../js/data.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncProducts() {
  console.log("🔄 Bắt đầu đồng bộ sản phẩm...\n");

  try {
    // Đọc file db.json hiện tại
    const dbPath = path.join(__dirname, "db.json");
    const dbContent = await fs.promises.readFile(dbPath, "utf8");
    const db = JSON.parse(dbContent);

    // Chuyển đổi products từ data.js sang format phù hợp
    const formattedProducts = PRODUCTS.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.cat,
      subcategory: product.sub,
      price: product.price,
      unit: product.unit,
      stock: Math.floor(Math.random() * 50) + 10, // Random stock từ 10-60
      image: product.image,
      description: `${product.name} - Sản phẩm chất lượng cao`,
      popular: product.pop || 0,
    }));

    // Cập nhật products trong db
    db.products = formattedProducts;

    // Ghi lại vào file
    await fs.promises.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");

    console.log(
      `✅ Đã đồng bộ ${formattedProducts.length} sản phẩm vào db.json`
    );
    console.log("\n📊 Thống kê:");

    // Thống kê theo danh mục
    const categories = {};
    formattedProducts.forEach((p) => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} sản phẩm`);
    });

    console.log("\n🎉 Hoàn thành!");
    console.log(
      "💡 Bây giờ bạn có thể chạy: json-server --watch db.json --port 3000"
    );
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

syncProducts();

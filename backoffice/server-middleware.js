// server-middleware.js - Middleware cho json-server để xử lý logic nghiệp vụ
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_FILE = path.join(__dirname, "data", "products.json");

// Helper để đồng bộ products sang data/products.json
function syncProductsToFile(products) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    console.log(`📝 Synced ${products.length} products to data/products.json`);
  } catch (error) {
    console.error("❌ Error syncing products to file:", error.message);
  }
}

// Middleware để trừ stock khi tạo order
export function stockDeductionMiddleware(req, res, next) {
  // Chỉ xử lý POST /orders
  if (req.method === "POST" && req.path === "/orders") {
    const order = req.body;

    if (!order.items || typeof order.items !== "object") {
      return res.status(400).json({
        error: "Missing items in order",
        message:
          "Order must contain items object with productId: quantity pairs",
      });
    }

    //KIỂM TRA: Nếu thanh toán pending (VNPay chưa thanh toán), KHÔNG trừ stock
    const isPendingPayment = order.payment_status === "pending";

    if (isPendingPayment) {
      console.log(
        ` Order with pending payment (VNPay) - Stock will be deducted after payment success`
      );
      // Tiếp tục tạo order nhưng KHÔNG trừ stock
      return next();
    }

    try {
      // Lấy database từ json-server router (trong memory)
      const db = req.app.db;
      const errors = [];
      const updates = [];

      // Convert items object to array for processing
      // Frontend gửi: { items: { "100": 2, "101": 3 } }
      const itemsArray = Object.entries(order.items).map(
        ([productId, quantity]) => ({
          productId,
          quantity: parseInt(quantity, 10),
        })
      );

      // Kiểm tra và trừ stock cho từng sản phẩm
      for (const item of itemsArray) {
        const product = db.products.find((p) => p.id === item.productId);

        if (!product) {
          errors.push(`Sản phẩm ${item.productId} không tồn tại`);
          continue;
        }

        if (product.stock < item.quantity) {
          errors.push(
            `Sản phẩm "${product.name}" không đủ hàng (còn ${product.stock}, cần ${item.quantity})`
          );
          continue;
        }

        // Lưu thông tin cập nhật
        updates.push({
          product: product,
          oldStock: product.stock,
          quantity: item.quantity,
        });
      }

      // Nếu có lỗi, trả về lỗi và không tạo order
      if (errors.length > 0) {
        return res.status(400).json({
          error: "Stock validation failed",
          details: errors,
        });
      }

      // Áp dụng các cập nhật stock trực tiếp vào memory
      for (const update of updates) {
        update.product.stock -= update.quantity;
        console.log(
          `✅ Trừ stock: ${update.product.name} (${update.oldStock} → ${update.product.stock})`
        );
      }

      console.log(
        `✅ Order created successfully. Stock deducted for ${updates.length} products.`
      );

      // Tiếp tục để json-server lưu order
      next();
    } catch (error) {
      console.error("❌ Error in stock deduction middleware:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  } else {
    // Các request khác không cần xử lý
    next();
  }
}

// Middleware để restore stock khi cancel order
export function stockRestoreMiddleware(req, res, next) {
  // Xử lý PATCH/PUT /orders/:id khi cancel
  if (
    (req.method === "PATCH" || req.method === "PUT") &&
    req.path.startsWith("/orders/")
  ) {
    const updates = req.body;

    // Nếu update trạng thái thành cancelled hoặc returned
    if (
      updates.delivery_status === "cancelled" ||
      updates.delivery_status === "returned"
    ) {
      try {
        const orderId = req.path.split("/")[2];
        const db = req.app.db;
        const order = db.orders.find((o) => o.id === orderId);

        if (!order) {
          return next(); // Order không tồn tại, để json-server xử lý
        }

        // Restore stock
        if (order.items && typeof order.items === "object") {
          for (const [productId, quantity] of Object.entries(order.items)) {
            const product = db.products.find((p) => p.id === productId);
            if (product) {
              product.stock += parseInt(quantity, 10);
              console.log(`✅ Restore stock: ${product.name} (+${quantity})`);
            }
          }

          console.log(
            `✅ Order ${orderId} cancelled/returned. Stock restored.`
          );
        }
      } catch (error) {
        console.error("❌ Error in stock restore middleware:", error);
      }
    }
  }

  next();
}

// Middleware để đồng bộ products sang data/products.json
export function productSyncMiddleware(req, res, next) {
  const isProductRoute =
    req.path === "/products" || req.path.startsWith("/products/");
  const isModifyingRequest = ["POST", "PUT", "PATCH", "DELETE"].includes(
    req.method
  );

  if (!isProductRoute || !isModifyingRequest) {
    return next();
  }

  // Wrap res.json để intercept response và sync sau khi thành công
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Nếu response thành công (status 2xx), sync products
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const db = req.app.db;
        if (db && db.products) {
          syncProductsToFile(db.products);
        }
      } catch (error) {
        console.error("❌ Error in product sync:", error.message);
      }
    }
    return originalJson(body);
  };

  next();
}

// backoffice/dataManager.js - Centralized Data Manager cho CRUD operations
// Quản lý tất cả dữ liệu thông qua thư mục data/

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn đến thư mục data
const DATA_DIR = path.join(__dirname, "data");

// Các file data
const DATA_FILES = {
  products: path.join(DATA_DIR, "products.json"),
  orders: path.join(DATA_DIR, "orders.json"),
  users: path.join(DATA_DIR, "users.json"),
  auditLogs: path.join(DATA_DIR, "auditLogs.json"),
};

// ============ HELPER FUNCTIONS ============

/**
 * Đọc file JSON
 * @param {string} filePath - Đường dẫn file
 * @returns {Promise<Array>} - Dữ liệu từ file
 */
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Ghi file JSON với format đẹp
 * @param {string} filePath - Đường dẫn file
 * @param {any} data - Dữ liệu cần ghi
 */
async function writeJSON(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Tạo ID mới cho entity
 * @param {string} prefix - Prefix cho ID (VD: "ORD", "USR")
 * @returns {string} - ID mới
 */
function generateId(prefix = "ID") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Ghi audit log
 * @param {string} action - Hành động
 * @param {string} user - Người thực hiện
 * @param {object} metadata - Thông tin bổ sung
 */
async function logAction(action, user, metadata = {}) {
  const logs = await readJSON(DATA_FILES.auditLogs);
  const newLog = {
    id: generateId("LOG"),
    action,
    user,
    metadata,
    timestamp: new Date().toISOString(),
  };
  logs.push(newLog);
  await writeJSON(DATA_FILES.auditLogs, logs);
}

// ============ PRODUCTS API ============

export const productsAPI = {
  /**
   * Lấy tất cả sản phẩm
   * @param {object} filters - Bộ lọc (category, status, search)
   * @returns {Promise<Array>}
   */
  async getAll(filters = {}) {
    let products = await readJSON(DATA_FILES.products);

    // Filter by category
    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }

    // Filter by status
    if (filters.status) {
      products = products.filter((p) => p.status === filters.status);
    }

    // Search by name
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchLower)
      );
    }

    return products;
  },

  /**
   * Lấy sản phẩm theo ID
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async getById(id) {
    const products = await readJSON(DATA_FILES.products);
    return products.find((p) => p.id === id) || null;
  },

  /**
   * Tạo sản phẩm mới
   * @param {object} product - Dữ liệu sản phẩm
   * @param {string} user - Người tạo
   * @returns {Promise<object>}
   */
  async create(product, user = "System") {
    const products = await readJSON(DATA_FILES.products);

    // Validate ID unique
    if (products.some((p) => p.id === product.id)) {
      throw new Error(`Product ID ${product.id} already exists`);
    }

    const newProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || "",
      price: Number(product.price),
      unit: product.unit || "gói",
      stock: Number(product.stock) || 0,
      image: product.image || "",
      description: product.description || "",
      popular: Number(product.popular) || 0,
      status: product.status || "active",
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);
    await writeJSON(DATA_FILES.products, products);
    await logAction("create_product", user, { productId: newProduct.id });

    return newProduct;
  },

  /**
   * Cập nhật sản phẩm
   * @param {string} id
   * @param {object} updates - Dữ liệu cập nhật
   * @param {string} user - Người cập nhật
   * @returns {Promise<object>}
   */
  async update(id, updates, user = "System") {
    const products = await readJSON(DATA_FILES.products);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Product ${id} not found`);
    }

    const oldProduct = { ...products[index] };
    products[index] = {
      ...products[index],
      ...updates,
      id: products[index].id, // Không cho đổi ID
      updatedAt: new Date().toISOString(),
    };

    await writeJSON(DATA_FILES.products, products);
    await logAction("update_product", user, {
      productId: id,
      changes: updates,
    });

    return products[index];
  },

  /**
   * Xóa sản phẩm
   * @param {string} id
   * @param {string} user - Người xóa
   * @returns {Promise<boolean>}
   */
  async delete(id, user = "System") {
    const products = await readJSON(DATA_FILES.products);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Product ${id} not found`);
    }

    const deletedProduct = products[index];
    products.splice(index, 1);

    await writeJSON(DATA_FILES.products, products);
    await logAction("delete_product", user, { productId: id });

    return true;
  },

  /**
   * Cập nhật stock
   * @param {string} id
   * @param {number} quantity - Số lượng thay đổi (+ hoặc -)
   * @param {string} user
   * @returns {Promise<object>}
   */
  async updateStock(id, quantity, user = "System") {
    const products = await readJSON(DATA_FILES.products);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Product ${id} not found`);
    }

    const oldStock = products[index].stock;
    products[index].stock = Math.max(0, oldStock + quantity);
    products[index].updatedAt = new Date().toISOString();

    await writeJSON(DATA_FILES.products, products);
    await logAction("update_stock", user, {
      productId: id,
      oldStock,
      newStock: products[index].stock,
      change: quantity,
    });

    return products[index];
  },
};

// ============ ORDERS API ============

export const ordersAPI = {
  /**
   * Lấy tất cả đơn hàng
   * @param {object} filters - Bộ lọc (status, dateFrom, dateTo)
   * @returns {Promise<Array>}
   */
  async getAll(filters = {}) {
    let orders = await readJSON(DATA_FILES.orders);

    // Sort by date desc
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Filter by status
    if (filters.status) {
      orders = orders.filter(
        (o) =>
          o.status === filters.status || o.delivery_status === filters.status
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      orders = orders.filter(
        (o) => new Date(o.createdAt) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      orders = orders.filter(
        (o) => new Date(o.createdAt) <= new Date(filters.dateTo)
      );
    }

    // Filter by customer
    if (filters.customerId) {
      orders = orders.filter((o) => o.customerId === filters.customerId);
    }

    return orders;
  },

  /**
   * Lấy đơn hàng theo ID
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async getById(id) {
    const orders = await readJSON(DATA_FILES.orders);
    return orders.find((o) => o.id === id) || null;
  },

  /**
   * Tạo đơn hàng mới
   * @param {object} order - Dữ liệu đơn hàng
   * @param {string} user - Người tạo
   * @returns {Promise<object>}
   */
  async create(order, user = "Customer") {
    const orders = await readJSON(DATA_FILES.orders);

    const newOrder = {
      id: order.id || generateId("ORD"),
      customerName: order.customerName || "",
      email: order.email || "",
      phone: order.phone || "",
      address: order.address || "",
      items: order.items || [],
      subtotal: Number(order.subtotal) || 0,
      discount: Number(order.discount) || 0,
      shipping_fee: Number(order.shipping_fee) || 0,
      totalAmount: Number(order.totalAmount) || 0,
      status: order.status || "placed",
      delivery_status: order.delivery_status || "placed",
      payment_status: order.payment_status || "pending",
      paymentMethod: order.paymentMethod || "cod",
      note: order.note || "",
      tracking: order.tracking || [
        {
          code: "placed",
          label: "Đã đặt hàng",
          at: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    await writeJSON(DATA_FILES.orders, orders);
    await logAction("create_order", user, {
      orderId: newOrder.id,
      total: newOrder.totalAmount,
    });

    // Chỉ giảm stock nếu KHÔNG phải thanh toán online (pending)
    // Với VNPay pending, sẽ trừ stock khi thanh toán thành công
    const isPendingPayment = newOrder.payment_status === "pending";

    if (!isPendingPayment && Array.isArray(newOrder.items)) {
      for (const item of newOrder.items) {
        try {
          await productsAPI.updateStock(
            item.productId,
            -item.quantity,
            "System"
          );
        } catch (error) {
          console.warn(`Could not update stock for ${item.productId}`);
        }
      }
    }

    return newOrder;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {string} id
   * @param {string} newStatus
   * @param {string} user - Người cập nhật
   * @returns {Promise<object>}
   */
  async updateStatus(id, newStatus, user = "System") {
    const orders = await readJSON(DATA_FILES.orders);
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    const order = orders[index];
    const oldStatus = order.delivery_status || order.status;

    // Update status
    order.status = newStatus;
    order.delivery_status = newStatus;
    order.updatedAt = new Date().toISOString();
    order.updated_by = user;

    // ✅ Tự động đổi payment_status sang "paid" khi giao hàng thành công (delivered)
    // Áp dụng cho COD (chờ thanh toán → đã thanh toán khi giao thành công)
    if (newStatus === "delivered") {
      console.log(
        ` [DEBUG] Order ${id} delivered - Checking payment status...`
      );

      const paymentMethod = (
        order.paymentMethod ||
        order.payment ||
        ""
      ).toUpperCase();
      const currentPaymentStatus = order.payment_status || "pending";

      console.log(
        ` [DEBUG] paymentMethod: "${paymentMethod}", payment_status: "${currentPaymentStatus}"`
      );

      // Nếu là COD hoặc không có payment method (mặc định COD) và chưa paid → đổi thành paid
      const isCOD =
        paymentMethod === "COD" || paymentMethod === "" || !paymentMethod;
      const notPaidYet = currentPaymentStatus !== "paid";

      console.log(` [DEBUG] isCOD: ${isCOD}, notPaidYet: ${notPaidYet}`);

      if (isCOD && notPaidYet) {
        order.payment_status = "paid";
        order.paid_at = new Date().toISOString();
        console.log(` Order ${id}: Auto-marked as paid (COD delivered)`);
      } else {
        console.log(
          ` Order ${id}: NOT marking as paid (isCOD: ${isCOD}, notPaidYet: ${notPaidYet})`
        );
      }
      // VNPay thì đã được xử lý bởi vnpay-return.html, không cần xử lý ở đây
    }

    // Update tracking
    if (!order.tracking) order.tracking = [];

    const trackingMap = {
      placed: { code: "placed", label: "Đã đặt hàng" },
      pending: { code: "pending", label: "Chờ xử lý" },
      confirmed: { code: "confirmed", label: "Đã xác nhận" },
      preparing: { code: "preparing", label: "Đang chuẩn bị" },
      ready: { code: "ready", label: "Sẵn sàng giao" },
      pickup: { code: "pickup", label: "Shipper đã nhận" },
      delivering: { code: "delivering", label: "Đang giao" },
      delivered: { code: "delivered", label: "Giao thành công" },
      cancelled: { code: "cancelled", label: "Đã hủy đơn" },
      returned: { code: "returned", label: "Đã trả hàng" },
    };

    const trackingEntry = trackingMap[newStatus];
    if (trackingEntry) {
      const existingIndex = order.tracking.findIndex(
        (t) => t.code === trackingEntry.code
      );
      if (existingIndex >= 0) {
        order.tracking[existingIndex].at = new Date().toISOString();
      } else {
        order.tracking.push({
          ...trackingEntry,
          at: new Date().toISOString(),
        });
      }
    }

    await writeJSON(DATA_FILES.orders, orders);
    await logAction("update_order_status", user, {
      orderId: id,
      oldStatus,
      newStatus,
    });

    return order;
  },

  /**
   * Cập nhật đơn hàng
   * @param {string} id
   * @param {object} updates
   * @param {string} user
   * @returns {Promise<object>}
   */
  async update(id, updates, user = "System") {
    const orders = await readJSON(DATA_FILES.orders);
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    orders[index] = {
      ...orders[index],
      ...updates,
      id: orders[index].id, // Không đổi ID
      updatedAt: new Date().toISOString(),
      updated_by: user,
    };

    await writeJSON(DATA_FILES.orders, orders);
    await logAction("update_order", user, {
      orderId: id,
      changes: updates,
    });

    return orders[index];
  },

  /**
   * Xóa đơn hàng
   * @param {string} id
   * @param {string} user
   * @returns {Promise<boolean>}
   */
  async delete(id, user = "System") {
    const orders = await readJSON(DATA_FILES.orders);
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    orders.splice(index, 1);
    await writeJSON(DATA_FILES.orders, orders);
    await logAction("delete_order", user, { orderId: id });

    return true;
  },

  /**
   * Đánh dấu đơn hàng đã thanh toán và trừ stock
   * @param {string} id - Order ID
   * @param {string} user - User thực hiện
   * @returns {Promise<object>}
   */
  async markAsPaid(id, user = "System") {
    const orders = await readJSON(DATA_FILES.orders);
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    const order = orders[index];

    // Kiểm tra nếu đã thanh toán rồi thì không xử lý nữa
    if (order.payment_status === "paid") {
      console.log(`Order ${id} already paid, skipping stock deduction`);
      return order;
    }

    // Cập nhật payment status
    order.payment_status = "paid";
    order.updatedAt = new Date().toISOString();
    order.paid_at = new Date().toISOString();
    order.updated_by = user;

    // Trừ stock của các sản phẩm
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        try {
          await productsAPI.updateStock(
            item.productId,
            -item.quantity,
            "PaymentSystem"
          );
          console.log(
            `✅ Reduced stock for ${item.productId}: -${item.quantity}`
          );
        } catch (error) {
          console.error(
            `❌ Could not update stock for ${item.productId}:`,
            error.message
          );
        }
      }
    }

    await writeJSON(DATA_FILES.orders, orders);
    await logAction("mark_order_paid", user, {
      orderId: id,
      totalAmount: order.totalAmount,
    });

    return order;
  },

  /**
   * Đánh dấu đơn hàng thanh toán thất bại/hủy
   * @param {string} id - Order ID
   * @param {string} reason - Lý do thất bại
   * @param {string} user - User thực hiện
   * @returns {Promise<object>}
   */
  async markAsPaymentFailed(id, reason = "Payment failed", user = "System") {
    const orders = await readJSON(DATA_FILES.orders);
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    const order = orders[index];

    // Cập nhật trạng thái
    order.payment_status = "failed";
    order.status = "cancelled";
    order.delivery_status = "cancelled";
    order.payment_failed_reason = reason;
    order.updatedAt = new Date().toISOString();
    order.updated_by = user;

    // Thêm vào tracking
    if (!order.tracking) order.tracking = [];
    order.tracking.push({
      code: "payment_failed",
      label: `Thanh toán thất bại: ${reason}`,
      at: new Date().toISOString(),
    });

    await writeJSON(DATA_FILES.orders, orders);
    await logAction("mark_order_payment_failed", user, {
      orderId: id,
      reason,
    });

    return order;
  },
};

// ============ USERS API ============

export const usersAPI = {
  /**
   * Lấy tất cả users
   * @returns {Promise<Array>}
   */
  async getAll() {
    return await readJSON(DATA_FILES.users);
  },

  /**
   * Lấy user theo ID
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  async getById(id) {
    const users = await readJSON(DATA_FILES.users);
    return users.find((u) => u.id === id) || null;
  },

  /**
   * Lấy user theo email
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async getByEmail(email) {
    const users = await readJSON(DATA_FILES.users);
    return users.find((u) => u.email === email) || null;
  },

  /**
   * Tạo user mới
   * @param {object} user
   * @param {string} creator
   * @returns {Promise<object>}
   */
  async create(user, creator = "System") {
    const users = await readJSON(DATA_FILES.users);

    // Check email unique
    if (users.some((u) => u.email === user.email)) {
      throw new Error(`Email ${user.email} already exists`);
    }

    // Find max ID
    const maxId = users.length > 0 ? Math.max(...users.map((u) => u.id)) : 0;

    const newUser = {
      id: maxId + 1,
      email: user.email,
      name: user.name || "",
      role: user.role || "Staff",
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    users.push(newUser);
    await writeJSON(DATA_FILES.users, users);
    await logAction("create_user", creator, { userId: newUser.id });

    return newUser;
  },

  /**
   * Cập nhật user
   * @param {number} id
   * @param {object} updates
   * @param {string} updater
   * @returns {Promise<object>}
   */
  async update(id, updates, updater = "System") {
    const users = await readJSON(DATA_FILES.users);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      throw new Error(`User ${id} not found`);
    }

    users[index] = {
      ...users[index],
      ...updates,
      id: users[index].id, // Không đổi ID
      updatedAt: new Date().toISOString(),
    };

    await writeJSON(DATA_FILES.users, users);
    await logAction("update_user", updater, {
      userId: id,
      changes: updates,
    });

    return users[index];
  },

  /**
   * Xóa user
   * @param {number} id
   * @param {string} deleter
   * @returns {Promise<boolean>}
   */
  async delete(id, deleter = "System") {
    const users = await readJSON(DATA_FILES.users);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      throw new Error(`User ${id} not found`);
    }

    users.splice(index, 1);
    await writeJSON(DATA_FILES.users, users);
    await logAction("delete_user", deleter, { userId: id });

    return true;
  },

  /**
   * Update last login
   * @param {string} email
   * @returns {Promise<object>}
   */
  async updateLastLogin(email) {
    const users = await readJSON(DATA_FILES.users);
    const index = users.findIndex((u) => u.email === email);

    if (index === -1) {
      throw new Error(`User ${email} not found`);
    }

    users[index].lastLogin = new Date().toISOString();
    await writeJSON(DATA_FILES.users, users);

    return users[index];
  },
};

// ============ AUDIT LOGS API ============

export const auditLogsAPI = {
  /**
   * Lấy tất cả audit logs
   * @param {number} limit - Giới hạn số lượng
   * @returns {Promise<Array>}
   */
  async getAll(limit = 100) {
    const logs = await readJSON(DATA_FILES.auditLogs);
    return logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },

  /**
   * Lấy logs theo user
   * @param {string} user
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getByUser(user, limit = 50) {
    const logs = await readJSON(DATA_FILES.auditLogs);
    return logs
      .filter((log) => log.user === user || log.who === user)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },

  /**
   * Lấy logs theo action
   * @param {string} action
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getByAction(action, limit = 50) {
    const logs = await readJSON(DATA_FILES.auditLogs);
    return logs
      .filter((log) => log.action === action)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },

  /**
   * Ghi log mới
   * @param {string} action
   * @param {string} user
   * @param {object} metadata
   * @returns {Promise<object>}
   */
  async log(action, user, metadata = {}) {
    return await logAction(action, user, metadata);
  },
};

// ============ STATISTICS API ============

export const statsAPI = {
  /**
   * Lấy thống kê tổng quan
   * @returns {Promise<object>}
   */
  async getDashboard() {
    const [products, orders, users] = await Promise.all([
      productsAPI.getAll(),
      ordersAPI.getAll(),
      usersAPI.getAll(),
    ]);

    const totalRevenue = orders
      .filter((o) => o.delivery_status === "delivered")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(
      (o) => o.createdAt && o.createdAt.slice(0, 10) === today
    );

    return {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.status === "active").length,
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      todayRevenue: todayOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
      ),
      pendingOrders: orders.filter(
        (o) => o.delivery_status === "placed" || o.delivery_status === "pending"
      ).length,
      deliveringOrders: orders.filter((o) => o.delivery_status === "delivering")
        .length,
      totalUsers: users.length,
      lowStockProducts: products.filter((p) => p.stock < 10).length,
    };
  },

  /**
   * Thống kê doanh thu theo tháng
   * @param {number} year
   * @returns {Promise<Array>}
   */
  async getRevenueByMonth(year = new Date().getFullYear()) {
    const orders = await ordersAPI.getAll();
    const monthlyRevenue = Array(12).fill(0);

    orders.forEach((order) => {
      if (!order.createdAt) return; // Skip orders without createdAt

      const date = new Date(order.createdAt);
      if (
        date.getFullYear() === year &&
        (order.delivery_status === "delivered" || order.status === "delivered")
      ) {
        monthlyRevenue[date.getMonth()] += order.totalAmount || 0;
      }
    });

    return monthlyRevenue;
  },

  /**
   * Top sản phẩm bán chạy
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getTopProducts(limit = 10) {
    const orders = await ordersAPI.getAll();
    const productSales = {};

    orders.forEach((order) => {
      if (order.delivery_status === "delivered" && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              id: item.productId,
              name: item.productName,
              totalQuantity: 0,
              totalRevenue: 0,
            };
          }
          productSales[item.productId].totalQuantity += item.quantity;
          productSales[item.productId].totalRevenue += item.subtotal;
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  },
};

// Export default object
export default {
  productsAPI,
  ordersAPI,
  usersAPI,
  auditLogsAPI,
  statsAPI,
  DATA_FILES,
  readJSON,
  writeJSON,
  generateId,
};

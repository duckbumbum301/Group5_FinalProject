// backoffice/api.js - API Wrapper cho JSON Server

const API_URL = "http://localhost:3000";

// ========== HELPER FUNCTIONS ==========
async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// ========== PRODUCTS API ==========
export const productsAPI = {
  // Lấy tất cả sản phẩm
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? "?" + query : ""}`);
  },

  // Lấy sản phẩm theo ID
  async getById(id) {
    return request(`/products/${id}`);
  },

  // Tạo sản phẩm mới
  async create(product) {
    return request("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  },

  // Cập nhật toàn bộ sản phẩm
  async update(id, product) {
    return request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  },

  // Cập nhật một phần (chỉ stock chẳng hạn)
  async patch(id, updates) {
    return request(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  // Xóa sản phẩm
  async delete(id) {
    return request(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // Filter theo category
  async getByCategory(category) {
    return request(`/products?cat=${encodeURIComponent(category)}`);
  },

  // Search theo tên
  async search(query) {
    return request(`/products?name_like=${encodeURIComponent(query)}`);
  },

  // Pagination
  async getPaginated(page = 1, limit = 10) {
    return request(`/products?_page=${page}&_limit=${limit}`);
  },
};

// ========== ORDERS API ==========
export const ordersAPI = {
  async getAll(params = {}) {
    const defaultParams = {
      _sort: "created_at",
      _order: "desc",
      ...params,
    };
    const query = new URLSearchParams(defaultParams).toString();
    return request(`/orders${query ? "?" + query : ""}`);
  },

  async getById(id) {
    return request(`/orders/${id}`);
  },

  async create(order) {
    return request("/orders", {
      method: "POST",
      body: JSON.stringify({
        ...order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
  },

  // Cập nhật trạng thái đơn hàng (khớp với frontend API và hỗ trợ old schema)
  async updateStatus(id, newStatus, updatedBy = "Admin") {
    try {
      const order = await this.getById(id);
      if (!order) throw new Error("Order not found");

      const now = new Date().toISOString();
      const tracking = Array.isArray(order.tracking) ? [...order.tracking] : [];

      // Update tracking based on new status
      const trackingMap = {
        pending: { code: "pending", label: "Chờ xử lý", at: now },
        confirmed: { code: "confirmed", label: "Đã xác nhận", at: now },
        preparing: { code: "preparing", label: "Đang chuẩn bị", at: now },
        ready: { code: "ready", label: "Sẵn sàng giao", at: now },
        pickup: { code: "pickup", label: "Shipper đã nhận", at: now },
        delivering: { code: "delivering", label: "Đang giao", at: now },
        delivered: { code: "delivered", label: "Giao thành công", at: now },
        cancelled: { code: "cancelled", label: "Đã hủy đơn", at: now },
        returned: { code: "returned", label: "Đã trả hàng", at: now },
      };

      const trackingEntry = trackingMap[newStatus];
      if (trackingEntry) {
        const existingIdx = tracking.findIndex(
          (t) => t.code === trackingEntry.code
        );
        if (existingIdx >= 0) {
          tracking[existingIdx].at = now;
        } else {
          tracking.push(trackingEntry);
        }
      }

      // Support both old and new schema
      const updates = {
        status: newStatus, // Old schema
        delivery_status: newStatus, // New schema
        tracking,
        updatedAt: now, // Old schema
        updated_at: now, // New schema
        updated_by: updatedBy,
      };

      const result = await request(`/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      // Log audit
      await auditLogsAPI.log("update_order_status", updatedBy, {
        orderId: id,
        oldStatus: order.delivery_status,
        newStatus,
      });

      return result;
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw error;
    }
  },

  // Lấy đơn hàng theo status
  async getByStatus(status) {
    return request(`/orders?delivery_status=${status}`);
  },

  // Lấy đơn hàng theo ngày
  async getByDateRange(startDate, endDate) {
    return request(
      `/orders?created_at_gte=${startDate}&created_at_lte=${endDate}`
    );
  },
};

// ========== USERS API ==========
export const usersAPI = {
  async getAll() {
    return request("/users");
  },

  async getById(id) {
    return request(`/users/${id}`);
  },

  async create(user) {
    return request("/users", {
      method: "POST",
      body: JSON.stringify({
        ...user,
        createdAt: new Date().toISOString(),
      }),
    });
  },

  async update(id, user) {
    return request(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(user),
    });
  },

  async delete(id) {
    return request(`/users/${id}`, {
      method: "DELETE",
    });
  },

  // Login (mock - chỉ kiểm tra email tồn tại)
  async login(email, password) {
    const users = await request(`/users?email=${encodeURIComponent(email)}`);
    if (users.length > 0) {
      const user = users[0];
      // Cập nhật lastLogin
      await request(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          lastLogin: new Date().toISOString(),
        }),
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: `mock-jwt-${user.id}-${Date.now()}`,
      };
    }
    throw new Error("Invalid credentials");
  },
};

// ========== AUDIT LOGS API ==========
export const auditLogsAPI = {
  async getAll(params = {}) {
    const defaultParams = {
      _sort: "timestamp",
      _order: "desc",
      _limit: 100,
      ...params,
    };
    const query = new URLSearchParams(defaultParams).toString();
    return request(`/auditLogs${query ? "?" + query : ""}`);
  },

  async log(action, who = "System", metadata = {}) {
    return request("/auditLogs", {
      method: "POST",
      body: JSON.stringify({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        action,
        who,
        metadata,
        timestamp: new Date().toISOString(),
      }),
    });
  },

  // Lấy logs theo user
  async getByUser(who) {
    return request(
      `/auditLogs?who=${encodeURIComponent(who)}&_sort=timestamp&_order=desc`
    );
  },

  // Lấy logs theo action
  async getByAction(action) {
    return request(`/auditLogs?action=${action}&_sort=timestamp&_order=desc`);
  },

  // Lấy logs trong khoảng thời gian
  async getByDateRange(startDate, endDate) {
    return request(
      `/auditLogs?timestamp_gte=${startDate}&timestamp_lte=${endDate}&_sort=timestamp&_order=desc`
    );
  },
};

// ========== STATISTICS API (Tính toán từ data) ==========
export const statsAPI = {
  async getDashboard() {
    const [products, orders, users] = await Promise.all([
      productsAPI.getAll(),
      ordersAPI.getAll(),
      usersAPI.getAll(),
    ]);

    // Tính toán thống kê
    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed"
    ).length;
    const confirmedOrders = orders.filter(
      (o) => o.status === "confirmed"
    ).length;
    const shippingOrders = orders.filter((o) => o.status === "shipping").length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      shippingOrders,
      completedOrders,
      totalProducts: products.length,
      totalUsers: users.length,
    };
  },

  async getRevenueByMonth(year = new Date().getFullYear()) {
    const orders = await ordersAPI.getAll();
    const monthlyRevenue = Array(12).fill(0);

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      if (date.getFullYear() === year && order.status === "completed") {
        monthlyRevenue[date.getMonth()] += order.totalAmount;
      }
    });

    return monthlyRevenue;
  },

  async getTopProducts(limit = 10) {
    const orders = await ordersAPI.getAll();
    const productSales = {};

    orders.forEach((order) => {
      if (order.status === "completed") {
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

  async getRecentOrders(limit = 5) {
    const orders = await ordersAPI.getAll({
      _sort: "createdAt",
      _order: "desc",
      _limit: limit,
    });
    return orders;
  },
};

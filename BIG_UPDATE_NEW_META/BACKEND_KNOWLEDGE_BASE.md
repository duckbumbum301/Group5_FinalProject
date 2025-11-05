# 📚 Backend Knowledge Base - Vựa Vui Vẻ

> **Tài liệu tổng hợp kiến thức Backend**  
> Dự án: Vựa Vui Vẻ E-commerce Platform  
> Ngày cập nhật: 05/11/2025

---

## 📖 MỤC LỤC

1. [Tổng quan kiến trúc Backend](#1-tổng-quan-kiến-trúc-backend)
2. [Công nghệ & Framework](#2-công-nghệ--framework)
3. [Cấu trúc thư mục Backend](#3-cấu-trúc-thư-mục-backend)
4. [Chi tiết từng File Backend](#4-chi-tiết-từng-file-backend)
5. [Flow xử lý dữ liệu](#5-flow-xử-lý-dữ-liệu)
6. [Kiến thức đã áp dụng](#6-kiến-thức-đã-áp-dụng)
7. [API Endpoints](#7-api-endpoints)

---

## 1. TỔNG QUAN KIẾN TRÚC BACKEND

### 🎯 Mô hình kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  (HTML/CSS/JS - Port 5503)                             │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Requests
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  JSON SERVER API                        │
│                  (Port 3000)                            │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Custom Middlewares                               │ │
│  │  - Stock Deduction (Trừ kho tự động)            │ │
│  │  - Stock Restore (Hoàn kho khi hủy)             │ │
│  │  - Product Sync (Đồng bộ sản phẩm)              │ │
│  └───────────────────────────────────────────────────┘ │
│                         ↓                               │
│  ┌───────────────────────────────────────────────────┐ │
│  │         JSON Server Router                        │ │
│  │  Auto REST API: GET, POST, PUT, PATCH, DELETE    │ │
│  └───────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │ Read/Write
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  db.json (JSON Server Database)                │   │
│  │  - products: 86 sản phẩm                        │   │
│  │  - orders: Đơn hàng                             │   │
│  │  - users: Người dùng                            │   │
│  │  - auditLogs: Lịch sử thao tác                  │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  data/ folder (File-based backup)              │   │
│  │  - products.json (Đồng bộ tự động)             │   │
│  │  - orders.json                                  │   │
│  │  - users.json                                   │   │
│  │  - auditLogs.json                               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 🔑 Đặc điểm kiến trúc

- **Zero-code REST API**: Dùng JSON Server, không cần viết code CRUD thủ công
- **Middleware Pattern**: Xử lý business logic (trừ kho, hoàn kho) trước khi vào database
- **Dual Storage**: db.json (chính) + data/ folder (backup/sync)
- **File-based Database**: Phù hợp cho prototype và development
- **Auto-sync**: Thay đổi trong db.json tự động sync sang data/ folder

---

## 2. CÔNG NGHỆ & FRAMEWORK

### 📦 Dependencies chính

```json
{
  "json-server": "^0.17.4", // REST API server
  "express": "^4.18.2", // Web framework (nền tảng của json-server)
  "cors": "^2.8.5", // Cross-Origin Resource Sharing
  "dotenv": "^16.0.3" // Environment variables
}
```

### 🛠️ Công nghệ áp dụng

| Công nghệ              | Mục đích            | Kiến thức liên quan                                    |
| ---------------------- | ------------------- | ------------------------------------------------------ |
| **Node.js**            | Runtime environment | JavaScript Server-side, Event-driven, Non-blocking I/O |
| **ES6 Modules**        | Module system       | import/export, \_\_dirname with fileURLToPath          |
| **JSON Server**        | Auto REST API       | RESTful principles, HTTP methods, JSON format          |
| **Express Middleware** | Request processing  | Middleware pattern, req/res/next cycle                 |
| **File System (fs)**   | File operations     | Async/Sync file I/O, JSON parsing                      |
| **Path Module**        | File path handling  | Cross-platform path resolution                         |

---

## 3. CẤU TRÚC THƯ MỤC BACKEND

```
backoffice/
├── 📄 server-simple.js          # Main server entry point
├── 📄 server-middleware.js      # Custom middleware logic
├── 📄 dataManager.js            # Data management utilities
├── 📄 api.js                    # API wrapper cho backoffice UI
├── 📄 app.js                    # Backoffice frontend app
├── 📄 index.html                # Backoffice UI
├── 📄 sync-products.js          # Script đồng bộ products
├── 📄 db.json                   # Main database (JSON Server)
│
└── data/                        # Backup & alternative storage
    ├── products.json            # Products backup (auto-sync)
    ├── orders.json              # Orders backup
    ├── users.json               # Users backup
    └── auditLogs.json           # Audit logs backup
```

---

## 4. CHI TIẾT TỪNG FILE BACKEND

### 📄 **server-simple.js** - Main Server Entry Point

**Vai trò**: Server chính, khởi động JSON Server với các middleware tùy chỉnh

#### Kiến thức áp dụng:

1. **JSON Server Setup**

```javascript
import jsonServer from "json-server";

const server = jsonServer.create(); // Tạo Express app
const router = jsonServer.router("db.json"); // Router tự động từ db.json
const middlewares = jsonServer.defaults(); // Default middlewares (CORS, static files)
```

2. **ES6 Module Path Resolution**

```javascript
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

> **Lý do**: ES6 modules không có `__dirname` sẵn như CommonJS

3. **Middleware Chaining**

```javascript
server.use(middlewares); // 1. Default middlewares
server.use(jsonServer.bodyParser); // 2. Parse JSON body
server.use((req, res, next) => {
  // 3. Custom logging
  console.log(`${req.method} ${req.url}`);
  next();
});
server.use(stockDeductionMiddleware); // 4. Business logic
server.use(stockRestoreMiddleware); // 5. Business logic
server.use(router); // 6. JSON Server router
```

> **Pattern**: Middleware stack - xử lý tuần tự từ trên xuống

4. **Database Exposure to Middleware**

```javascript
server.use((req, res, next) => {
  req.app.db = router.db.getState(); // Expose database state
  next();
});
```

> **Mục đích**: Cho phép middleware truy cập database trong memory

5. **Custom Router Render Hook**

```javascript
router.render = (req, res) => {
  // Custom logic sau khi JSON Server xử lý
  if (isProductRoute && isModifyingRequest) {
    syncProductsToFile(db.products); // Đồng bộ ra file
  }
  res.jsonp(res.locals.data); // Trả response
};
```

> **Pattern**: Hook vào lifecycle của JSON Server

#### Chức năng chính:

- ✅ Khởi động server trên port 3000
- ✅ Load database từ `db.json`
- ✅ Apply custom middlewares
- ✅ Tạo REST API tự động cho collections
- ✅ Sync products ra file khi có thay đổi
- ✅ Logging các requests

---

### 📄 **server-middleware.js** - Custom Business Logic

**Vai trò**: Xử lý logic nghiệp vụ (business logic) trước khi data vào database

#### Kiến thức áp dụng:

1. **Middleware Pattern**

```javascript
export function stockDeductionMiddleware(req, res, next) {
  // Kiểm tra điều kiện
  if (req.method === "POST" && req.path === "/orders") {
    // Xử lý logic
    // ...
    next(); // Tiếp tục hoặc return error
  } else {
    next(); // Bỏ qua
  }
}
```

> **Pattern**: Interceptor - chặn và xử lý request trước khi đến router

2. **Transaction-like Processing**

```javascript
// 1. Validate tất cả items trước
for (const item of itemsArray) {
  if (product.stock < item.quantity) {
    errors.push(`Không đủ hàng`);
  }
}

// 2. Nếu có lỗi, rollback (không làm gì)
if (errors.length > 0) {
  return res.status(400).json({ error: "Validation failed" });
}

// 3. Nếu OK, apply tất cả updates
for (const update of updates) {
  update.product.stock -= update.quantity;
}
```

> **Pattern**: Optimistic validation - kiểm tra hết rồi mới thực hiện

3. **In-Memory Database Mutation**

```javascript
const db = req.app.db; // Get database state từ memory
const product = db.products.find((p) => p.id === item.productId);
product.stock -= item.quantity; // Trực tiếp sửa object trong memory
```

> **Lưu ý**: JSON Server tự động persist thay đổi vào db.json

4. **Error Handling Strategy**

```javascript
try {
  // Business logic
  next(); // Success - tiếp tục
} catch (error) {
  console.error("Error:", error);
  return res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
}
```

#### Các Middleware:

| Middleware                 | Kích hoạt                       | Chức năng                          |
| -------------------------- | ------------------------------- | ---------------------------------- |
| `stockDeductionMiddleware` | POST /orders                    | Trừ stock tự động khi tạo đơn hàng |
| `stockRestoreMiddleware`   | PATCH/PUT /orders/:id           | Hoàn stock khi hủy/trả đơn         |
| `productSyncMiddleware`    | POST/PUT/PATCH/DELETE /products | Đồng bộ products sang file         |

#### Logic chi tiết:

**A. Stock Deduction (Trừ kho)**

```javascript
// Input: { items: { "100": 2, "101": 3 } }
// Process:
// 1. Validate sản phẩm tồn tại
// 2. Validate stock đủ
// 3. Nếu OK: Trừ stock của tất cả items
// 4. Nếu fail: Trả lỗi, không tạo order
```

**B. Stock Restore (Hoàn kho)**

```javascript
// Trigger: delivery_status = "cancelled" hoặc "returned"
// Process:
// 1. Tìm order theo ID
// 2. Lấy items từ order
// 3. Cộng lại stock cho mỗi product
```

**C. Product Sync**

```javascript
// Trigger: Bất kỳ thay đổi nào ở /products
// Process:
// 1. Wrap res.json() để intercept response
// 2. Nếu status 2xx: Ghi db.products ra data/products.json
```

---

### 📄 **dataManager.js** - Data Management Layer

**Vai trò**: Alternative API layer, quản lý data qua file system thay vì JSON Server

#### Kiến thức áp dụng:

1. **File-based CRUD với Promises**

```javascript
import fs from "fs/promises"; // Async file operations

async function readJSON(filePath) {
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}

async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
```

> **Pattern**: Async/Await cho I/O operations

2. **Module Export Pattern**

```javascript
export const productsAPI = {
  async getAll(filters = {}) {
    /* ... */
  },
  async getById(id) {
    /* ... */
  },
  async create(product, user) {
    /* ... */
  },
  async update(id, updates, user) {
    /* ... */
  },
  async delete(id, user) {
    /* ... */
  },
};

export const ordersAPI = {
  /* ... */
};
export const usersAPI = {
  /* ... */
};
```

> **Pattern**: Namespace pattern - group related functions

3. **Filtering & Search**

```javascript
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
}
```

> **Pattern**: Chain filtering - filter từng bước

4. **ID Generation**

```javascript
function generateId(prefix = "ID") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
// Example: "ORD-1699123456789-X7K2M"
```

> **Pattern**: Timestamp + Random = Unique ID

5. **Audit Logging**

```javascript
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
```

> **Pattern**: Audit trail - ghi lại mọi thao tác

#### Module structure:

```javascript
dataManager.js
├── Helper Functions
│   ├── readJSON()      // Đọc file JSON
│   ├── writeJSON()     // Ghi file JSON
│   ├── generateId()    // Tạo ID unique
│   └── logAction()     // Ghi audit log
│
├── productsAPI         // CRUD cho Products
├── ordersAPI           // CRUD cho Orders
├── usersAPI            // CRUD cho Users
├── auditLogsAPI        // Query audit logs
└── statsAPI            // Thống kê dashboard
```

#### Khi nào dùng dataManager vs JSON Server?

| Tình huống                         | Dùng        |
| ---------------------------------- | ----------- |
| Frontend cần REST API đơn giản     | JSON Server |
| Cần custom business logic phức tạp | dataManager |
| Cần transaction-like behavior      | dataManager |
| Cần audit logging chi tiết         | dataManager |
| Development/Testing nhanh          | JSON Server |

---

### 📄 **api.js** - Backoffice API Wrapper

**Vai trò**: API wrapper cho backoffice UI, gọi đến JSON Server

#### Kiến thức áp dụng:

1. **Fetch API Pattern**

```javascript
export async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:3000/products");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Fallback
  }
}
```

2. **HTTP Methods với Fetch**

```javascript
// GET
const data = await fetch(url).then((r) => r.json());

// POST
const created = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
}).then((r) => r.json());

// PATCH
const updated = await fetch(`${url}/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updates),
}).then((r) => r.json());

// DELETE
await fetch(`${url}/${id}`, { method: "DELETE" });
```

#### Chức năng:

- Wrapper functions cho tất cả CRUD operations
- Error handling và fallback
- Type safety (JSDoc comments)
- Abstraction layer giữa UI và API

---

### 📄 **app.js** - Backoffice Frontend Application

**Vai trò**: Single Page Application (SPA) cho quản lý backoffice

#### Kiến thức áp dụng:

1. **Client-side Routing**

```javascript
const routes = {};

function route(path, handler) {
  routes[path] = handler;
}

function go(path) {
  location.hash = path;
}

window.addEventListener("hashchange", () => {
  const hash = location.hash || "#/dashboard";
  const handler = routes[hash] || routes["#/dashboard"];
  handler();
});

// Usage:
route("#/products", () => renderProducts());
route("#/orders", () => renderOrders());
```

> **Pattern**: Hash-based routing (SPA without backend routing)

2. **Mock Authentication**

```javascript
const auth = {
  current() {
    return JSON.parse(localStorage.getItem("vvv_session"));
  },
  login({ email, role }) {
    const session = { email, role, ts: Date.now() };
    localStorage.setItem("vvv_session", JSON.stringify(session));
    return session;
  },
  logout() {
    localStorage.removeItem("vvv_session");
  },
  guard() {
    if (!this.current()) {
      location.hash = "#/login";
    }
  },
};
```

> **Pattern**: Guard pattern - bảo vệ routes

3. **Role-Based Access Control (RBAC)**

```javascript
function render() {
  const sess = auth.current();

  // Show/hide based on role
  document.querySelectorAll(".admin-only").forEach((el) => {
    el.style.display = sess?.role === "Admin" ? "block" : "none";
  });

  // Guard protected routes
  if (hash === "#/audit" && sess?.role !== "Admin") {
    alert("Chỉ Admin mới có quyền truy cập");
    go("#/dashboard");
  }
}
```

4. **CSV Export**

```javascript
function exportCSV(rows, filename) {
  const csv = rows
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
```

#### Chức năng chính:

- Dashboard với thống kê
- Quản lý đơn hàng (cập nhật trạng thái)
- Quản lý sản phẩm (CRUD)
- Quản lý người dùng
- Audit log viewer (Admin only)
- Export CSV

---

### 📄 **db.json** - JSON Server Database

**Vai trò**: Main database file cho JSON Server

#### Cấu trúc:

```json
{
  "products": [
    {
      "id": "100",
      "name": "Rau muống (500g)",
      "category": "veg",
      "subcategory": "leaf",
      "price": 13000,
      "stock": 50,
      "status": "active",
      "image": "../images/VEG/leaf/raumuong.jpg",
      "description": "Rau muống tươi ngon",
      "popular": 95
    }
  ],
  "orders": [
    {
      "id": "ORD-20251105-152641-5XH34U",
      "customer_name": "Quốc Việt",
      "customer_phone": "0123456789",
      "delivery_address": "123 ABC Street",
      "items": { "100": 2, "101": 3 },
      "subtotal": 80000,
      "shipping_fee": 20000,
      "total": 100000,
      "delivery_status": "placed",
      "payment_method": "cod",
      "created_at": "2025-11-05T08:26:41.123Z"
    }
  ],
  "users": [
    {
      "id": "1730000000000",
      "email": "admin@vuavuive.com",
      "phone": "0987654321",
      "password": "123456",
      "name": "Admin User",
      "role": "Admin"
    }
  ],
  "auditLogs": [
    {
      "id": "LOG-1730000000000-ABC123",
      "action": "order.create",
      "who": "customer@email.com",
      "metadata": { "orderId": "ORD-...", "total": 100000 },
      "timestamp": "2025-11-05T08:26:41.123Z"
    }
  ]
}
```

#### Đặc điểm:

- Auto-save: JSON Server tự động ghi thay đổi
- Schema-less: Không cần define schema trước
- Collections: Mỗi key top-level = 1 REST endpoint
- Relationships: Có thể dùng foreign keys (nhưng project này không dùng)

---

### 📁 **data/ folder** - File-based Backup

**Vai trò**: Backup và alternative storage cho data

#### Các file:

- **products.json**: Auto-sync từ db.json khi có thay đổi
- **orders.json**: Manual sync hoặc dùng qua dataManager
- **users.json**: User data backup
- **auditLogs.json**: Audit trail backup

#### Lợi ích:

- Backup tự động
- Có thể dùng dataManager để truy cập trực tiếp
- Dễ version control (Git friendly)
- Có thể restore nếu db.json bị lỗi

---

## 5. FLOW XỬ LÝ DỮ LIỆU

### 🛒 Flow tạo đơn hàng (Order Creation)

```
1. Frontend gửi POST /orders
   {
     customer_name: "Quốc Việt",
     items: { "100": 2, "101": 3 },
     total: 100000
   }
        ↓
2. Server-simple.js nhận request
        ↓
3. stockDeductionMiddleware chặn
   - Validate items tồn tại
   - Kiểm tra stock đủ
   - Nếu OK: Trừ stock trong memory
   - Nếu fail: Return 400 error
        ↓
4. JSON Server Router nhận request
   - Tạo order trong db.json
   - Auto-save db.json
        ↓
5. Response trả về Frontend
   - Order object với ID
        ↓
6. Frontend gọi apiCreateAuditLog()
   - Ghi log "order.create"
```

### ❌ Flow hủy đơn hàng (Order Cancellation)

```
1. Admin/Customer gửi PATCH /orders/:id
   { delivery_status: "cancelled" }
        ↓
2. stockRestoreMiddleware chặn
   - Tìm order theo ID
   - Lấy items từ order
   - Cộng lại stock cho mỗi product
        ↓
3. JSON Server Router cập nhật order
   - Update delivery_status trong db.json
        ↓
4. Response trả về
```

### 🔄 Flow đồng bộ sản phẩm (Product Sync)

```
1. Admin tạo/sửa/xóa product qua backoffice
        ↓
2. POST/PATCH/DELETE /products
        ↓
3. productSyncMiddleware chặn
   - Wrap res.json()
        ↓
4. JSON Server xử lý request
   - Update db.json
        ↓
5. Response được gửi đi
        ↓
6. productSyncMiddleware intercept response
   - Nếu status 2xx:
     * Đọc db.products
     * Ghi ra data/products.json
```

### 🔍 Flow tra cứu sản phẩm (Product Query)

```
Option 1: Qua JSON Server (Nhanh, đơn giản)
Frontend → GET /products → JSON Server → db.json → Response

Option 2: Qua dataManager (Custom logic)
Backoffice → productsAPI.getAll() → readJSON() → data/products.json → Response
```

---

## 6. KIẾN THỨC ĐÃ ÁP DỤNG

### 🎓 Kiến thức Lập trình

#### A. JavaScript/Node.js

| Kiến thức             | Áp dụng ở đâu          | Mô tả                           |
| --------------------- | ---------------------- | ------------------------------- |
| **ES6 Modules**       | Tất cả files           | import/export thay vì require   |
| **Async/Await**       | dataManager.js         | Xử lý I/O bất đồng bộ           |
| **Promises**          | api.js, dataManager.js | Fetch API, fs promises          |
| **Arrow Functions**   | Khắp nơi               | Syntax ngắn gọn cho functions   |
| **Destructuring**     | server-middleware.js   | `const { items } = req.body`    |
| **Template Literals** | app.js                 | `` `Product ${id}` ``           |
| **Spread Operator**   | dataManager.js         | `{ ...product, ...updates }`    |
| **Array Methods**     | Khắp nơi               | filter, map, find, reduce       |
| **Object Methods**    | server-middleware.js   | Object.entries(), Object.keys() |

#### B. Node.js Core Modules

| Module   | Sử dụng        | Mục đích                      |
| -------- | -------------- | ----------------------------- |
| **fs**   | dataManager.js | File I/O operations           |
| **path** | Khắp nơi       | Cross-platform path handling  |
| **url**  | Tất cả files   | fileURLToPath cho ES6 modules |

#### C. HTTP & REST

| Khái niệm            | Áp dụng                                                    |
| -------------------- | ---------------------------------------------------------- |
| **HTTP Methods**     | GET (read), POST (create), PATCH (update), DELETE (delete) |
| **Status Codes**     | 200 (OK), 400 (Bad Request), 404 (Not Found), 500 (Error)  |
| **RESTful API**      | `/products`, `/products/:id`, `/orders`                    |
| **Request/Response** | Express req, res objects                                   |
| **JSON Format**      | Data interchange format                                    |
| **CORS**             | Cross-Origin Resource Sharing                              |

### 🏗️ Software Design Patterns

| Pattern                | Áp dụng ở đâu        | Giải thích                         |
| ---------------------- | -------------------- | ---------------------------------- |
| **Middleware Pattern** | server-middleware.js | Interceptor cho request processing |
| **Repository Pattern** | dataManager.js       | Data access abstraction            |
| **Singleton Pattern**  | db.json              | Single source of truth             |
| **Observer Pattern**   | router.render hook   | Hook vào lifecycle                 |
| **Factory Pattern**    | generateId()         | Tạo ID theo pattern                |
| **Guard Pattern**      | auth.guard()         | Bảo vệ routes                      |
| **Facade Pattern**     | api.js               | Simplify API calls                 |

### 🔧 Backend Concepts

| Khái niệm          | Giải thích                            | Áp dụng                     |
| ------------------ | ------------------------------------- | --------------------------- |
| **REST API**       | Representational State Transfer       | JSON Server auto-generates  |
| **CRUD**           | Create, Read, Update, Delete          | Tất cả operations           |
| **Middleware**     | Functions xử lý request trước handler | Stock deduction/restore     |
| **Routing**        | Map URLs to handlers                  | JSON Server router          |
| **Database**       | Data storage                          | db.json, data/ folder       |
| **ORM/ODM**        | Object mapping (không dùng)           | Direct JSON access thay thế |
| **Authentication** | Xác thực user (mock)                  | localStorage-based          |
| **Authorization**  | Phân quyền (RBAC)                     | Role-based access           |
| **Audit Trail**    | Ghi lại thao tác                      | auditLogs collection        |
| **Transaction**    | Atomic operations (giả lập)           | Validate all → Apply all    |
| **Idempotency**    | Request có thể repeat                 | PATCH, PUT, DELETE          |

### 📊 Data Management

| Khái niệm        | Áp dụng                       |
| ---------------- | ----------------------------- |
| **JSON Format**  | Data storage và API format    |
| **Schema-less**  | Không cần define schema trước |
| **Foreign Keys** | Có support nhưng không dùng   |
| **Indexing**     | Không có (small dataset)      |
| **Filtering**    | Client-side & server-side     |
| **Pagination**   | Chưa implement (có thể thêm)  |
| **Sorting**      | Có support trong JSON Server  |
| **Searching**    | Text search trong dataManager |

### 🔐 Security Concepts (Đã nhận diện nhưng chưa implement đầy đủ)

| Khái niệm            | Hiện tại        | Nên có                |
| -------------------- | --------------- | --------------------- |
| **Password Hashing** | ❌ Plain text   | ✅ bcrypt             |
| **JWT**              | ❌ localStorage | ✅ Token-based        |
| **Rate Limiting**    | ❌ Không có     | ✅ express-rate-limit |
| **Input Validation** | ⚠️ Basic        | ✅ express-validator  |
| **SQL Injection**    | ✅ N/A (JSON)   | -                     |
| **XSS Protection**   | ⚠️ Basic escape | ✅ Sanitization       |
| **CORS**             | ✅ Có nhưng mở  | ⚠️ Restrict origins   |

---

## 7. API ENDPOINTS

### 📋 Danh sách Endpoints

#### **Products**

| Method | Endpoint        | Chức năng           | Body           | Query Params                              |
| ------ | --------------- | ------------------- | -------------- | ----------------------------------------- |
| GET    | `/products`     | Lấy tất cả sản phẩm | -              | ?category=veg<br>?status=active<br>?q=rau |
| GET    | `/products/:id` | Lấy 1 sản phẩm      | -              | -                                         |
| POST   | `/products`     | Tạo sản phẩm mới    | Product object | -                                         |
| PATCH  | `/products/:id` | Cập nhật sản phẩm   | Partial update | -                                         |
| PUT    | `/products/:id` | Replace toàn bộ     | Full object    | -                                         |
| DELETE | `/products/:id` | Xóa sản phẩm        | -              | -                                         |

**Example Request:**

```javascript
// GET /products?category=veg&status=active
fetch("http://localhost:3000/products?category=veg&status=active")
  .then((r) => r.json())
  .then((products) => console.log(products));

// POST /products
fetch("http://localhost:3000/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: "500",
    name: "Cải ngọt (500g)",
    category: "veg",
    price: 15000,
    stock: 100,
    status: "active",
  }),
}).then((r) => r.json());
```

#### **Orders**

| Method | Endpoint      | Chức năng           | Body           | Middleware                    |
| ------ | ------------- | ------------------- | -------------- | ----------------------------- |
| GET    | `/orders`     | Lấy tất cả đơn hàng | -              | -                             |
| GET    | `/orders/:id` | Lấy 1 đơn hàng      | -              | -                             |
| POST   | `/orders`     | Tạo đơn hàng        | Order object   | ✅ Stock deduction            |
| PATCH  | `/orders/:id` | Cập nhật đơn hàng   | Partial update | ✅ Stock restore (nếu cancel) |
| DELETE | `/orders/:id` | Xóa đơn hàng        | -              | -                             |

**Example Request:**

```javascript
// POST /orders (Tự động trừ stock)
fetch("http://localhost:3000/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    customer_name: "Nguyễn Văn A",
    customer_phone: "0123456789",
    delivery_address: "123 ABC Street, TP.HCM",
    items: {
      100: 2, // Rau muống x2
      101: 3, // Cải bẹ xanh x3
    },
    subtotal: 90000,
    shipping_fee: 20000,
    total: 110000,
    payment_method: "cod",
  }),
}).then((r) => r.json());

// PATCH /orders/:id (Hủy đơn → Hoàn stock)
fetch("http://localhost:3000/orders/ORD-20251105-152641-5XH34U", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    delivery_status: "cancelled",
  }),
}).then((r) => r.json());
```

#### **Users**

| Method | Endpoint     | Chức năng        |
| ------ | ------------ | ---------------- |
| GET    | `/users`     | Lấy tất cả users |
| GET    | `/users/:id` | Lấy 1 user       |
| POST   | `/users`     | Tạo user mới     |
| PATCH  | `/users/:id` | Cập nhật user    |
| DELETE | `/users/:id` | Xóa user         |

#### **Audit Logs**

| Method | Endpoint         | Chức năng       |
| ------ | ---------------- | --------------- |
| GET    | `/auditLogs`     | Lấy tất cả logs |
| GET    | `/auditLogs/:id` | Lấy 1 log       |
| POST   | `/auditLogs`     | Tạo log mới     |

### 🔍 Query Parameters (JSON Server built-in)

```javascript
// Filter
GET /products?category=veg
GET /orders?delivery_status=placed

// Pagination
GET /products?_page=1&_limit=10

// Sort
GET /products?_sort=price&_order=asc

// Full-text search
GET /products?q=rau

// Operators
GET /products?price_gte=10000&price_lte=50000  // Greater/Less than
GET /products?id_ne=100  // Not equal

// Relationships (nếu có)
GET /orders?_embed=items
```

---

## 8. DEBUGGING & TESTING

### 🐛 Debug Tools

#### A. Server Logs

```bash
# Chạy server với logs
cd backoffice
node server-simple.js

# Output:
GET /products
✅ Trừ stock: Rau muống (50 → 48)
📝 Synced 86 products to data/products.json
```

#### B. Test API với curl

```bash
# Get products
curl http://localhost:3000/products

# Get one product
curl http://localhost:3000/products/100

# Create order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","items":{"100":2},"total":26000}'

# Update order status
curl -X PATCH http://localhost:3000/orders/ORD-123 \
  -H "Content-Type: application/json" \
  -d '{"delivery_status":"cancelled"}'
```

#### C. Test với PowerShell

```powershell
# Get products
curl http://localhost:3000/products | ConvertFrom-Json

# Get orders
curl http://localhost:3000/orders | ConvertFrom-Json | Select-Object -Last 5

# Filter products
curl "http://localhost:3000/products?category=veg" | ConvertFrom-Json
```

### ✅ Testing Checklist

- [ ] Server khởi động thành công
- [ ] GET /products trả về 86 sản phẩm
- [ ] POST /orders trừ stock đúng
- [ ] PATCH /orders với status=cancelled hoàn stock
- [ ] Products tự động sync sang data/products.json
- [ ] Audit logs được tạo khi có thao tác
- [ ] Frontend hiển thị sản phẩm từ API
- [ ] Backoffice CRUD products hoạt động
- [ ] Order management cập nhật trạng thái OK

---

## 9. TROUBLESHOOTING

### ❌ Lỗi thường gặp

#### 1. **Cannot GET /products**

```
Nguyên nhân: Server chưa chạy
Giải pháp: cd backoffice && node server-simple.js
```

#### 2. **EADDRINUSE: Port 3000 already in use**

```powershell
# Kill process đang dùng port 3000
Get-NetTCPConnection -LocalPort 3000 |
  Select-Object -ExpandProperty OwningProcess |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

#### 3. **Stock không được trừ**

```
Nguyên nhân: Middleware không chạy hoặc db.json đã corrupted
Giải pháp:
1. Kiểm tra log console có "✅ Trừ stock" không
2. Restart server
3. Kiểm tra db.json format hợp lệ
```

#### 4. **Products không sync sang data/products.json**

```
Nguyên nhân: Thư mục data/ không tồn tại
Giải pháp: mkdir backoffice/data
```

#### 5. **Frontend không load products**

```
Nguyên nhân: CORS hoặc server không chạy
Giải pháp:
1. Check server đang chạy: curl http://localhost:3000/products
2. Check CORS headers
3. Check frontend đúng URL: http://localhost:3000
```

---

## 10. BEST PRACTICES ĐÃ ÁP DỤNG

### ✅ Code Quality

- **ES6 Modules**: Sử dụng import/export
- **Async/Await**: Thay vì callbacks
- **Error Handling**: try-catch blocks
- **Logging**: Console logs cho debugging
- **Code Comments**: JSDoc cho functions
- **Naming Conventions**: camelCase cho variables, PascalCase cho classes
- **Separation of Concerns**: File riêng cho mỗi chức năng

### ✅ API Design

- **RESTful**: Follow REST principles
- **JSON Format**: Consistent data format
- **HTTP Status Codes**: Correct usage
- **Error Messages**: Descriptive errors
- **Validation**: Check data trước khi process

### ✅ Data Management

- **Single Source of Truth**: db.json là chính
- **Auto-sync**: Backup tự động
- **Audit Trail**: Ghi lại mọi thao tác
- **Data Integrity**: Validate trước khi save

---

## 📚 TÀI LIỆU THAM KHẢO

### Documentation

- **JSON Server**: https://github.com/typicode/json-server
- **Express.js**: https://expressjs.com/
- **Node.js**: https://nodejs.org/docs/
- **MDN Web Docs**: https://developer.mozilla.org/

### Kiến thức mở rộng

- **REST API Design**: https://restfulapi.net/
- **JavaScript Promises**: https://javascript.info/promise-basics
- **Async/Await**: https://javascript.info/async-await
- **ES6 Modules**: https://javascript.info/modules-intro
- **Middleware Pattern**: https://expressjs.com/en/guide/using-middleware.html

---

## 🎯 KẾT LUẬN

Backend của Vựa Vui Vẻ sử dụng **JSON Server** để tạo REST API nhanh chóng, kết hợp với **custom middlewares** để xử lý business logic phức tạp như trừ kho tự động và hoàn kho khi hủy đơn.

### Điểm mạnh:

- ✅ Đơn giản, dễ hiểu, dễ maintain
- ✅ Auto REST API không cần code CRUD
- ✅ Middleware pattern xử lý business logic sạch sẽ
- ✅ Dual storage (db.json + data/) cho backup
- ✅ Audit logging đầy đủ

### Hạn chế cần cải thiện:

- ⚠️ Security: Password hashing, JWT auth, rate limiting
- ⚠️ Validation: Input sanitization chưa đủ mạnh
- ⚠️ Performance: Chưa có caching, pagination
- ⚠️ Database: JSON file không phù hợp production scale

### Phù hợp cho:

- ✅ Prototype & MVP development
- ✅ Learning & education
- ✅ Small to medium projects
- ✅ Development & testing

### Không phù hợp cho:

- ❌ Production với traffic cao
- ❌ Projects cần strong security
- ❌ Real-time applications
- ❌ Big data processing

---

**Tạo bởi:** GitHub Copilot  
**Ngày:** 05/11/2025  
**Phiên bản:** 1.0  
**Dự án:** Vựa Vui Vẻ E-commerce Platform

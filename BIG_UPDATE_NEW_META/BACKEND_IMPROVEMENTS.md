# 🔧 Backend Improvements Plan - Vựa Vui Vẻ

## 📅 Ngày tạo: 5/11/2025

---

## 🔴 1. BẢO MẬT (CRITICAL - Ưu tiên cao nhất)

### Vấn đề hiện tại:

- ❌ Mật khẩu lưu dạng plain text trong localStorage
- ❌ Không có authentication thật (chỉ mock)
- ❌ Không có session management
- ❌ Không có input sanitization
- ❌ CORS mở hoàn toàn

### Giải pháp đề xuất:

#### A. Password Hashing

```javascript
// Cài đặt bcryptjs
npm install bcryptjs

// Trong js/api.js - Hash password khi register
import bcrypt from 'bcryptjs';

export async function apiRegisterUser({ name, email, phone, password, address }) {
  // Hash password trước khi lưu
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    phone: phone.replace(/\D/g, ""),
    password: hashedPassword, // ✅ Lưu hash thay vì plain text
    address,
    role: "Customer",
    createdAt: new Date().toISOString()
  };

  users.push(user);
  setUsers(users);

  // ... rest of code
}

// Verify password khi login
export async function apiLoginUser({ email, phone, password }) {
  const users = getUsers();
  const candidate = users.find(/* ... */);

  if (!candidate) {
    return { ok: false, message: "Không tìm thấy tài khoản." };
  }

  // ✅ So sánh với hash
  const isPasswordValid = await bcrypt.compare(password, candidate.password);

  if (!isPasswordValid) {
    return { ok: false, message: "Mật khẩu không đúng." };
  }

  // ... rest of code
}
```

#### B. JWT Authentication (Thay localStorage đơn giản)

```javascript
// Cài đặt jsonwebtoken
npm install jsonwebtoken

// Tạo file backoffice/auth-middleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Middleware kiểm tra role
export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
```

#### C. Rate Limiting (Chống brute force)

```javascript
// Cài đặt express-rate-limit
npm install express-rate-limit

// Trong server-simple.js
import rateLimit from 'express-rate-limit';

// Rate limiter cho login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 requests
  message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter chung
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 100, // Tối đa 100 requests
  message: 'Quá nhiều requests. Vui lòng thử lại sau.',
});

// Apply middleware
server.use('/api/login', loginLimiter);
server.use('/api/', apiLimiter);
```

#### D. Input Sanitization

```javascript
// Cài đặt validator
npm install validator express-validator

// Tạo file backoffice/validators.js
import { body, validationResult } from 'express-validator';
import validator from 'validator';

export const validateRegister = [
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('phone')
    .matches(/^0\d{9}$/).withMessage('Số điện thoại không hợp lệ'),
  body('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Mật khẩu phải chứa chữ và số'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Tên từ 2-100 ký tự')
    .escape(), // Chống XSS
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateLogin = [
  body('email').optional().isEmail(),
  body('phone').optional().matches(/^0\d{9}$/),
  body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

#### E. CORS Configuration

```javascript
// Trong server-simple.js
import cors from "cors";

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://vuavuive.com"] // Production domain
      : ["http://localhost:5503", "http://127.0.0.1:5503"], // Dev domains
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

server.use(cors(corsOptions));
```

---

## 🟡 2. VALIDATION & ERROR HANDLING (Ưu tiên cao)

### Vấn đề hiện tại:

- ⚠️ Validation không đồng nhất giữa frontend và backend
- ⚠️ Error messages không rõ ràng
- ⚠️ Không có error logging centralized

### Giải pháp:

#### A. Centralized Error Handler

```javascript
// Tạo file backoffice/error-handler.js
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production: không leak stack trace
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error("ERROR 💥", err);
      res.status(500).json({
        status: "error",
        message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    }
  }
}

// Trong server-simple.js
import { errorHandler } from "./error-handler.js";

// Cuối cùng, sau tất cả routes
server.use(errorHandler);
```

#### B. Request Validation Middleware

```javascript
// Cập nhật server-middleware.js
export function validateOrderRequest(req, res, next) {
  const { items, customer_name, customer_phone, delivery_address } = req.body;

  // Validate items
  if (!items || typeof items !== "object" || Object.keys(items).length === 0) {
    return res.status(400).json({
      error: "INVALID_ITEMS",
      message: "Đơn hàng phải có ít nhất 1 sản phẩm",
    });
  }

  // Validate customer info
  if (!customer_name || customer_name.trim().length < 2) {
    return res.status(400).json({
      error: "INVALID_NAME",
      message: "Tên khách hàng không hợp lệ",
    });
  }

  if (!customer_phone || !/^0\d{9}$/.test(customer_phone)) {
    return res.status(400).json({
      error: "INVALID_PHONE",
      message: "Số điện thoại không hợp lệ (phải là 10 số, bắt đầu bằng 0)",
    });
  }

  if (!delivery_address || delivery_address.trim().length < 10) {
    return res.status(400).json({
      error: "INVALID_ADDRESS",
      message: "Địa chỉ giao hàng không hợp lệ",
    });
  }

  next();
}

// Apply trong server-simple.js
server.use("/orders", validateOrderRequest);
server.use(stockDeductionMiddleware);
```

---

## 🟢 3. DATABASE (Ưu tiên trung bình - Nâng cấp tương lai)

### Vấn đề hiện tại:

- ℹ️ JSON file không phù hợp cho production
- ℹ️ Không có transactions
- ℹ️ Không có data backup tự động
- ℹ️ Performance với data lớn

### Giải pháp (Khi scale):

#### Option A: SQLite (Đơn giản nhất)

```javascript
// Cài đặt better-sqlite3
npm install better-sqlite3

// Tạo file backoffice/db-sqlite.js
import Database from 'better-sqlite3';

const db = new Database('backoffice/database.sqlite');

// Tạo tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    role TEXT DEFAULT 'Customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    price INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    image TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_id INTEGER,
    customer_name TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    items TEXT, -- JSON string
    subtotal INTEGER,
    shipping_fee INTEGER,
    total INTEGER,
    delivery_status TEXT DEFAULT 'placed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id)
  );

  CREATE INDEX idx_orders_status ON orders(delivery_status);
  CREATE INDEX idx_orders_created ON orders(created_at);
`);

export default db;
```

#### Option B: MongoDB (Nếu cần flexibility)

```javascript
// Cài đặt mongoose
npm install mongoose

// Tạo file backoffice/models/
// - User.js
// - Product.js
// - Order.js
// - AuditLog.js
```

#### Option C: PostgreSQL (Production-ready)

```javascript
// Cài đặt pg
npm install pg

// Sử dụng connection pooling
// Prisma ORM để quản lý schema
```

---

## 🟠 4. PERFORMANCE & SCALABILITY

### Vấn đề hiện tại:

- ⚠️ Load toàn bộ data vào memory
- ⚠️ Không có caching
- ⚠️ Không có pagination

### Giải pháp:

#### A. Pagination

```javascript
// Trong server-simple.js
server.get("/products", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const db = router.db.getState();
  const products = db.products
    .filter((p) => p.status === "active")
    .slice(skip, skip + limit);

  res.json({
    data: products,
    pagination: {
      page,
      limit,
      total: db.products.filter((p) => p.status === "active").length,
      totalPages: Math.ceil(
        db.products.filter((p) => p.status === "active").length / limit
      ),
    },
  });
});
```

#### B. Response Caching

```javascript
// Cài đặt node-cache
npm install node-cache

// Trong server-simple.js
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

server.get('/products', (req, res) => {
  const cacheKey = 'products_active';

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Query database
  const db = router.db.getState();
  const products = db.products.filter(p => p.status === 'active');

  // Save to cache
  cache.set(cacheKey, products);

  res.json(products);
});

// Invalidate cache khi có update
server.post('/products', (req, res, next) => {
  cache.del('products_active');
  next();
});
```

#### C. Compression

```javascript
// Cài đặt compression
npm install compression

// Trong server-simple.js
import compression from 'compression';

server.use(compression());
```

---

## 🔵 5. LOGGING & MONITORING

### Giải pháp:

#### A. Structured Logging

```javascript
// Cài đặt winston
npm install winston

// Tạo file backoffice/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export default logger;

// Sử dụng:
import logger from './logger.js';

logger.info('Order created', { orderId: order.id, total: order.total });
logger.error('Stock deduction failed', { error: err.message, productId });
```

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 1: BẢO MẬT (Tuần 1-2) - CRITICAL

- [ ] Implement password hashing với bcrypt
- [ ] Add JWT authentication
- [ ] Add rate limiting
- [ ] Add input validation & sanitization
- [ ] Configure CORS properly
- [ ] Add HTTPS/SSL support

### Phase 2: VALIDATION & ERROR HANDLING (Tuần 3)

- [ ] Centralized error handler
- [ ] Request validation middleware
- [ ] Unified error messages
- [ ] Error logging

### Phase 3: PERFORMANCE (Tuần 4)

- [ ] Add pagination
- [ ] Add response caching
- [ ] Add compression
- [ ] Optimize queries

### Phase 4: DATABASE MIGRATION (Tuần 5-6) - OPTIONAL

- [ ] Evaluate SQLite vs MongoDB vs PostgreSQL
- [ ] Design schema
- [ ] Migration script
- [ ] Backup strategy

### Phase 5: MONITORING & LOGGING (Tuần 7)

- [ ] Structured logging với Winston
- [ ] Health check endpoints
- [ ] Performance monitoring
- [ ] Error tracking

---

## 🎯 QUICK WINS (Có thể làm ngay)

### 1. Add Environment Variables

```bash
# Tạo file .env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-this
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

```javascript
// Cài đặt dotenv
npm install dotenv

// Trong server-simple.js
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;
```

### 2. Add API Versioning

```javascript
// Thay vì /products
// Dùng /api/v1/products

server.use("/api/v1", router);
```

### 3. Add Health Check Endpoint

```javascript
// Trong server-simple.js
server.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "connected", // Check db connection
  });
});
```

### 4. Add Request ID for Tracing

```javascript
import { v4 as uuidv4 } from "uuid";

server.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader("X-Request-ID", req.id);
  next();
});
```

---

## 📊 TESTING CHECKLIST

### Security Testing:

- [ ] Test SQL Injection (nếu dùng SQL)
- [ ] Test XSS attacks
- [ ] Test CSRF attacks
- [ ] Test rate limiting
- [ ] Test authentication bypass
- [ ] Test authorization bypass

### Performance Testing:

- [ ] Load testing với 100+ concurrent users
- [ ] Test với 10,000+ products
- [ ] Test với 100,000+ orders
- [ ] Memory leak testing
- [ ] Response time benchmarks

### Integration Testing:

- [ ] Test order creation flow
- [ ] Test stock deduction
- [ ] Test stock restore on cancel
- [ ] Test concurrent order conflicts
- [ ] Test payment integration (future)

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-deployment:

- [ ] Change all default secrets
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Set up error monitoring (Sentry)
- [ ] Set up uptime monitoring
- [ ] Load test with production data

### Production Environment:

- [ ] Use process manager (PM2)
- [ ] Set up reverse proxy (Nginx)
- [ ] Configure firewall
- [ ] Set up SSL certificate
- [ ] Configure logging rotation
- [ ] Set up auto-restart on crash

---

## 📚 RESOURCES

- **bcryptjs**: https://www.npmjs.com/package/bcryptjs
- **jsonwebtoken**: https://www.npmjs.com/package/jsonwebtoken
- **express-validator**: https://express-validator.github.io/docs/
- **express-rate-limit**: https://www.npmjs.com/package/express-rate-limit
- **winston**: https://github.com/winstonjs/winston
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

**Tạo bởi:** GitHub Copilot  
**Ngày:** 5/11/2025  
**Phiên bản:** 1.0

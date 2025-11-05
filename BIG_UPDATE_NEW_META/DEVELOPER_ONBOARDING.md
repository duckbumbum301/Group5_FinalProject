# 📖 Hướng Dẫn Đầy Đủ Cho Người Mới - Vựa Vui Vẻ

> **Complete Developer Onboarding Guide** - Từ clone dự án đến phát triển tính năng mới  
> Dành cho: Thành viên mới, sinh viên, và contributors

**Cập nhật:** 05/11/2025 | **Version:** 1.0

---

## 📋 MỤC LỤC

1. [🎯 Tổng quan](#-tổng-quan)
2. [⚙️ Yêu cầu hệ thống](#️-yêu-cầu-hệ-thống)
3. [🚀 Setup lần đầu](#-setup-lần-đầu)
4. [▶️ Chạy dự án](#️-chạy-dự-án)
5. [📂 Hiểu cấu trúc project](#-hiểu-cấu-trúc-project)
6. [💻 Workflow phát triển](#-workflow-phát-triển)
7. [🧪 Testing & Debugging](#-testing--debugging)
8. [📝 Git Best Practices](#-git-best-practices)
9. [❓ Troubleshooting](#-troubleshooting)
10. [📚 Tài liệu tham khảo](#-tài-liệu-tham-khảo)

---

## 🎯 TỔNG QUAN

### Dự án Vựa Vui Vẻ là gì?

**E-commerce platform** bán thực phẩm với:

- 🛒 **Frontend Customer**: Trang web mua hàng cho khách
- 💼 **Backoffice Admin**: Quản lý sản phẩm, đơn hàng, users
- 🔌 **Backend API**: REST API với JSON Server
- 📦 **86 sản phẩm**: Rau củ, trái cây, thịt cá, đồ khô...

### Tech Stack

```
Frontend:  HTML5, CSS3, JavaScript (Vanilla ES6)
Backend:   Node.js + JSON Server (Express-based)
Database:  JSON file-based (db.json)
Server:    http-server cho frontend
```

### Tính năng chính

✅ **Customer Features:**

- Xem sản phẩm theo category
- Tìm kiếm & lọc sản phẩm
- Giỏ hàng & checkout
- Đăng ký/đăng nhập
- Xem lịch sử đơn hàng
- Công thức nấu ăn (recipes)

✅ **Admin Features:**

- Dashboard thống kê
- CRUD sản phẩm
- Quản lý đơn hàng (cập nhật status)
- Quản lý users
- Audit log (Admin only)
- Export CSV

✅ **Backend Features:**

- Auto REST API (GET/POST/PUT/PATCH/DELETE)
- Middleware trừ stock tự động khi đặt hàng
- Middleware hoàn stock khi hủy đơn
- Auto-sync products ra file
- Audit logging

---

## ⚙️ YÊU CẦU HỆ THỐNG

### ✅ Phần mềm bắt buộc phải cài

| Phần mềm    | Version | Tải tại                             | Kiểm tra         |
| ----------- | ------- | ----------------------------------- | ---------------- |
| **Node.js** | ≥ 16.x  | [nodejs.org](https://nodejs.org/)   | `node --version` |
| **npm**     | ≥ 8.x   | Đi kèm Node.js                      | `npm --version`  |
| **Git**     | ≥ 2.x   | [git-scm.com](https://git-scm.com/) | `git --version`  |

### 📦 Khuyên dùng thêm

| Tool                | Mục đích       | Link                                                    |
| ------------------- | -------------- | ------------------------------------------------------- |
| **VS Code**         | Code editor    | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Postman**         | Test API       | [postman.com](https://www.postman.com/)                 |
| **Chrome DevTools** | Debug frontend | Built-in Chrome                                         |

### 🔌 VS Code Extensions khuyên dùng

```
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Live Server (ritwickdey.LiveServer)
- REST Client (humao.rest-client)
- GitLens (eamodio.gitlens)
```

### ✔️ Kiểm tra đã cài đủ chưa

```bash
# Mở Terminal/Command Prompt và chạy:
node --version
# Expected output: v16.x.x hoặc cao hơn

npm --version
# Expected output: v8.x.x hoặc cao hơn

git --version
# Expected output: git version 2.x.x
```

✅ Nếu tất cả đều ra version → OK!  
❌ Nếu báo "command not found" → Cài phần mềm đó

---

## 🚀 SETUP LẦN ĐẦU

### Bước 1: Clone Repository

```bash
# Clone repository về máy
git clone https://github.com/duckbumbum301/Group5_FinalProject.git

# Di chuyển vào thư mục project
cd Group5_FinalProject/Group5_FinalProject

# (Lưu ý: Có 2 cấp thư mục Group5_FinalProject)
```

**Verify clone thành công:**

```bash
# Xem danh sách files
ls
# hoặc trên Windows
dir

# Phải thấy: package.json, backoffice/, html/, js/, ...
```

### Bước 2: Setup Tự Động (Khuyên dùng)

#### 🪟 **Windows:**

```powershell
# Chạy script setup
.\setup.bat

# Script sẽ tự động:
# ✅ Kiểm tra Node.js
# ✅ Cài đặt dependencies (npm install)
# ✅ Tạo thư mục data/
# ✅ Đồng bộ 86 products vào database
# ✅ Hiển thị hướng dẫn tiếp theo
```

####  **Mac/Linux:**

```bash
# Cấp quyền thực thi cho script
chmod +x setup.sh

# Chạy script setup
./setup.sh

# Script sẽ làm tương tự như Windows
```

### Bước 3: Setup Thủ Công (Nếu script không chạy)

```bash
# 1. Cài đặt dependencies
npm install

# Expected output:
# added 300+ packages in ~30s

# 2. Tạo thư mục data (nếu chưa có)
mkdir backoffice/data
# Windows PowerShell:
New-Item -ItemType Directory -Path backoffice/data

# 3. Đồng bộ products vào database
npm run sync

# Expected output:
# ✅ Products synced successfully
# 📦 86 products imported into db.json
```

### ✔️ Verify Setup Thành Công

```bash
# 1. Kiểm tra node_modules đã có
ls node_modules/
# Phải thấy nhiều thư mục packages

# 2. Kiểm tra db.json có data
cat backoffice/db.json
# Windows PowerShell:
Get-Content backoffice/db.json | Select-Object -First 20
# Phải thấy JSON với products array

# 3. Kiểm tra data folder
ls backoffice/data/
# Phải thấy: products.json, orders.json, users.json, auditLogs.json
```

✅ **Setup thành công khi:**

- Thư mục `node_modules/` tồn tại
- File `backoffice/db.json` có dữ liệu
- Thư mục `backoffice/data/` có các file JSON
- Không có error trong console

---

## ▶️ CHẠY DỰ ÁN

### 🎯 Cách 1: Chạy Full Stack (Khuyên dùng)

```bash
# Chạy cả Backend + Frontend cùng lúc
npm start

# Hoặc
npm run dev
```

**Output mong đợi:**

```
[0]
[0] JSON Server: http://localhost:3000
[0] Products: http://localhost:3000/products
[0] Orders: http://localhost:3000/orders
[0]
[1] Starting up http-server, serving ./
[1] Available on:
[1]   http://127.0.0.1:8000
[1]   http://192.168.x.x:8000
```

### 🔧 Cách 2: Chạy Riêng Từng Phần

#### Backend Only:

```bash
# Di chuyển vào thư mục backoffice
cd backoffice

# Chạy JSON Server
node server-simple.js

# Server chạy tại: http://localhost:3000
```

#### Frontend Only:

```bash
# Option 1: Dùng http-server (nếu đã cài)
npx http-server -p 8000

# Option 2: Dùng npm script
npm run frontend

# Option 3: Dùng Live Server trong VS Code
# Right-click vào html/index.html → "Open with Live Server"
```

### 🌐 Truy cập Ứng dụng

Sau khi chạy `npm start`, mở browser và truy cập:

| Trang               | URL                                         | Mô tả                |
| ------------------- | ------------------------------------------- | -------------------- |
| **🏠 Trang chủ**    | http://localhost:8000/html/index.html       | Giao diện khách hàng |
| **🛒 Giỏ hàng**     | http://localhost:8000/html/cart.html        | Xem giỏ hàng         |
| **👤 Tài khoản**    | http://localhost:8000/html/account.html     | Quản lý tài khoản    |
| **🔐 Đăng nhập**    | http://localhost:8000/client/login.html     | Login page           |
| **📝 Đăng ký**      | http://localhost:8000/client/register.html  | Register page        |
| **💼 Backoffice**   | http://localhost:8000/backoffice/index.html | Admin dashboard      |
| **🔌 API Server**   | http://localhost:3000                       | Backend API          |
| **📦 Products API** | http://localhost:3000/products              | List sản phẩm        |
| **📋 Orders API**   | http://localhost:3000/orders                | List đơn hàng        |

### 🔐 Tài Khoản Test

#### **Customer (Khách hàng):**

```
Phone/Email: 0987654321
Password: 123123
```

#### **Backoffice Admin:**

```
Email: admin@vuavuive.com
Password: (nhập bất kỳ)
Role: Admin
```

#### **Backoffice Staff:**

```
Email: staff@vuavuive.com
Password: (nhập bất kỳ)
Role: Staff
```

### 🛑 Dừng Servers

```bash
# Nhấn Ctrl + C trong terminal đang chạy servers

# Nếu cần kill process thủ công:

# Windows PowerShell:
Get-Process node | Stop-Process

# Mac/Linux:
killall node

# Kill specific port (3000):
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

---

## 📂 HIỂU CẤU TRÚC PROJECT

### 📊 Sơ đồ tổng quan

```
Group5_FinalProject/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── package-lock.json         # Locked versions
│   ├── .gitignore               # Git ignore rules
│   ├── setup.bat                # Windows setup script
│   └── setup.sh                 # Mac/Linux setup script
│
├── 📚 Documentation
│   ├── README.MD                # Project overview
│   ├── QUICKSTART.md            # Quick guide (ngắn gọn)
│   ├── DEVELOPER_ONBOARDING.md  # Hướng dẫn này (chi tiết)
│   ├── BACKEND_KNOWLEDGE_BASE.md # Backend documentation
│   ├── BACKEND_IMPROVEMENTS.md   # Improvement plans
│   └── SYSTEM_FLOW.md           # System flow diagrams
│
├── 🎨 Frontend (Customer)
│   ├── html/                    # Customer pages
│   │   ├── index.html          # Trang chủ ⭐
│   │   ├── cart.html           # Giỏ hàng
│   │   ├── account.html        # Tài khoản
│   │   ├── recipes.html        # Công thức nấu ăn
│   │   └── aboutus.html        # Giới thiệu
│   │
│   ├── client/                  # Auth pages
│   │   ├── login.html          # Đăng nhập ⭐
│   │   ├── register.html       # Đăng ký ⭐
│   │   └── auth.js             # Auth logic ⭐
│   │
│   ├── css/                     # Stylesheets
│   │   └── style.css           # Main styles
│   │
│   ├── js/                      # Frontend JavaScript
│   │   ├── api.js              # API calls ⭐⭐
│   │   ├── main.js             # Main app logic ⭐⭐
│   │   ├── data.js             # Static data (fallback)
│   │   ├── cart.js             # Cart functionality
│   │   ├── checkout.js         # Checkout process
│   │   ├── orders.js           # Order management
│   │   ├── account.js          # Account page
│   │   ├── recipes.js          # Recipes page
│   │   ├── header.js           # Header component
│   │   ├── menu.js             # Mega menu
│   │   ├── ui.js               # UI utilities
│   │   └── utils.js            # Helper functions
│   │
│   └── images/                  # Product images
│       ├── DRINK/              # Đồ uống
│       ├── VEG/                # Rau củ
│       ├── FRUIT/              # Trái cây
│       ├── MEAT/               # Thịt cá
│       └── ...
│
├── 💼 Backend & Admin
│   └── backoffice/
│       ├── server-simple.js     # ⭐⭐ Main server
│       ├── server-middleware.js # ⭐⭐ Business logic
│       ├── dataManager.js       # ⭐ Data management
│       ├── api.js               # API wrapper
│       ├── app.js               # ⭐ Admin UI logic
│       ├── index.html           # Admin dashboard
│       ├── styles.css           # Admin styles
│       ├── db.json              # ⭐⭐ Main database
│       ├── sync-products.js     # Product sync script
│       │
│       └── data/                # Backup storage
│           ├── products.json   # Products backup
│           ├── orders.json     # Orders backup
│           ├── users.json      # Users backup
│           └── auditLogs.json  # Audit logs backup
│
└── 🎥 Assets
    └── vid/                     # Video files

⭐ = Quan trọng, nên đọc
⭐⭐ = Rất quan trọng, bắt buộc phải hiểu
```

### 🗺️ Map: File nào để làm gì?

| Muốn...                          | Sửa file...                                  |
| -------------------------------- | -------------------------------------------- |
| **Thêm/sửa giao diện trang chủ** | `html/index.html`, `css/style.css`           |
| **Thêm chức năng cho customer**  | `js/main.js`, `js/api.js`                    |
| **Sửa logic giỏ hàng**           | `js/cart.js`, `js/checkout.js`               |
| **Thêm API endpoint mới**        | `backoffice/server-simple.js`                |
| **Sửa logic trừ stock**          | `backoffice/server-middleware.js`            |
| **Thêm chức năng admin**         | `backoffice/app.js`                          |
| **Thêm sản phẩm**                | Backoffice UI hoặc edit `backoffice/db.json` |
| **Thay đổi design**              | `css/style.css`, `backoffice/styles.css`     |

### 📋 Files quan trọng cần hiểu

#### **Backend:**

1. **`backoffice/server-simple.js`** - Main server

   - Khởi động JSON Server
   - Apply middlewares
   - Expose API endpoints

2. **`backoffice/server-middleware.js`** - Business logic

   - Stock deduction (trừ kho)
   - Stock restore (hoàn kho)
   - Product sync

3. **`backoffice/db.json`** - Database

   - Lưu products, orders, users, auditLogs
   - JSON Server tự động persist changes

4. **`backoffice/dataManager.js`** - Data management
   - Alternative API cho file-based operations
   - CRUD helpers

#### **Frontend:**

1. **`js/api.js`** - API layer

   - Fetch functions gọi backend
   - Error handling
   - Fallback logic

2. **`js/main.js`** - Main app

   - Product listing
   - Search & filter
   - Cart management
   - UI interactions

3. **`client/auth.js`** - Authentication

   - Login/register logic
   - Session management
   - User validation

4. **`html/index.html`** - Homepage
   - Product grid
   - Mega menu
   - Featured items

#### **Admin:**

1. **`backoffice/app.js`** - Admin SPA
   - Dashboard
   - CRUD operations
   - Order management
   - Audit log viewer

---

## 💻 WORKFLOW PHÁT TRIỂN

### 🔄 Quy trình làm việc chuẩn

```
┌─────────────────────────────────────────┐
│ 1. Pull code mới nhất từ main          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Tạo branch mới cho feature/fix      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Code & Test locally                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. Commit changes với message rõ ràng  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. Push branch lên GitHub               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 6. Tạo Pull Request                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 7. Code review & merge vào main        │
└─────────────────────────────────────────┘
```

### 📝 Chi tiết từng bước

#### **Bước 1: Pull code mới nhất**

```bash
# Checkout về main branch
git checkout main

# Pull code mới từ remote
git pull origin main

# Hoặc pull với rebase
git pull --rebase origin main
```

#### **Bước 2: Tạo branch mới**

```bash
# Syntax: git checkout -b <type>/<tên-ngắn-gọn>

# Examples:
git checkout -b feature/add-voucher-system
git checkout -b fix/cart-quantity-bug
git checkout -b improve/product-search
git checkout -b refactor/api-cleanup
```

**Branch naming convention:**

- `feature/` - Tính năng mới
- `fix/` hoặc `bugfix/` - Sửa bug
- `improve/` - Cải tiến feature có sẵn
- `refactor/` - Refactor code không thay đổi behavior
- `docs/` - Cập nhật documentation
- `test/` - Thêm tests

#### **Bước 3: Code & Test**

```bash
# Start development servers
npm start

# Code your feature...
# Test trong browser...
# Check console logs...
```

**Checklist khi code:**

- [ ] Code chạy không lỗi
- [ ] Test chức năng mới
- [ ] Test không làm hỏng chức năng cũ (regression)
- [ ] Code có comments giải thích logic phức tạp
- [ ] Format code đẹp (indent, spacing)

#### **Bước 4: Commit changes**

```bash
# Xem files đã thay đổi
git status

# Add files vào staging
git add .

# Hoặc add từng file cụ thể
git add js/api.js
git add backoffice/server-middleware.js

# Commit với message rõ ràng
git commit -m "feat: thêm hệ thống voucher cho checkout"
```

**Commit message format:**

```
<type>: <description>

Types:
- feat: Tính năng mới
- fix: Sửa bug
- docs: Cập nhật docs
- style: Format code (không đổi logic)
- refactor: Refactor code
- test: Thêm tests
- chore: Maintenance tasks

Examples:
✅ feat: thêm payment gateway VNPay
✅ fix: sửa lỗi stock không được trừ
✅ improve: tối ưu search performance
✅ docs: cập nhật API documentation
❌ update some files (không rõ ràng)
❌ fix bug (không nói bug gì)
```

**Multiple commits cho một feature:**

```bash
# Commit từng logical unit
git commit -m "feat: thêm voucher data model"
git commit -m "feat: thêm voucher API endpoints"
git commit -m "feat: thêm voucher UI trong checkout"
git commit -m "test: thêm tests cho voucher system"
```

#### **Bước 5: Push branch**

```bash
# Push branch lên GitHub
git push origin feature/add-voucher-system

# Nếu lần đầu push branch mới
git push -u origin feature/add-voucher-system
```

#### **Bước 6: Tạo Pull Request**

1. Vào GitHub repository: https://github.com/duckbumbum301/Group5_FinalProject
2. Click tab "Pull requests"
3. Click "New pull request"
4. Chọn base: `main` ← compare: `feature/add-voucher-system`
5. Click "Create pull request"
6. Điền thông tin:

   ```markdown
   ## 📋 Description

   Thêm hệ thống voucher cho checkout

   ## ✨ Changes

   - Thêm voucher model trong backend
   - Thêm API endpoints: GET/POST /vouchers
   - Thêm UI apply voucher trong checkout
   - Validation voucher code

   ## ✅ Testing

   - [x] Test apply voucher hợp lệ
   - [x] Test voucher không tồn tại
   - [x] Test voucher đã hết hạn
   - [x] Test áp dụng nhiều voucher

   ## 📸 Screenshots

   [Attach screenshots nếu có UI changes]
   ```

7. Request review từ team members
8. Label PR (nếu cần): `enhancement`, `bug`, `documentation`

#### **Bước 7: Code Review & Merge**

**Reviewer checklist:**

- [ ] Code chạy được không?
- [ ] Logic đúng không?
- [ ] Có tests không? (nếu có)
- [ ] Code có comments đủ không?
- [ ] Format code đẹp không?
- [ ] Có conflicts với main không?

**Merge strategies:**

- **Merge commit**: Giữ lại history đầy đủ (khuyên dùng)
- **Squash and merge**: Gộp tất cả commits thành 1
- **Rebase and merge**: Linear history

---

## 🧪 TESTING & DEBUGGING

### 🔍 Test Backend API

#### **1. Test với curl (Command Line)**

**Windows PowerShell:**

```powershell
# Test GET products
curl http://localhost:3000/products | ConvertFrom-Json | Select-Object -First 3

# Test GET single product
curl http://localhost:3000/products/100 | ConvertFrom-Json

# Test POST order
$order = @{
    customer_name = "Test User"
    customer_phone = "0123456789"
    delivery_address = "123 Test St"
    items = @{ "100" = 2; "101" = 3 }
    subtotal = 80000
    shipping_fee = 20000
    total = 100000
    payment_method = "cod"
} | ConvertTo-Json

curl -Method POST -Uri http://localhost:3000/orders `
     -ContentType "application/json" `
     -Body $order

# Test PATCH order (cancel → restore stock)
$update = @{ delivery_status = "cancelled" } | ConvertTo-Json

curl -Method PATCH -Uri http://localhost:3000/orders/ORD-123 `
     -ContentType "application/json" `
     -Body $update
```

**Mac/Linux:**

```bash
# Test GET products
curl http://localhost:3000/products | jq '.[0:3]'

# Test POST order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_phone": "0123456789",
    "items": {"100": 2, "101": 3},
    "total": 100000
  }'

# Test PATCH order
curl -X PATCH http://localhost:3000/orders/ORD-123 \
  -H "Content-Type: application/json" \
  -d '{"delivery_status": "cancelled"}'
```

#### **2. Test với Postman/Thunder Client**

**Setup collection:**

```
GET     http://localhost:3000/products
GET     http://localhost:3000/products/100
POST    http://localhost:3000/orders
PATCH   http://localhost:3000/orders/:id
DELETE  http://localhost:3000/orders/:id
```

**Test flow trừ stock:**

1. GET `/products/100` → Ghi nhớ stock hiện tại (ví dụ: 50)
2. POST `/orders` với `items: {"100": 2}`
3. GET `/products/100` lại → Stock phải là 48
4. PATCH `/orders/:id` với `delivery_status: "cancelled"`
5. GET `/products/100` lại → Stock phải về 50

#### **3. Test với REST Client (VS Code extension)**

Tạo file `test.http`:

```http
### Get all products
GET http://localhost:3000/products

### Get one product
GET http://localhost:3000/products/100

### Create order
POST http://localhost:3000/orders
Content-Type: application/json

{
  "customer_name": "Test User",
  "customer_phone": "0123456789",
  "items": {"100": 2},
  "total": 26000
}

### Cancel order
PATCH http://localhost:3000/orders/ORD-123
Content-Type: application/json

{
  "delivery_status": "cancelled"
}
```

Click "Send Request" để test!

### 🐛 Debugging Backend

#### **1. Server Logs**

Server tự động log mọi request:

```
GET /products
POST /orders
✅ Trừ stock: Rau muống (50 → 48)
✅ Order created successfully
```

#### **2. Add More Logs**

```javascript
// Trong server-middleware.js
export function stockDeductionMiddleware(req, res, next) {
  console.log("📦 [Middleware] Stock Deduction");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Body:", JSON.stringify(req.body, null, 2));

  // ... rest of code

  console.log("✅ Stock deducted successfully");
  console.log("Updates:", updates);
}
```

#### **3. Debug với Node.js Debugger**

```bash
# Chạy với inspect mode
node --inspect backoffice/server-simple.js

# Trong VS Code:
# 1. Click "Run and Debug" (Ctrl+Shift+D)
# 2. Click "Node.js: Attach"
# 3. Set breakpoints trong code (click vào số dòng)
# 4. Gửi request → Code sẽ pause tại breakpoint
```

### 🎨 Debugging Frontend

#### **1. Browser Console**

```javascript
// Mở Console: F12 → Console tab

// Log variables
console.log("Cart:", cart);
console.log("Products:", products);

// Log API responses
fetch("http://localhost:3000/products")
  .then((r) => r.json())
  .then((data) => console.log("Products:", data));

// Check localStorage
console.log("Cart:", localStorage.getItem("vvv_cart"));
console.log("Session:", localStorage.getItem("vvv_session_v1"));
```

#### **2. Network Tab**

```
F12 → Network tab
- Refresh page
- Xem tất cả requests
- Click vào request để xem details:
  - Headers
  - Response
  - Timing
```

#### **3. Breakpoints trong Browser**

```
F12 → Sources tab
- Tìm file js/main.js
- Click vào số dòng để set breakpoint
- Trigger function (ví dụ: click Add to Cart)
- Code pause → Inspect variables
```

### ✅ Testing Checklist

**Trước khi commit:**

- [ ] Backend server chạy không lỗi
- [ ] Frontend load products thành công
- [ ] Tạo order → stock giảm
- [ ] Hủy order → stock tăng lại
- [ ] Login/Register hoạt động
- [ ] Giỏ hàng add/remove sản phẩm OK
- [ ] Checkout flow hoàn chỉnh
- [ ] Backoffice CRUD products OK
- [ ] No console errors trong browser

---

## 📝 GIT BEST PRACTICES

### ✅ Các Lệnh Git Thường Dùng

```bash
# ═══════════════════════════════════
# BASIC COMMANDS
# ═══════════════════════════════════

# Xem status
git status

# Xem log
git log --oneline --graph --all -10

# Xem diff (chưa add)
git diff

# Xem diff (đã add)
git diff --staged

# ═══════════════════════════════════
# BRANCHING
# ═══════════════════════════════════

# Tạo branch mới
git checkout -b feature/new-feature

# Chuyển branch
git checkout main

# Xem tất cả branches
git branch -a

# Xóa branch local
git branch -d feature/old-feature

# Xóa branch remote
git push origin --delete feature/old-feature

# ═══════════════════════════════════
# STAGING & COMMITTING
# ═══════════════════════════════════

# Add tất cả files
git add .

# Add specific files
git add js/api.js backoffice/server.js

# Add với interactive mode
git add -i

# Commit
git commit -m "feat: add new feature"

# Commit với editor
git commit

# Amend last commit (sửa commit vừa rồi)
git commit --amend

# ═══════════════════════════════════
# PUSHING & PULLING
# ═══════════════════════════════════

# Push branch
git push origin feature/branch-name

# Push với set upstream
git push -u origin feature/branch-name

# Pull từ remote
git pull origin main

# Pull với rebase
git pull --rebase origin main

# Fetch (không merge)
git fetch origin

# ═══════════════════════════════════
# STASHING (Tạm thời lưu changes)
# ═══════════════════════════════════

# Stash changes
git stash

# Stash với message
git stash save "WIP: working on feature"

# List stashes
git stash list

# Apply stash (giữ stash)
git stash apply

# Pop stash (xóa sau khi apply)
git stash pop

# Drop stash
git stash drop stash@{0}

# ═══════════════════════════════════
# UNDOING CHANGES
# ═══════════════════════════════════

# Undo changes in working directory
git restore <file>

# Unstage file (keep changes)
git restore --staged <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert commit (create new commit)
git revert <commit-hash>

# ═══════════════════════════════════
# MERGING
# ═══════════════════════════════════

# Merge branch vào current branch
git merge feature/branch-name

# Merge với no-fast-forward
git merge --no-ff feature/branch-name

# Abort merge nếu có conflicts
git merge --abort

# ═══════════════════════════════════
# REBASING
# ═══════════════════════════════════

# Rebase current branch lên main
git rebase main

# Interactive rebase (squash commits)
git rebase -i HEAD~3

# Continue rebase sau khi fix conflicts
git rebase --continue

# Abort rebase
git rebase --abort

# ═══════════════════════════════════
# REMOTE
# ═══════════════════════════════════

# Xem remotes
git remote -v

# Add remote
git remote add upstream https://github.com/original/repo.git

# Fetch từ upstream
git fetch upstream

# Merge upstream/main vào local main
git merge upstream/main
```

### 🔀 Xử Lý Merge Conflicts

**Khi gặp conflict:**

```bash
# 1. Git sẽ báo lỗi khi pull/merge
git pull origin main
# CONFLICT: Merge conflict in js/api.js

# 2. Xem files bị conflict
git status
# both modified:   js/api.js

# 3. Mở file bị conflict
# Tìm các markers:
<<<<<<< HEAD
// Your changes
const API_URL = "http://localhost:3000";
=======
// Their changes
const API_URL = "http://localhost:5000";
>>>>>>> main

# 4. Sửa conflict:
# - Chọn một trong hai
# - Hoặc kết hợp cả hai
# - Xóa tất cả markers (<<<, ===, >>>)

const API_URL = "http://localhost:3000"; // Chọn version của mình

# 5. Add file đã sửa
git add js/api.js

# 6. Commit
git commit -m "fix: resolve merge conflict in api.js"

# 7. Push
git push origin feature/branch-name
```

### 🎯 Git Workflow Tips

**1. Commit thường xuyên:**

```bash
# Bad: Code cả ngày rồi mới commit
git commit -m "update lots of stuff"

# Good: Commit từng logical unit
git commit -m "feat: add product filter"
git commit -m "feat: add sort by price"
git commit -m "fix: fix filter reset button"
```

**2. Pull trước khi push:**

```bash
# Always pull trước khi start coding
git checkout main
git pull origin main
git checkout -b feature/new-feature

# Pull lại trước khi push
git pull origin main
git push origin feature/new-feature
```

**3. Branch naming:**

```bash
# Good
git checkout -b feature/add-payment-vnpay
git checkout -b fix/cart-quantity-bug
git checkout -b improve/search-performance

# Bad
git checkout -b new-feature
git checkout -b fix
git checkout -b test123
```

**4. Keep commits clean:**

```bash
# Squash commits trước khi merge
git rebase -i HEAD~5

# Trong editor, change "pick" thành "squash" cho commits muốn gộp:
pick abc123 feat: add feature X
squash def456 fix typo
squash ghi789 fix bug in feature X
squash jkl012 add tests

# Result: 1 commit thay vì 4
```

---

## ❓ TROUBLESHOOTING

### 🔴 Lỗi Setup

#### **1. "node is not recognized as an internal or external command"**

```
✅ Giải pháp:
1. Cài/cài lại Node.js từ nodejs.org
2. Restart terminal/computer
3. Kiểm tra: node --version
```

#### **2. "npm install fails with permission errors"**

```bash
# Windows: Chạy Command Prompt/PowerShell as Administrator
# Right-click → "Run as administrator"

# Mac/Linux: Dùng sudo (không khuyên)
sudo npm install

# Hoặc fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

#### **3. "Cannot find module 'json-server'"**

```bash
# Dependencies chưa cài
npm install

# Nếu vẫn lỗi, xóa và cài lại
rm -rf node_modules package-lock.json
npm install
```

### 🔴 Lỗi Runtime

#### **4. "Port 3000 is already in use"**

```bash
# Windows PowerShell:
Get-NetTCPConnection -LocalPort 3000 |
  Select-Object -ExpandProperty OwningProcess |
  ForEach-Object { Stop-Process -Id $_ -Force }

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Hoặc đổi port trong server-simple.js:
const PORT = 3001; // Thay vì 3000
```

#### **5. "Cannot GET /products - 404 Not Found"**

```bash
# Nguyên nhân: Server chưa chạy hoặc db.json trống

# Fix:
# 1. Kiểm tra server đang chạy
curl http://localhost:3000

# 2. Nếu lỗi, restart server
cd backoffice
node server-simple.js

# 3. Nếu db.json trống, sync lại
npm run sync
```

#### **6. "CORS Error in browser console"**

```
Nguyên nhân: Frontend gọi API từ origin khác

Fix:
1. Dùng đúng URL: http://localhost:3000 (không dùng 127.0.0.1)
2. Backend đã có CORS enabled mặc định
3. Nếu vẫn lỗi, restart backend server
```

### 🔴 Lỗi Backend

#### **7. "Stock không được trừ khi tạo order"**

```bash
# Debug:
# 1. Check server logs có "✅ Trừ stock" không
# 2. Check format items đúng không:
#    ✅ Correct: { "items": { "100": 2, "101": 3 } }
#    ❌ Wrong:   { "items": [{"id": "100", "qty": 2}] }
# 3. Check product tồn tại trong db.json
# 4. Restart server
```

#### **8. "Products không sync ra data/products.json"**

```bash
# Nguyên nhân: Thư mục data/ không tồn tại

# Fix:
mkdir backoffice/data
# Windows PowerShell:
New-Item -ItemType Directory -Path backoffice/data

# Restart server
cd backoffice && node server-simple.js
```

### 🔴 Lỗi Frontend

#### **9. "Products không hiển thị trên trang chủ"**

```bash
# Debug checklist:
# 1. Backend có chạy không?
curl http://localhost:3000/products

# 2. Browser console có lỗi không?
# F12 → Console tab

# 3. Network tab có request thành công không?
# F12 → Network tab → Refresh → Check /products request

# 4. Check CORS
# Response headers phải có: Access-Control-Allow-Origin: *

# 5. Check code trong js/main.js
# Function apiListProducts() có chạy không?
```

#### **10. "Cart không cập nhật"**

```javascript
// Debug trong browser console (F12):

// 1. Check cart trong localStorage
console.log("Cart:", localStorage.getItem("vvv_cart"));

// 2. Check cart variable trong code
console.log("Cart object:", cart);

// 3. Clear cart nếu bị lỗi
localStorage.removeItem("vvv_cart");
location.reload();

// 4. Check function add to cart có lỗi không
```

### 🔴 Lỗi Git

#### **11. "Merge conflict"**

```bash
# Xem file bị conflict
git status

# Mở file, tìm markers:
<<<<<<< HEAD
Your code
=======
Their code
>>>>>>> branch-name

# Sửa manual, xóa markers
# Save file

# Add & commit
git add .
git commit -m "fix: resolve merge conflict"
```

#### **12. "Accidentally committed to main"**

```bash
# Nếu chưa push:
git reset --soft HEAD~1  # Undo commit, giữ changes
git checkout -b feature/branch-name
git commit -m "feat: proper commit"

# Nếu đã push: Cần revert
git revert <commit-hash>
git push origin main
```

#### **13. "Need to undo last commit"**

```bash
# Giữ changes
git reset --soft HEAD~1

# Bỏ changes
git reset --hard HEAD~1

# Đã push lên remote: Dùng revert
git revert HEAD
git push origin branch-name
```

### 🔄 Reset Project (Last Resort)

```bash
# Backup trước
cp -r . ../backup

# Xóa everything
rm -rf node_modules package-lock.json
rm -rf backoffice/db.json backoffice/data

# Cài lại
npm install
npm run sync

# Restart
npm start
```

---

## 📚 TÀI LIỆU THAM KHẢO

### 📖 Documentation trong Project

| File                          | Nội dung                 | Khi nào đọc      |
| ----------------------------- | ------------------------ | ---------------- |
| **README.MD**                 | Tổng quan project        | Đọc đầu tiên     |
| **QUICKSTART.md**             | Hướng dẫn nhanh          | Clone lần đầu    |
| **DEVELOPER_ONBOARDING.md**   | Hướng dẫn này (chi tiết) | Khi cần chi tiết |
| **BACKEND_KNOWLEDGE_BASE.md** | Backend deep dive        | Làm backend      |
| **BACKEND_IMPROVEMENTS.md**   | Improvement plans        | Cải tiến backend |
| **SYSTEM_FLOW.md**            | System flows             | Hiểu luồng xử lý |

### 🔗 External Resources

#### **Công nghệ:**

- **Node.js Docs**: https://nodejs.org/docs/
- **JSON Server**: https://github.com/typicode/json-server
- **Express.js**: https://expressjs.com/
- **MDN Web Docs**: https://developer.mozilla.org/

#### **Learning:**

- **JavaScript.info**: https://javascript.info/ (học JS ES6)
- **REST API Tutorial**: https://restfulapi.net/
- **Git Book**: https://git-scm.com/book/en/v2
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

#### **Tools:**

- **VS Code Shortcuts**: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf
- **Git Cheatsheet**: https://education.github.com/git-cheat-sheet-education.pdf

### 💬 Support

- **GitHub Issues**: https://github.com/duckbumbum301/Group5_FinalProject/issues
- **Pull Requests**: Đóng góp code qua PRs
- **Team Contact**: [Thêm contact info của team]

---

## ✅ CHECKLIST CHO NGƯỜI MỚI

### 🚀 Setup (Bắt buộc)

- [ ] Đã cài Node.js v16+
- [ ] Đã cài Git
- [ ] Đã clone repository
- [ ] Đã chạy `npm install`
- [ ] Đã chạy `npm run sync`
- [ ] Đã chạy `npm start` thành công
- [ ] Truy cập được http://localhost:8000/html/index.html
- [ ] Truy cập được http://localhost:3000/products
- [ ] Đã đọc README.MD

### 📚 Hiểu Project (Khuyên làm)

- [ ] Đã đọc DEVELOPER_ONBOARDING.md (file này)
- [ ] Hiểu cấu trúc thư mục
- [ ] Biết file nào để làm gì
- [ ] Đã chạy thử tất cả pages (customer & admin)
- [ ] Đã test API với curl/Postman

### 🧪 Test Chức Năng (Nên làm)

- [ ] Customer: Xem products, add to cart, checkout
- [ ] Admin: Login backoffice, CRUD products
- [ ] Test order → stock giảm
- [ ] Test cancel order → stock tăng
- [ ] Test audit log

### 💻 Development Setup (Nếu code)

- [ ] Đã cài VS Code extensions (ESLint, Prettier, Live Server)
- [ ] Tạo được branch mới
- [ ] Commit & push được code
- [ ] Biết cách test với curl
- [ ] Biết cách debug (console.log, breakpoints)

### 📖 Đọc Documentation (Nếu làm backend)

- [ ] Đã đọc BACKEND_KNOWLEDGE_BASE.md
- [ ] Hiểu middleware pattern
- [ ] Hiểu flow trừ stock
- [ ] Biết các API endpoints

---

## 🎯 NEXT STEPS

### Sau khi setup xong, làm gì tiếp?

#### **1. Explore codebase** (1-2 giờ)

- Mở và đọc các file chính
- Chạy code, thử debug
- Hiểu luồng xử lý

#### **2. Làm quen với features** (30 phút)

- Test tất cả chức năng customer
- Test tất cả chức năng admin
- Tạo order test

#### **3. Pick một task** (chọn level phù hợp)

**Beginner:**

- Fix typos trong UI
- Thêm validation cho forms
- Cải thiện error messages
- Thêm loading indicators

**Intermediate:**

- Implement pagination
- Thêm advanced filters
- Optimize search performance
- Add image upload

**Advanced:**

- Password hashing (bcrypt)
- JWT authentication
- Rate limiting
- Real-time updates

#### **4. Start coding**

```bash
# Tạo branch
git checkout -b feature/your-feature

# Code, test, commit
# ...

# Push & create PR
git push origin feature/your-feature
```

---

## 🎓 LEARNING PATH

### Tôi muốn học...

#### **Frontend Development:**

1. Đọc `js/main.js` - Hiểu product listing
2. Đọc `js/cart.js` - Hiểu cart logic
3. Đọc `js/api.js` - Hiểu API calls
4. Thử thêm feature mới (ví dụ: wishlist)

#### **Backend Development:**

1. Đọc `BACKEND_KNOWLEDGE_BASE.md`
2. Đọc `backoffice/server-simple.js`
3. Đọc `backoffice/server-middleware.js`
4. Thử thêm middleware mới

#### **Full Stack:**

1. Hiểu flow: Frontend → API → Backend → Database
2. Trace code từ button click → server response
3. Thử implement feature từ đầu đến cuối

---

## 📞 GẶP VẤN ĐỀ?

### 🆘 Khi nào cần help?

**Tự debug trước:**

1. ✅ Đọc error message kỹ
2. ✅ Check console logs
3. ✅ Google error message
4. ✅ Check Troubleshooting section
5. ✅ Thử debug với console.log/breakpoints

**Hỏi team khi:**

- Stuck >30 phút không fix được
- Không hiểu concept/pattern
- Cần review code
- Cần design decision

### 📝 Cách hỏi hiệu quả

**Bad:**

> "Code không chạy, giúp tôi với!"

**Good:**

```
Problem: Stock không được trừ khi tạo order

Steps to reproduce:
1. POST /orders với items: {"100": 2}
2. GET /products/100
3. Stock vẫn là 50 (không giảm)

What I tried:
- Check server logs: Không thấy "✅ Trừ stock"
- Check middleware có chạy không: Có log middleware chạy
- Check format items: Đúng format

Environment:
- OS: Windows 11
- Node: v18.17.0
- Branch: feature/test-orders

Logs:
[Attach relevant console logs]

Screenshots:
[Attach if helpful]
```

---

## 🎉 WELCOME!

Chúc mừng bạn đã setup thành công dự án Vựa Vui Vẻ!

### 🚀 Bây giờ bạn có thể:

- ✅ Chạy project locally
- ✅ Tạo branch và code
- ✅ Test features
- ✅ Commit & push code
- ✅ Tạo Pull Requests

### 💡 Tips cuối:

- **Code thường xuyên**: Không code cả tuần rồi mới commit
- **Test kỹ**: Trước khi push
- **Hỏi khi cần**: Team sẵn sàng help
- **Đọc code người khác**: Học được nhiều
- **Have fun**: Coding phải vui!

---

**Happy Coding! 🎨💻✨**

> "The best way to learn is by doing"

---

**Tài liệu này được tạo:** 05/11/2025  
**Version:** 1.0  
**Author:** GitHub Copilot  
**Project:** Vựa Vui Vẻ E-commerce Platform  
**Repository:** https://github.com/duckbumbum301/Group5_FinalProject

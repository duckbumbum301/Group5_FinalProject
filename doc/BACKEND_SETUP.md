# 🚀 Backend Setup - Vựa Vui Vẻ

## ✅ ĐÃ HOÀN THÀNH

Hệ thống backend đơn giản cho cửa hàng Vựa Vui Vẻ đã được thiết lập thành công!

---

## 📋 TỔNG QUAN

**Backend Framework:** JSON Server (Zero-code REST API)  
**Database:** `backoffice/db.json` (JSON file-based)  
**API Endpoint:** `http://localhost:3000`  
**Frontend Server:** `http://localhost:8000`

---

## 🎯 TÍNH NĂNG ĐÃ TRIỂN KHAI

### 1. Backend API (JSON Server)

- ✅ **86 sản phẩm** từ data.js đã đồng bộ
- ✅ **REST API** tự động: GET, POST, PUT, PATCH, DELETE
- ✅ **Auto-save**: Mọi thay đổi tự động lưu vào db.json
- ✅ **Collections**: products, orders, users, auditLogs

### 2. Frontend Integration

- ✅ **Trang chủ** load sản phẩm từ API
- ✅ **Recipes** tìm ingredients từ API
- ✅ **Backoffice Products** - Full CRUD với API
- ✅ **Backoffice Dashboard** - Load products từ API
- ✅ **Fallback**: Tự động dùng data cứng nếu API lỗi

### 3. Automation Scripts

- ✅ **setup.bat** - Cài đặt tự động (Windows)
- ✅ **setup.sh** - Cài đặt tự động (Mac/Linux)
- ✅ **npm run sync** - Đồng bộ products vào database
- ✅ **npm start** - Chạy cả backend + frontend

---

## 📁 CẤU TRÚC FILES MỚI

```
Group5_FinalProject/
├── package.json              # Dependencies & NPM scripts
├── .gitignore               # Git ignore rules
├── setup.bat                # Setup script Windows
├── setup.sh                 # Setup script Mac/Linux
├── BACKEND_SETUP.md         # File này
│
├── backoffice/
│   ├── db.json              # Database (86 products + orders + users)
│   ├── api.js               # API wrapper với 5 modules
│   ├── sync-products.js     # Script đồng bộ products
│   ├── app.js               # ✅ Đã tích hợp API
│   └── index.html
│
├── js/
│   ├── api.js               # ✅ Đã tích hợp API
│   ├── main.js
│   └── ...
│
└── html/
    ├── index.html           # Trang chủ
    ├── recipes.html         # ✅ Đã tích hợp API
    └── ...
```

---

## 🚀 CÁCH SỬ DỤNG

### Lần đầu tiên (Setup):

```bash
# Windows
.\setup.bat

# Mac/Linux
chmod +x setup.sh
./setup.sh
```

### Chạy project:

```bash
npm start
```

### Truy cập:

- **Frontend**: http://localhost:8000
- **Recipes**: http://localhost:8000/html/recipes.html
- **Backoffice**: http://localhost:8000/backoffice
- **API**: http://localhost:3000
- **Products API**: http://localhost:3000/products

---

## 📊 API ENDPOINTS

### Products

```
GET    /products              # Lấy tất cả (86 sản phẩm)
GET    /products/:id          # Lấy 1 sản phẩm
POST   /products              # Tạo sản phẩm mới
PUT    /products/:id          # Cập nhật toàn bộ
PATCH  /products/:id          # Cập nhật một phần
DELETE /products/:id          # Xóa sản phẩm
```

### Orders

```
GET    /orders                # Lấy tất cả đơn hàng
GET    /orders/:id            # Lấy 1 đơn
POST   /orders                # Tạo đơn mới
PATCH  /orders/:id            # Cập nhật đơn
```

### Users

```
GET    /users                 # Lấy danh sách users
POST   /users                 # Tạo user mới
```

### Audit Logs

```
GET    /auditLogs             # Lấy logs
POST   /auditLogs             # Ghi log mới
```

---

## 🧪 TEST CASES

### ✅ Test 1: Thêm sản phẩm từ Backoffice

1. Vào http://localhost:8000/backoffice
2. Click "Sản phẩm" → "Thêm"
3. Điền thông tin → Lưu
4. Kiểm tra: Trang chủ tự động hiển thị sản phẩm mới

### ✅ Test 2: Tìm kiếm sản phẩm

1. Vào http://localhost:8000
2. Gõ tên sản phẩm vào ô search
3. Kết quả hiển thị sản phẩm từ API

### ✅ Test 3: Recipes - Thêm nguyên liệu

1. Vào http://localhost:8000/html/recipes.html
2. Click "Thêm vào giỏ" ở bất kỳ công thức
3. Không còn alert lỗi
4. Sản phẩm được thêm vào giỏ thành công

---

## 🔧 TROUBLESHOOTING

### Lỗi: "Port 3000 đã được sử dụng"

```bash
# Dừng tất cả npm processes
taskkill /F /IM node.exe

# Hoặc tìm process đang dùng port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Lỗi: "Cannot find module"

```bash
npm install
```

### Lỗi: "API không phản hồi"

```bash
# Kiểm tra backend đang chạy
curl http://localhost:3000/products

# Nếu không chạy, khởi động lại
npm run backend
```

### Products không đồng bộ

```bash
npm run sync
```

---

## 📈 THỐNG KÊ

- **Total Products**: 86
- **Categories**: 8 (veg, fruit, meat, drink, dry, spice, household, sweet)
- **Sample Orders**: 3
- **Sample Users**: 3 (Admin, Manager, Staff)
- **API Response Time**: ~10ms (local)
- **Database Size**: ~150KB (db.json)

---

## 🎓 KIẾN THỨC ĐÃ ÁP DỤNG

### Backend:

- ✅ JSON Server - Zero-code REST API
- ✅ RESTful conventions (GET, POST, PUT, PATCH, DELETE)
- ✅ File-based database (JSON)
- ✅ Concurrent server management

### Frontend:

- ✅ Fetch API for HTTP requests
- ✅ Async/await patterns
- ✅ Error handling & fallback strategies
- ✅ Real-time data synchronization

### DevOps:

- ✅ npm scripts automation
- ✅ Multi-platform setup scripts (bat/sh)
- ✅ Git ignore configuration
- ✅ Development workflow optimization

---

## 🚀 NEXT STEPS (Tùy chọn)

### Level 2: Node.js + Express (nếu muốn mở rộng)

- Validation logic phức tạp hơn
- Authentication thật (JWT)
- File upload (images)
- Email notifications
- Payment gateway integration

### Level 3: Production Deployment

- Deploy lên Vercel/Netlify (Frontend)
- Deploy JSON Server lên Heroku/Railway (Backend)
- Hoặc chuyển sang MongoDB Atlas + Express

---

## 👥 TEAM MEMBERS

**Group 5 - Final Project**

---

## 📝 NOTES

- Database được lưu trong `backoffice/db.json`
- Mọi thay đổi tự động persist vào file
- Backup `db.json` thường xuyên trước khi test
- Commit `db.json` lên Git để team có cùng data

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Cài đặt JSON Server
- [x] Tạo db.json với 86 products
- [x] Tạo API wrapper (backoffice/api.js)
- [x] Tích hợp API vào trang chủ
- [x] Tích hợp API vào recipes
- [x] Tích hợp API vào backoffice products
- [x] Tích hợp API vào backoffice dashboard
- [x] Tạo setup scripts (bat/sh)
- [x] Tạo .gitignore
- [x] Viết documentation
- [x] Test toàn bộ hệ thống

---

**🎉 HOÀN THÀNH! HỆ THỐNG BACKEND ĐƠN GIẢN ĐÃ SẴN SÀNG!**

---

_Generated: 2025-11-03_  
_Project: Vựa Vui Vẻ - Group 5_

# 🚀 Hướng dẫn Setup Project - Vựa Vui Vẻ

> **Dành cho thành viên mới** - Setup project trong 10 phút

---

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:

- ✅ **Node.js** (phiên bản >= 16.0.0) - [Download tại đây](https://nodejs.org/)
- ✅ **Git** - [Download tại đây](https://git-scm.com/)
- ✅ **Trình duyệt web** (Chrome, Firefox, Edge...)
- ✅ **Code editor** (VS Code khuyến nghị)

### Kiểm tra cài đặt

Mở terminal (Command Prompt, PowerShell hoặc Git Bash) và chạy:

```bash
node --version
# Kết quả mong đợi: v16.x.x hoặc cao hơn

npm --version
# Kết quả mong đợi: 8.x.x hoặc cao hơn

git --version
# Kết quả mong đợi: git version 2.x.x
```

---

## 📥 Bước 1: Clone Project

### Option 1: Clone qua HTTPS

```bash
# Mở terminal tại thư mục bạn muốn lưu project
cd Desktop

# Clone repository
git clone https://github.com/duckbumbum301/Group5_FinalProject.git

# Di chuyển vào thư mục project
cd Group5_FinalProject/Group5_FinalProject
```

### Option 2: Clone qua SSH (Nếu đã setup SSH key)

```bash
git clone git@github.com:duckbumbum301/Group5_FinalProject.git
cd Group5_FinalProject/Group5_FinalProject
```

### Option 3: Download ZIP

1. Vào https://github.com/duckbumbum301/Group5_FinalProject
2. Click nút **Code** → **Download ZIP**
3. Giải nén file ZIP
4. Mở terminal tại thư mục đã giải nén

---

## 📦 Bước 2: Cài đặt Dependencies

```bash
# Cài đặt tất cả packages cần thiết
npm install
```

**Chờ khoảng 1-2 phút...**

Kết quả mong đợi:

```
added 150 packages, and audited 151 packages in 45s
```

### ⚠️ Nếu gặp lỗi:

#### Lỗi: "npm not found"

```bash
# Tải và cài Node.js từ https://nodejs.org/
# Sau đó restart terminal và thử lại
```

#### Lỗi: "EACCES" hoặc "permission denied"

```bash
# Windows: Chạy terminal với quyền Administrator
# Mac/Linux: Thêm sudo trước lệnh
sudo npm install
```

#### Lỗi: "ECONNREFUSED" hoặc network error

```bash
# Kiểm tra kết nối internet
# Hoặc thử với VPN nếu bị chặn
```

---

## 🧪 Bước 3: Test hệ thống (Optional nhưng khuyến nghị)

```bash
npm run test:api
```

Kết quả mong đợi:

```
🧪 Bắt đầu test Data Manager API...

📦 Testing Products API...
✅ Get all products: 86 sản phẩm
✅ Get product by ID: Rau muống (500g)
✅ Filter by category 'veg': 38 sản phẩm

📋 Testing Orders API...
✅ Get all orders: 4 đơn hàng

✅ Tất cả tests hoàn thành!
```

---

## 🚀 Bước 4: Chạy Project

### Cách 1: Chạy tất cả (Backend + Frontend) - KHUYẾN NGHỊ ⭐

```bash
npm start
```

Kết quả:

```
🚀 Vựa Vui Vẻ API Server đang chạy!
📍 URL: http://localhost:3000
...
Starting up http-server, serving ./
Available on:
  http://localhost:8000
```

### Cách 2: Chạy riêng từng phần

**Terminal 1 - Backend:**

```bash
npm run backend
```

**Terminal 2 - Frontend:**

```bash
npm run frontend
```

---

## 🌐 Bước 5: Truy cập Website

Mở trình duyệt và truy cập:

### 1️⃣ **Trang chủ (Customer)**

```
http://localhost:8000/html/index.html
```

hoặc

```
http://localhost:8000
```

### 2️⃣ **Backoffice (Admin)**

```
http://localhost:8000/backoffice
```

**Đăng nhập với:**

- Email: `admin@vuavuive.com` hoặc bất kỳ email nào
- Password: bất kỳ (mock login)
- Role: Admin/Manager/Staff

### 3️⃣ **API Server**

```
http://localhost:3000
```

**Test API:**

```
http://localhost:3000/api/products
http://localhost:3000/api/orders
http://localhost:3000/api/stats/dashboard
```

### 4️⃣ **Health Check**

```
http://localhost:3000/health
```

---

## 📂 Cấu trúc Project

```
Group5_FinalProject/
│
├── backoffice/              # Admin Panel & Backend
│   ├── data/                # 🗄️ DATABASE
│   │   ├── products.json    # 86 sản phẩm
│   │   ├── orders.json      # Đơn hàng
│   │   ├── users.json       # Users
│   │   └── auditLogs.json   # Logs
│   │
│   ├── dataManager.js       # Core API
│   ├── server.js            # Express Server
│   └── index.html           # Admin UI
│
├── html/                    # Frontend Pages
│   ├── index.html           # Trang chủ
│   ├── cart.html            # Giỏ hàng
│   └── ...
│
├── js/                      # JavaScript
├── css/                     # Styles
├── images/                  # Images
│
└── package.json             # Config
```

---

## 🛠️ Scripts NPM có sẵn

```bash
# Chạy cả backend + frontend
npm start

# Chỉ chạy backend (Express API Server)
npm run backend

# Chỉ chạy frontend (Static file server)
npm run frontend

# Test API
npm run test:api

# Đồng bộ products từ data.js
npm run sync
```

---

## 🔍 Kiểm tra xem đã chạy thành công chưa

### 1. Check Backend

Mở trình duyệt và vào:

```
http://localhost:3000/health
```

Nếu thấy:

```json
{
  "status": "ok",
  "timestamp": "2025-11-04...",
  "uptime": 123.45
}
```

→ ✅ Backend OK!

### 2. Check Frontend

Mở trình duyệt và vào:

```
http://localhost:8000
```

Nếu thấy trang chủ Vựa Vui Vẻ → ✅ Frontend OK!

### 3. Check API

Mở trình duyệt và vào:

```
http://localhost:3000/api/products
```

Nếu thấy list 86 sản phẩm → ✅ API OK!

---

## ❌ Xử lý lỗi thường gặp

### Lỗi: "Port 3000 đã được sử dụng"

**Windows:**

```powershell
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (thay <PID> bằng số trong cột cuối)
taskkill /PID <PID> /F
```

**Mac/Linux:**

```bash
# Tìm và kill process
lsof -ti:3000 | xargs kill -9
```

### Lỗi: "Port 8000 đã được sử dụng"

Tương tự như trên, thay `3000` bằng `8000`

### Lỗi: "Cannot find module"

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

**Windows PowerShell:**

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Lỗi: "CORS" khi gọi API

- ✅ CORS đã được enable trong server
- ✅ Đảm bảo backend đang chạy tại `localhost:3000`
- ✅ Kiểm tra URL đúng: `http://localhost:3000/api/*`

### Lỗi: Trang web không load được

1. Kiểm tra terminal có lỗi không
2. Kiểm tra port có đang chạy:

   ```bash
   # Windows
   netstat -ano | findstr :8000

   # Mac/Linux
   lsof -i :8000
   ```

3. Thử truy cập trực tiếp: `http://localhost:8000/html/index.html`

### Lỗi: API không trả về data

1. Check backend có chạy không: `http://localhost:3000/health`
2. Check data files trong `backoffice/data/`:

   ```bash
   # Windows
   dir backoffice\data

   # Mac/Linux
   ls -la backoffice/data
   ```

3. Ensure files có quyền read/write

---

## 🔧 Development Tips

### 1. Mở project trong VS Code

```bash
code .
```

### 2. Cài Extensions hữu ích (VS Code)

- **Live Server** - Preview HTML
- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Prettier** - Code formatter
- **GitLens** - Git history
- **Thunder Client** - Test API

### 3. Hot reload

Backend tự động restart khi code thay đổi (nodemon - nếu có)

Frontend cần refresh browser (F5) để thấy thay đổi

### 4. View logs

Terminal sẽ hiển thị tất cả logs:

- Request logs: `[timestamp] GET /api/products`
- Errors: màu đỏ
- Success: màu xanh

---

## 📝 Workflow làm việc

### 1. Lần đầu setup (1 lần duy nhất)

```bash
git clone <repo>
cd Group5_FinalProject/Group5_FinalProject
npm install
npm run test:api
```

### 2. Mỗi ngày làm việc

```bash
# Pull code mới nhất
git pull origin main

# Cài đặt dependencies mới (nếu có)
npm install

# Chạy project
npm start

# Làm việc...

# Commit & push
git add .
git commit -m "Your message"
git push origin main
```

### 3. Test trước khi commit

```bash
# Test API
npm run test:api

# Test manually trên browser
# - Xem danh sách sản phẩm
# - Thêm vào giỏ hàng
# - Checkout
# - Backoffice: CRUD operations
```

---

## 🎯 Nhiệm vụ đầu tiên

Để làm quen với project, thử các tác vụ sau:

### 1️⃣ Xem sản phẩm trên frontend

- Vào http://localhost:8000
- Browse các sản phẩm
- Thử search, filter

### 2️⃣ Thêm sản phẩm vào giỏ

- Click "Thêm vào giỏ"
- Vào trang giỏ hàng
- Thử cập nhật số lượng

### 3️⃣ Login vào Backoffice

- Vào http://localhost:8000/backoffice
- Login với email bất kỳ
- Xem dashboard

### 4️⃣ Quản lý sản phẩm (Admin)

- Vào trang Products
- Thử tạo sản phẩm mới
- Thử sửa/xóa sản phẩm

### 5️⃣ Test API trực tiếp

- Vào http://localhost:3000/api/products
- Xem JSON response
- Thử các endpoints khác

---

## 📚 Tài liệu tham khảo

Sau khi setup xong, đọc thêm:

| Tài liệu                                          | Nội dung           |
| ------------------------------------------------- | ------------------ |
| [📖 DOCS_INDEX.md](./DOCS_INDEX.md)               | Index tất cả docs  |
| [📡 DATA_MANAGER_API.md](./DATA_MANAGER_API.md)   | API reference      |
| [🔄 INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) | Hướng dẫn tích hợp |
| [📋 README.md](./README.md)                       | Project overview   |

---

## 🆘 Cần giúp đỡ?

### 1. Check documentation

Đọc các file `.md` trong thư mục project

### 2. Xem logs

Terminal logs sẽ cho biết lỗi ở đâu

### 3. Search Google

Copy error message và search

### 4. Hỏi team

- Slack: #group5-support
- Email team members
- GitHub Issues

### 5. Check common issues

Xem phần "Xử lý lỗi thường gặp" ở trên

---

## ✅ Checklist Setup

Đánh dấu ✅ khi hoàn thành:

- [ ] Đã cài Node.js >= 16.0.0
- [ ] Đã cài Git
- [ ] Clone project thành công
- [ ] `npm install` chạy không lỗi
- [ ] `npm run test:api` pass tất cả tests
- [ ] `npm start` chạy thành công
- [ ] Truy cập được http://localhost:8000
- [ ] Truy cập được http://localhost:3000
- [ ] API trả về data đúng
- [ ] Backoffice login được
- [ ] Đã đọc README.md
- [ ] Đã thử CRUD operations
- [ ] Hiểu cấu trúc project
- [ ] Biết cách commit & push code

---

## 🎉 Hoàn thành!

Chúc mừng! Bạn đã setup thành công project Vựa Vui Vẻ.

**Next steps:**

1. Đọc [DOCS_INDEX.md](./DOCS_INDEX.md) để hiểu project
2. Xem [DATA_MANAGER_API.md](./DATA_MANAGER_API.md) để biết cách dùng API
3. Bắt đầu code theo task được giao

**Happy coding! 🚀**

---

## 📞 Contact

- 📧 Email: support@vuavuive.com
- 💬 Slack: #group5-support
- 📝 Issues: [GitHub Issues](https://github.com/duckbumbum301/Group5_FinalProject/issues)

---

**Last updated:** November 4, 2025  
**Version:** 2.0.0  
**Maintained by:** Group 5

---

## 🔖 Quick Commands Reference

```bash
# Setup
npm install

# Test
npm run test:api

# Run
npm start

# Backend only
npm run backend

# Frontend only
npm run frontend

# Pull latest
git pull origin main

# Commit
git add .
git commit -m "message"
git push origin main
```

---

**Chúc bạn làm việc hiệu quả! 💪**

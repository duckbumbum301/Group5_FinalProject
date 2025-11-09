# 🚀 HƯỚNG DẪN KHỞI ĐỘNG DỰ ÁN VỰA VUI VẺ

## 📋 Yêu Cầu Hệ Thống

- ✅ **Node.js** phiên bản 14.x trở lên
- ✅ **npm** (đi kèm với Node.js)
- ✅ **Windows** (script hỗ trợ .bat)
- ✅ **Port** 3000, 8000, 8888 phải trống

---

## ⚡ KHỞI ĐỘNG NHANH (Đơn Giản Nhất)

### Cách 1: Sử dụng Script Tự Động (⭐ Khuyên Dùng)

```bash
# Bước 1: Double-click vào file
start-all.bat

# Hoặc chạy từ Command Prompt
start-all.bat
```

**Script sẽ tự động:**

- ✅ Kiểm tra Node.js
- ✅ Dừng các process cũ
- ✅ Cài đặt dependencies (nếu thiếu)
- ✅ Khởi động VNPay Backend (Port 8888)
- ✅ Khởi động API Backend (Port 3000)
- ✅ Khởi động Frontend (Port 8000)
- ✅ Mở browser tự động

### Cách 2: Sử dụng npm (Manual)

```bash
# Terminal 1: VNPay Backend
cd vnpay_nodejs
npm start

# Terminal 2: API Backend + Frontend
cd ..
npm start
```

---

## 🛑 DỪNG DỰ ÁN

### Cách 1: Sử dụng Script

```bash
stop-all.bat
```

### Cách 2: Manual

```bash
# Dừng tất cả Node.js processes
taskkill /F /IM node.exe
```

---

## 🌐 TRUY CẬP ỨNG DỤNG

Sau khi khởi động thành công, truy cập:

| Trang             | URL                                        | Mô Tả                 |
| ----------------- | ------------------------------------------ | --------------------- |
| 🏠 **Trang Chủ**  | http://localhost:8000/html/index.html      | Trang chủ website     |
| 🛒 **Giỏ Hàng**   | http://localhost:8000/html/cart.html       | Quản lý giỏ hàng      |
| 👤 **Tài Khoản**  | http://localhost:8000/html/account.html    | Thông tin tài khoản   |
| 📊 **Backoffice** | http://localhost:8000/backoffice/          | Quản trị hệ thống     |
| 🧪 **Test VNPay** | http://localhost:8000/test-vnpay-flow.html | Test thanh toán VNPay |

---

## 🔧 API ENDPOINTS

| Service         | Port | Endpoint                                       | Mô Tả                |
| --------------- | ---- | ---------------------------------------------- | -------------------- |
| 📦 **Products** | 3000 | http://localhost:3000/products                 | API sản phẩm         |
| 👥 **Users**    | 3000 | http://localhost:3000/users                    | API người dùng       |
| 🛍️ **Orders**   | 3000 | http://localhost:3000/orders                   | API đơn hàng         |
| 💳 **VNPay**    | 8888 | http://localhost:8888/order/create_payment_url | API thanh toán VNPay |

---

## 💳 THÔNG TIN TEST VNPAY SANDBOX

```
Ngân hàng:    NCB (Ngân hàng TMCP Quốc dân)
Số thẻ:       9704198526191432198
Tên chủ thẻ:  NGUYEN VAN A
Ngày hết hạn: 07/15
Mã OTP:       123456
```

---

## 🔥 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: "Port đã được sử dụng"

**Nguyên nhân:** Port 3000, 8000 hoặc 8888 đang bị chiếm

**Giải pháp:**

```bash
# Cách 1: Chạy stop-all.bat
stop-all.bat

# Cách 2: Manual
taskkill /F /IM node.exe

# Cách 3: Kill port cụ thể (ví dụ port 3000)
netstat -ano | findstr :3000
taskkill /F /PID [PID_NUMBER]
```

### ❌ Lỗi: "Cannot find module"

**Nguyên nhân:** Thiếu dependencies

**Giải pháp:**

```bash
# Cài lại dependencies
npm install

# Cài cho VNPay
cd vnpay_nodejs
npm install
cd ..
```

### ❌ Lỗi: "CORS blocked" khi thanh toán VNPay

**Nguyên nhân:** VNPay backend chưa khởi động

**Giải pháp:**

```bash
# Khởi động lại VNPay
cd vnpay_nodejs
npm start
```

### ❌ Lỗi: "API không response"

**Nguyên nhân:** Backend chưa khởi động

**Giải pháp:**

```bash
# Kiểm tra backend
curl http://localhost:3000/products

# Nếu không response, khởi động lại
npm run backend
```

---

## 📊 KIỂM TRA TRẠNG THÁI SERVICES

```bash
# Xem các port đang chạy
netstat -ano | findstr ":8888 :3000 :8000"

# Kết quả mong đợi:
# TCP    0.0.0.0:3000    LISTENING
# TCP    0.0.0.0:8000    LISTENING
# TCP    0.0.0.0:8888    LISTENING
```

---

## 📝 CÁC LỆNH THƯỜNG DÙNG

```bash
# Khởi động đầy đủ (tự động)
start-all.bat

# Khởi động từng phần
npm run backend      # Chỉ backend API
npm run frontend     # Chỉ frontend
npm run vnpay        # Chỉ VNPay

# Khởi động đồng thời (manual)
npm start            # Backend + Frontend
npm run dev:vnpay    # Backend + Frontend + VNPay

# Đồng bộ products (86 sản phẩm)
npm run sync

# Dừng tất cả
stop-all.bat
```

---

## 🎯 WORKFLOW PHÁT TRIỂN

### 1️⃣ Lần Đầu Clone Project

```bash
# Clone repository
git clone https://github.com/duckbumbum301/Group5_FinalProject.git
cd Group5_FinalProject

# Khởi động (tự động cài đặt dependencies)
start-all.bat
```

### 2️⃣ Làm Việc Hàng Ngày

```bash
# Mở dự án
cd Group5_FinalProject

# Khởi động
start-all.bat

# Code...

# Dừng khi xong
stop-all.bat
```

### 3️⃣ Push Code Lên GitHub

```bash
# Dừng services trước
stop-all.bat

# Git workflow
git add .
git commit -m "Your message"
git push origin main
```

---

## 🎨 CẤU TRÚC DỰ ÁN

```
Group5_FinalProject/
├── 📄 start-all.bat          ← Script khởi động tự động
├── 📄 stop-all.bat           ← Script dừng services
├── 📄 package.json           ← Dependencies chính
├── 📂 html/                  ← Frontend pages
│   ├── index.html           ← Trang chủ
│   ├── cart.html            ← Giỏ hàng
│   └── account.html         ← Tài khoản
├── 📂 js/                    ← JavaScript modules
│   ├── main.js              ← Entry point
│   ├── checkout.js          ← Thanh toán
│   └── vnpay-api.js         ← VNPay integration
├── 📂 backoffice/            ← Admin panel
│   ├── server-simple.js     ← Backend API
│   └── db.json              ← Database
└── 📂 vnpay_nodejs/          ← VNPay backend
    ├── app.js               ← VNPay server
    └── package.json         ← VNPay dependencies
```

---

## 💡 TIPS & TRICKS

1. **Backup Database Trước Khi Test**

   ```bash
   copy backoffice\db.json backoffice\db.backup.json
   ```

2. **Xem Log Realtime**

   - Mỗi service chạy trong terminal riêng với màu khác nhau
   - VNPay: Màu vàng
   - Backend: Màu xanh lá
   - Frontend: Màu hồng

3. **Test VNPay Nhanh**

   - Truy cập: http://localhost:8000/test-vnpay-flow.html
   - Click "Thanh toán VNPay"
   - Nếu redirect → VNPay hoạt động!

4. **Debug CORS Issues**
   - Kiểm tra VNPay có chạy: http://localhost:8888
   - Xem CORS config trong `vnpay_nodejs/app.js`

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

1. ✅ Kiểm tra Node.js: `node --version`
2. ✅ Kiểm tra ports: `netstat -ano | findstr ":8888 :3000 :8000"`
3. ✅ Xem log trong các terminal windows
4. ✅ Kiểm tra console trong browser (F12)

---

## 🎉 CHÚC BẠN THÀNH CÔNG!

Sau khi khởi động thành công:

- 🏠 Website: http://localhost:8000/html/index.html
- 💳 Test VNPay: http://localhost:8000/test-vnpay-flow.html

Happy Coding! 🚀

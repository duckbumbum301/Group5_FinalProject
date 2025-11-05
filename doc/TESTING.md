# 🧪 TESTING.md - Hướng Dẫn Kiểm Thử Dự Án

> **Dành cho thành viên mới clone dự án về lần đầu**
>
> Tài liệu này hướng dẫn chi tiết từ A-Z, từ cài đặt môi trường đến kiểm thử toàn bộ hệ thống.

---

## ⚡ KHỞI ĐỘNG NHANH (Dành cho lần mở lại sau khi tắt máy)

> **Nếu bạn đã setup dự án trước đó và chỉ cần mở lại sau khi tắt máy:**

### Bước 1: Mở Visual Studio Code

```bash
# Di chuyển vào thư mục dự án
cd E:\Nam3\TaiLieuHocKi6\final\Group5_FinalProject\Group5_FinalProject

# Mở VS Code
code .
```

### Bước 2: Mở 2 Terminal trong VS Code

**Cách mở Terminal:**

- Nhấn `` Ctrl + ` `` (phím backtick)
- Hoặc Menu: `Terminal` → `New Terminal`

### Bước 3: Khởi động Backend (Terminal 1)

```bash
# Terminal 1 - JSON Server
cd backoffice
npx json-server --watch db.json --port 3000
```

**Chờ thấy thông báo:**

```
\{^_^}/ hi!
Loading db.json
Done
Resources
http://localhost:3000/products
http://localhost:3000/orders
```

✅ **Backend đã sẵn sàng!**

### Bước 4: Khởi động Frontend (Terminal 2)

Nhấn nút **+** để mở Terminal thứ 2, sau đó:

```bash
# Terminal 2 - HTTP Server
npx http-server -p 8000 -c-1
```

**Chờ thấy thông báo:**

```
Starting up http-server
Available on:
  http://127.0.0.1:8000
```

✅ **Frontend đã sẵn sàng!**

### Bước 5: Truy cập ứng dụng

- **Khách hàng:** http://localhost:8000/html/index.html
- **Admin:** http://localhost:8000/backoffice/

### 🎯 Hoàn tất! Dự án đã chạy.

**Lưu ý:**

- Giữ 2 terminal luôn chạy trong khi làm việc
- Không tắt terminal khi đang test
- Khi muốn dừng: Nhấn `Ctrl + C` ở mỗi terminal

---

## 📋 MỤC LỤC ĐẦY ĐỦ

1. [Cài Đặt Môi Trường](#1-cài-đặt-môi-trường) _(Chỉ cần làm 1 lần đầu)_
2. [Clone và Setup Dự Án](#2-clone-và-setup-dự-án) _(Chỉ cần làm 1 lần đầu)_
3. [Khởi Động Backend và Frontend](#3-khởi-động-backend-và-frontend) _(Làm mỗi lần mở dự án)_
4. [Kiểm Thử Frontend (Khách Hàng)](#4-kiểm-thử-frontend-khách-hàng)
5. [Kiểm Thử Backoffice (Admin)](#5-kiểm-thử-backoffice-admin)
6. [Kiểm Thử API](#6-kiểm-thử-api)
7. [Xử Lý Lỗi Thường Gặp](#7-xử-lý-lỗi-thường-gặp)

---

## 1. CÀI ĐẶT MÔI TRƯỜNG

### Bước 1.1: Cài Node.js và npm

**Node.js** là môi trường chạy JavaScript ở server, **npm** là trình quản lý packages.

#### Windows:

1. Truy cập: https://nodejs.org/
2. Download phiên bản **LTS (Long Term Support)** - khuyến nghị v18 trở lên
3. Chạy file `.msi` vừa tải về
4. Trong quá trình cài đặt:
   - ✅ Chọn "Automatically install necessary tools"
   - ✅ Chọn "Add to PATH"
5. Restart máy tính sau khi cài xong

#### macOS:

```bash
# Cài Homebrew (nếu chưa có)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Cài Node.js
brew install node
```

#### Linux (Ubuntu/Debian):

```bash
# Cài Node.js v18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Bước 1.2: Kiểm Tra Cài Đặt

Mở **Terminal** (hoặc **Command Prompt** trên Windows):

```bash
# Kiểm tra phiên bản Node.js
node --version
# Kết quả mong đợi: v18.x.x hoặc cao hơn

# Kiểm tra phiên bản npm
npm --version
# Kết quả mong đợi: 9.x.x hoặc cao hơn
```

✅ **Nếu thấy phiên bản hiển thị → Cài đặt thành công!**

❌ **Nếu báo lỗi "command not found":**

- Windows: Restart máy tính và thử lại
- macOS/Linux: Thêm Node.js vào PATH hoặc cài lại

### Bước 1.3: Cài Git (nếu chưa có)

#### Windows:

1. Download: https://git-scm.com/download/win
2. Chạy file installer
3. Chọn "Git from the command line and also from 3rd-party software"

#### macOS:

```bash
brew install git
```

#### Linux:

```bash
sudo apt-get install git
```

Kiểm tra:

```bash
git --version
# Kết quả: git version 2.x.x
```

---

## 2. CLONE VÀ SETUP DỰ ÁN

### Bước 2.1: Clone Repository

```bash
# Clone dự án về máy
git clone https://github.com/duckbumbum301/Group5_FinalProject.git

# Di chuyển vào thư mục dự án
cd Group5_FinalProject/Group5_FinalProject
```

### Bước 2.2: Cài Dependencies

```bash
# Cài đặt tất cả packages cần thiết
npm install
```

**Giải thích:**

- Lệnh này đọc file `package.json`
- Tự động tải về các packages: `json-server`, `http-server`
- Packages được lưu trong folder `node_modules/`

**Thời gian:** ~30-60 giây (tùy tốc độ mạng)

### Bước 2.3: Xác Nhận Cài Đặt

Kiểm tra xem folder `node_modules` đã được tạo chưa:

#### Windows (PowerShell):

```powershell
dir node_modules
```

#### macOS/Linux:

```bash
ls -la node_modules
```

✅ **Thành công nếu thấy nhiều folders con bên trong**

---

## 3. KHỞI ĐỘNG BACKEND VÀ FRONTEND

### Bước 3.1: Khởi Động Bằng Script Tự Động

#### Windows:

```powershell
# Chạy file setup tự động
.\setup.bat
```

#### macOS/Linux:

```bash
# Cấp quyền thực thi (chỉ cần 1 lần)
chmod +x setup.sh

# Chạy script
./setup.sh
```

**Script này sẽ:**

1. ✅ Kiểm tra Node.js đã cài chưa
2. ✅ Cài dependencies (nếu chưa có)
3. ✅ Khởi động JSON Server trên port 3000
4. ✅ Khởi động HTTP Server trên port 8000

### Bước 3.2: Khởi Động Thủ Công (nếu script lỗi)

Mở **2 terminal riêng biệt**:

#### Terminal 1 - Backend (JSON Server):

```bash
cd backoffice
npx json-server --watch db.json --port 3000
```

Kết quả mong đợi:

```
\{^_^}/ hi!

Loading db.json
Done

Resources
http://localhost:3000/products
http://localhost:3000/orders
http://localhost:3000/users
http://localhost:3000/auditLogs

Home
http://localhost:3000
```

#### Terminal 2 - Frontend (HTTP Server):

```bash
# Mở terminal mới, từ thư mục gốc dự án
npx http-server -p 8000 -c-1
```

Kết quả mong đợi:

```
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8000
  http://192.168.x.x:8000
```

### Bước 3.3: Xác Nhận Servers Đang Chạy

#### Kiểm tra bằng trình duyệt:

- Backend API: http://localhost:3000
- Frontend: http://localhost:8000
- Backoffice: http://localhost:8000/backoffice

#### Kiểm tra bằng lệnh (Windows PowerShell):

```powershell
# Kiểm tra ports đang listen
Get-NetTCPConnection -LocalPort 3000,8000 | Select-Object LocalPort, State
```

Kết quả mong đợi:

```
LocalPort  State
---------  -----
     3000  Listen
     8000  Listen
```

#### Kiểm tra bằng lệnh (macOS/Linux):

```bash
# Kiểm tra ports đang mở
lsof -i :3000,8000
```

---

## 4. KIỂM THỬ FRONTEND (KHÁCH HÀNG)

### Test Case 1: Trang Chủ và Danh Sách Sản Phẩm

#### Bước thực hiện:

1. Mở trình duyệt: http://localhost:8000/html/index.html
2. Chờ trang load (2-3 giây)

#### Kết quả mong đợi:

- ✅ Hiển thị 86 sản phẩm từ API
- ✅ Các sản phẩm có hình ảnh, tên, giá
- ✅ Có phân trang (nếu quá nhiều sản phẩm)
- ✅ Nút "Thêm vào giỏ" hoạt động

#### Kiểm tra Console (F12):

```
✅ Không có lỗi màu đỏ
✅ Thấy log: "Loaded X products from API"
```

#### Nếu lỗi:

- ❌ Sản phẩm không hiển thị → Xem [Lỗi 1: API không kết nối](#lỗi-1-api-không-kết-nối)
- ❌ Hình ảnh bị vỡ → Xem [Lỗi 2: CORS Policy](#lỗi-2-cors-policy)

---

### Test Case 2: Thêm Sản Phẩm Vào Giỏ Hàng

#### Bước thực hiện:

1. Từ trang chủ, click nút **"Thêm vào giỏ"** ở bất kỳ sản phẩm nào
2. Quan sát góc phải trên màn hình

#### Kết quả mong đợi:

- ✅ Icon giỏ hàng hiển thị số lượng (badge màu đỏ)
- ✅ Thông báo "Đã thêm vào giỏ hàng" xuất hiện
- ✅ Số lượng trong giỏ tăng lên

#### Kiểm tra LocalStorage:

Mở **Console** (F12), gõ:

```javascript
JSON.parse(localStorage.getItem("cart"));
```

Kết quả mong đợi:

```json
[
  {
    "id": "PROD001",
    "name": "Tên sản phẩm",
    "quantity": 1,
    "price": 25000
  }
]
```

---

### Test Case 3: Xem Giỏ Hàng

#### Bước thực hiện:

1. Click vào icon **giỏ hàng** ở header
2. Hoặc truy cập: http://localhost:8000/html/cart.html

#### Kết quả mong đợi:

- ✅ Hiển thị danh sách sản phẩm đã thêm
- ✅ Có nút tăng/giảm số lượng (+/-)
- ✅ Hiển thị tổng tiền chính xác
- ✅ Nút "Thanh toán" hoạt động
- ✅ Nút "Xóa" để xóa sản phẩm

#### Test tăng/giảm số lượng:

1. Click nút **+** → Số lượng tăng, tổng tiền tăng theo
2. Click nút **-** → Số lượng giảm, tổng tiền giảm theo
3. Khi số lượng = 1, click **-** → Sản phẩm bị xóa khỏi giỏ

---

### Test Case 4: Đặt Hàng (Checkout)

#### Bước thực hiện:

1. Từ trang giỏ hàng, click **"Thanh toán"**
2. Điền form thông tin:
   - **Họ tên:** Nguyễn Văn A
   - **SĐT:** 0901234567
   - **Email:** nguyenvana@example.com
   - **Địa chỉ:** 123 Nguyễn Huệ, Q1, TP.HCM
   - **Phương thức thanh toán:** COD (hoặc Banking)
3. Click **"Đặt hàng"**

#### Kết quả mong đợi:

- ✅ Thông báo "Đặt hàng thành công"
- ✅ Chuyển đến trang xác nhận đơn hàng
- ✅ Hiển thị mã đơn hàng (VD: ORD20250103004)
- ✅ Giỏ hàng bị xóa sạch
- ✅ Icon giỏ hàng về 0

#### Kiểm tra API:

Mở terminal, gõ:

```bash
curl http://localhost:3000/orders
```

Hoặc mở trình duyệt: http://localhost:3000/orders

Kết quả mong đợi:

```json
[
  {
    "id": "ORD20250103004",
    "customerName": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "nguyenvana@example.com",
    "address": "123 Nguyễn Huệ, Q1, TP.HCM",
    "items": [...],
    "totalAmount": 150000,
    "paymentMethod": "cod",
    "status": "pending",
    "createdAt": "2025-01-03T10:30:00.000Z"
  }
]
```

---

### Test Case 5: Trang Recipes (Công Thức Nấu Ăn)

#### Bước thực hiện:

1. Truy cập: http://localhost:8000/html/recipes.html
2. Click vào bất kỳ công thức nào

#### Kết quả mong đợi:

- ✅ Hiển thị danh sách các món ăn
- ✅ Click vào món → Hiển thị nguyên liệu
- ✅ Nút "Thêm vào giỏ" ở mỗi nguyên liệu
- ✅ Nút "Thêm tất cả nguyên liệu" hoạt động
- ✅ **KHÔNG** hiển thị alert "nguyên liệu phù hợp trong kho"

#### Nếu thấy alert lỗi:

→ Xem [Lỗi 3: Recipes alert nguyên liệu](#lỗi-3-recipes-alert-nguyên-liệu)

---

## 5. KIỂM THỬ BACKOFFICE (ADMIN)

### Test Case 6: Đăng Nhập Admin

#### Bước thực hiện:

1. Truy cập: http://localhost:8000/backoffice/
2. Nhập thông tin:
   - **Email:** admin@vuavuive.vn
   - **Password:** admin123
3. Click **"Đăng nhập"**

#### Kết quả mong đợi:

- ✅ Đăng nhập thành công
- ✅ Chuyển đến Dashboard
- ✅ Sidebar hiển thị menu: Dashboard, Products, Orders, Audit
- ✅ Header hiển thị tên admin và nút logout

#### Nếu lỗi:

- ❌ "Email hoặc mật khẩu không đúng" → Kiểm tra db.json có user admin không
- ❌ "Cannot fetch /users" → JSON Server chưa chạy

---

### Test Case 7: Quản Lý Sản Phẩm

#### Bước thực hiện:

1. Từ Dashboard, click **"Products"** ở sidebar
2. Chờ danh sách sản phẩm load

#### Kết quả mong đợi:

- ✅ Hiển thị 86 sản phẩm từ API
- ✅ Có bảng với các cột: ID, Tên, Danh mục, Giá, Tồn kho, Hành động
- ✅ Có nút **"Thêm sản phẩm mới"**
- ✅ Mỗi sản phẩm có nút **Edit** và **Delete**

#### Test Thêm Sản Phẩm:

1. Click **"Thêm sản phẩm mới"**
2. Điền form:
   - **ID:** TEST001 (phải unique)
   - **Tên:** Sản phẩm test
   - **Danh mục:** DRINK
   - **Giá:** 50000
   - **Tồn kho:** 100
   - **Mô tả:** Test description
3. Click **"Lưu"**

Kết quả mong đợi:

- ✅ Thông báo "Thêm sản phẩm thành công"
- ✅ Sản phẩm mới xuất hiện trong danh sách
- ✅ API có sản phẩm mới: http://localhost:3000/products?id=TEST001

#### Test Sửa Sản Phẩm:

1. Click nút **Edit** ở sản phẩm vừa tạo
2. Sửa tên thành "Sản phẩm test (đã sửa)"
3. Click **"Lưu"**

Kết quả mong đợi:

- ✅ Thông báo "Cập nhật thành công"
- ✅ Tên sản phẩm thay đổi trong danh sách

#### Test Xóa Sản Phẩm:

1. Click nút **Delete** ở sản phẩm test
2. Xác nhận xóa

Kết quả mong đợi:

- ✅ Thông báo "Xóa thành công"
- ✅ Sản phẩm biến mất khỏi danh sách
- ✅ API không còn sản phẩm: http://localhost:3000/products?id=TEST001

---

### Test Case 8: Quản Lý Đơn Hàng (Orders)

#### Bước thực hiện:

1. Từ Dashboard, click **"Orders"**
2. Chờ danh sách đơn hàng load

#### Kết quả mong đợi:

- ✅ Hiển thị danh sách đơn hàng (ít nhất 3 đơn mẫu)
- ✅ Mỗi đơn có: Mã đơn, Tên khách, SĐT, Tổng tiền, Trạng thái, Hành động
- ✅ Có dropdown filter theo trạng thái
- ✅ Có thanh tìm kiếm theo tên khách hàng

#### Danh sách đơn hàng mẫu:

```
ORD20250103001 - Nguyễn Văn A - 0901234567 - 48,000₫ - Pending
ORD20250103002 - Trần Thị B - 0902345678 - 45,000₫ - Confirmed
ORD20250102001 - Lê Văn C - 0903456789 - 95,000₫ - Pending
```

#### Test Xem Chi Tiết Đơn Hàng:

1. Click vào **mã đơn hàng** (VD: ORD20250103001)
2. Modal chi tiết đơn hàng hiển thị

Kết quả mong đợi:

- ✅ Thông tin khách hàng: Tên, SĐT, Email, Địa chỉ
- ✅ Danh sách sản phẩm: Tên, Số lượng, Đơn giá, Thành tiền
- ✅ Tổng cộng chính xác
- ✅ Trạng thái đơn hàng hiện tại
- ✅ Nút đóng modal

#### Test Cập Nhật Trạng Thái:

**Với đơn hàng "Pending":**

1. Tìm đơn có trạng thái **"Pending"** (màu vàng)
2. Click nút **"Xác nhận"**

Kết quả mong đợi:

- ✅ Trạng thái chuyển thành **"Confirmed"** (màu xanh lam)
- ✅ Nút action chuyển thành **"Sẵn sàng"**
- ✅ Database cập nhật: http://localhost:3000/orders/ORD20250103001

**Với đơn hàng "Confirmed":**

1. Click nút **"Sẵn sàng"**

Kết quả mong đợi:

- ✅ Trạng thái chuyển thành **"Ready"**
- ✅ Nút action chuyển thành **"Shipper nhận"**

**Tiếp tục test các trạng thái:**

- Ready → Click "Shipper nhận" → **Pickup**
- Pickup → Click "Đang giao" → **Delivering**
- Delivering → Click "Hoàn thành" → **Delivered** (màu xanh lá)

#### Test Filter Đơn Hàng:

1. Click dropdown **"Trạng thái"**
2. Chọn **"Pending"**

Kết quả mong đợi:

- ✅ Chỉ hiển thị đơn hàng có trạng thái Pending
- ✅ Các đơn khác bị ẩn

3. Chọn **"All"** → Hiển thị lại toàn bộ

#### Test Tìm Kiếm:

1. Gõ "Nguyễn" vào ô tìm kiếm

Kết quả mong đợi:

- ✅ Chỉ hiển thị đơn hàng của khách có tên chứa "Nguyễn"
- ✅ Filter real-time (không cần bấm Enter)

---

### Test Case 9: Audit Logs (Nhật Ký Hệ Thống)

#### Bước thực hiện:

1. Từ Dashboard, click **"Audit"**
2. Chờ danh sách logs load

#### Kết quả mong đợi:

- ✅ Hiển thị lịch sử các thao tác:
  - Admin đăng nhập
  - Admin cập nhật trạng thái đơn hàng
  - Admin thêm/sửa/xóa sản phẩm
- ✅ Mỗi log có: Thời gian, Admin, Hành động, Chi tiết

Ví dụ log:

```
2025-01-03 10:30:45 - admin@vuavuive.vn - ORDER_STATUS_UPDATED
  → Order ORD20250103001: pending → confirmed
```

---

### Test Case 10: Dashboard Thống Kê

#### Bước thực hiện:

1. Click **"Dashboard"** ở sidebar

#### Kết quả mong đợi:

- ✅ Hiển thị các thẻ thống kê:
  - **Tổng sản phẩm:** 86
  - **Tổng đơn hàng:** X đơn
  - **Đơn chờ xử lý:** Y đơn
  - **Doanh thu:** Z₫
- ✅ Biểu đồ/bảng đơn hàng gần đây
- ✅ Dữ liệu load từ API (không hardcode)

---

## 6. KIỂM THỬ API

### Test API Bằng Trình Duyệt

#### GET Products:

```
http://localhost:3000/products
```

Kết quả: Array 86 sản phẩm

#### GET Orders:

```
http://localhost:3000/orders
```

Kết quả: Array các đơn hàng

#### GET Users:

```
http://localhost:3000/users
```

Kết quả: Array 3 users (admin, user1, user2)

#### GET Audit Logs:

```
http://localhost:3000/auditLogs
```

Kết quả: Array các logs

#### GET Sản Phẩm Theo ID:

```
http://localhost:3000/products?id=PROD001
```

Kết quả: 1 sản phẩm

#### GET Đơn Hàng Theo Status:

```
http://localhost:3000/orders?status=pending
```

Kết quả: Các đơn có status = pending

---

### Test API Bằng cURL (Terminal)

#### GET Request:

```bash
curl http://localhost:3000/products
```

#### POST Request (Thêm đơn hàng):

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ORD20250103999",
    "customerName": "Test User",
    "phone": "0999999999",
    "email": "test@test.com",
    "address": "Test Address",
    "items": [
      {"productId": "PROD001", "productName": "Test", "quantity": 1, "price": 10000, "subtotal": 10000}
    ],
    "totalAmount": 10000,
    "paymentMethod": "cod",
    "status": "pending",
    "createdAt": "2025-01-03T10:00:00.000Z"
  }'
```

#### PATCH Request (Cập nhật trạng thái):

```bash
curl -X PATCH http://localhost:3000/orders/ORD20250103999 \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed", "updatedAt": "2025-01-03T11:00:00.000Z"}'
```

#### DELETE Request (Xóa đơn test):

```bash
curl -X DELETE http://localhost:3000/orders/ORD20250103999
```

---

### Test API Bằng Postman (Optional)

Nếu bạn có Postman cài đặt:

1. Download Postman: https://www.postman.com/downloads/
2. Import collection từ file `postman_collection.json` (nếu có)
3. Hoặc tạo requests thủ công như các ví dụ cURL ở trên

---

## 7. XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: API Không Kết Nối

**Triệu chứng:**

- Frontend không hiển thị sản phẩm
- Console báo: `Failed to fetch` hoặc `net::ERR_CONNECTION_REFUSED`

**Nguyên nhân:**

- JSON Server chưa chạy hoặc bị tắt

**Cách fix:**

```bash
# Kiểm tra port 3000 có đang mở không
# Windows:
Get-NetTCPConnection -LocalPort 3000

# macOS/Linux:
lsof -i :3000

# Nếu không có → Khởi động lại JSON Server
cd backoffice
npx json-server --watch db.json --port 3000
```

---

### Lỗi 2: CORS Policy

**Triệu chứng:**

- Console báo: `Access to fetch has been blocked by CORS policy`

**Nguyên nhân:**

- Mở file HTML trực tiếp từ file system (`file://`) thay vì qua HTTP Server

**Cách fix:**

- ✅ **ĐÚNG:** Truy cập qua http://localhost:8000/html/index.html
- ❌ **SAI:** Mở file `E:\...\index.html` trực tiếp

Nếu vẫn lỗi:

```bash
# Khởi động lại HTTP Server với CORS disabled
npx http-server -p 8000 -c-1 --cors
```

---

### Lỗi 3: Recipes Alert Nguyên Liệu

**Triệu chứng:**

- Click vào công thức nấu ăn → Hiện alert "sao tôi bấm vào nó lại hiển thị arlert nguyên liệu phù hợp trong kho"

**Nguyên nhân:**

- File `js/recipes.js` đang import sai hoặc có logic cũ

**Cách fix:**
Kiểm tra file `js/recipes.js` dòng đầu:

```javascript
// ✅ ĐÚNG:
import { PRODUCTS } from "./data.js";

// ❌ SAI:
// import PRODUCTS from ...
```

---

### Lỗi 4: Port Already in Use

**Triệu chứng:**

- Khởi động server báo: `Port 3000 is already in use`

**Cách fix:**

#### Windows:

```powershell
# Tìm process đang dùng port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Giả sử OwningProcess = 12345
Stop-Process -Id 12345 -Force
```

#### macOS/Linux:

```bash
# Tìm và kill process
lsof -ti :3000 | xargs kill -9
```

Sau đó khởi động lại server.

---

### Lỗi 5: Module Not Found

**Triệu chứng:**

- Terminal báo: `Error: Cannot find module 'json-server'`

**Nguyên nhân:**

- Chưa chạy `npm install` hoặc bị lỗi khi cài

**Cách fix:**

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install

# Hoặc trên Windows:
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

### Lỗi 6: LocalStorage Not Working

**Triệu chứng:**

- Giỏ hàng không lưu sau khi refresh trang

**Nguyên nhân:**

- Trình duyệt chặn LocalStorage ở chế độ Incognito/Private
- Hoặc mở file từ `file://`

**Cách fix:**

- Tắt chế độ Incognito
- Truy cập qua http://localhost:8000

---

### Lỗi 7: JSON Server Data Bị Mất

**Triệu chứng:**

- Sản phẩm/orders bị xóa hết sau khi restart

**Nguyên nhân:**

- File `db.json` bị ghi đè hoặc corrupted

**Cách fix:**

```bash
# Restore từ backup (nếu có)
cd backoffice
cp db.json.backup db.json

# Hoặc chạy lại sync script
node sync-products.js
```

---

## 8. CHECKLIST KIỂM THỬ HOÀN CHỈNH

### Frontend (Khách Hàng):

- [ ] Trang chủ load 86 sản phẩm từ API
- [ ] Thêm sản phẩm vào giỏ hàng thành công
- [ ] Xem giỏ hàng, tăng/giảm số lượng
- [ ] Thanh toán và tạo đơn hàng thành công
- [ ] Trang recipes không hiện alert lỗi
- [ ] Thêm tất cả nguyên liệu vào giỏ hàng
- [ ] LocalStorage lưu giỏ hàng sau refresh

### Backoffice (Admin):

- [ ] Đăng nhập admin thành công
- [ ] Dashboard hiển thị thống kê đúng
- [ ] Xem danh sách 86 sản phẩm
- [ ] Thêm sản phẩm mới thành công
- [ ] Sửa thông tin sản phẩm thành công
- [ ] Xóa sản phẩm thành công
- [ ] Xem danh sách đơn hàng (ít nhất 3 đơn)
- [ ] Xem chi tiết đơn hàng (thông tin khách + items)
- [ ] Cập nhật trạng thái: pending → confirmed → ready → pickup → delivering → delivered
- [ ] Filter đơn hàng theo trạng thái
- [ ] Tìm kiếm đơn hàng theo tên khách hàng
- [ ] Xem audit logs

### API:

- [ ] GET /products trả về 86 sản phẩm
- [ ] GET /orders trả về danh sách đơn hàng
- [ ] GET /users trả về 3 users
- [ ] POST /orders tạo đơn mới thành công
- [ ] PATCH /orders/:id cập nhật trạng thái thành công
- [ ] DELETE /products/:id xóa sản phẩm thành công

---

## 9. LƯU Ý QUAN TRỌNG

### Trước Khi Commit Code:

1. **Không commit `node_modules/`:**

   - File `.gitignore` đã loại trừ folder này
   - Chỉ commit `package.json` và `package-lock.json`

2. **Không commit `db.json` với dữ liệu test:**

   - Backup `db.json` gốc trước khi test
   - Restore lại trước khi commit

3. **Kiểm tra không có hardcoded credentials:**
   - Admin password không nên là "admin123" trên production
   - API URLs không nên hardcode `localhost`

### Khi Deploy Lên Server:

1. **Đổi API URL:**

   - Sửa `js/api.js` và `backoffice/api.js`
   - Thay `http://localhost:3000` → `https://your-domain.com/api`

2. **Sử dụng Database thật:**

   - JSON Server chỉ dùng cho development
   - Production nên dùng MongoDB, PostgreSQL, MySQL

3. **Enable HTTPS:**
   - Cài SSL certificate
   - Redirect HTTP → HTTPS

---

## 10. TÀI LIỆU THAM KHẢO

- **QUICKSTART.md** - Hướng dẫn khởi động nhanh
- **BACKEND_SETUP.md** - Chi tiết về JSON Server setup
- **SYSTEM_FLOW.md** - Luồng hoạt động của hệ thống
- **API_INTEGRATION_COMPLETE.md** - Tài liệu API đầy đủ
- **README.md** - Tổng quan dự án

---

## 11. HỖ TRỢ

Nếu gặp vấn đề không nằm trong tài liệu này:

1. Kiểm tra Console (F12) để xem error message
2. Kiểm tra Terminal xem JSON Server có báo lỗi không
3. Search lỗi trên Google/StackOverflow
4. Hỏi team lead hoặc tạo Issue trên GitHub

---

**Chúc bạn test thành công! 🎉**

_Last updated: 2025-01-03_

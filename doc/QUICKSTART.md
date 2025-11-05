# 🚀 Quick Start Guide

## Dành cho thành viên nhóm clone project lần đầu

### 1️⃣ Clone Project

```bash
git clone https://github.com/duckbumbum301/Group5_FinalProject.git
cd Group5_FinalProject/Group5_FinalProject
```

### 2️⃣ Setup (Chỉ cần 1 lần)

**Windows:**

```bash
.\setup.bat
```

**Mac/Linux:**

```bash
chmod +x setup.sh
./setup.sh
```

### 3️⃣ Chạy Project

```bash
npm start
```

### 4️⃣ Truy cập

- **Trang chủ**: http://localhost:8000
- **Admin**: http://localhost:8000/backoffice
- **API**: http://localhost:3000/products

---

## 📝 Commands thường dùng

```bash
# Chạy servers
npm start              # Cả backend + frontend
npm run backend        # Chỉ backend (port 3000)
npm run frontend       # Chỉ frontend (port 8000)

# Đồng bộ products
npm run sync           # Sync 86 products vào db.json

# Dừng servers
Ctrl + C               # Trong terminal đang chạy
```

---

## 🔥 Lỗi thường gặp

**"Port đã được sử dụng":**

```bash
taskkill /F /IM node.exe    # Windows
killall node                # Mac/Linux
```

**"Cannot find module":**

```bash
npm install
```

**"API không hoạt động":**

```bash
# Kiểm tra
curl http://localhost:3000/products

# Khởi động lại
npm start
```

---

## 📂 Files quan trọng

```
backoffice/db.json        → Database (86 products)
package.json              → Dependencies
js/api.js                 → Frontend API calls
backoffice/api.js         → Backend API wrapper
```

---

## 💡 Tips

- Backup `db.json` trước khi test
- Commit thường xuyên
- Check `BACKEND_SETUP.md` cho chi tiết
- Test trên http://localhost:8000 (KHÔNG phải file://)

---

**🎯 Mục tiêu**: Thêm/Sửa/Xóa sản phẩm ở Backoffice → Tự động hiển thị ở Trang chủ!

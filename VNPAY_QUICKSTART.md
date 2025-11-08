# 🚀 TÍCH HỢP VNPAY - QUICK START

## ✅ ĐÃ HOÀN THÀNH

Tích hợp VNPay vào dự án Vựa Vui Vẻ với **5 bước đơn giản**.

---

## 🎯 CÁCH CHẠY (2 PHÚT)

### **Cách 1: Dùng Script Tự Động** ⚡

```powershell
# Double-click file này:
start-vnpay.bat
```

### **Cách 2: Chạy Thủ Công** 🔧

```powershell
# Terminal 1: VNPay Backend
cd vnpay_nodejs
npm start

# Terminal 2: Main Project (mở terminal mới)
npm start
```

### **Kiểm Tra Hệ Thống**

```powershell
node test-vnpay.js
```

---

## 🧪 TEST NGAY

1. **Mở:** http://localhost:8000/html/index.html
2. **Login** và thêm sản phẩm vào giỏ
3. **Click:** Thanh toán
4. **Chọn:** 💳 VNPay - Thanh toán online
5. **Test Card:**
   ```
   Số thẻ: 9704198526191432198
   Tên:    NGUYEN VAN A
   Expiry: 07/15
   OTP:    123456
   ```
6. **Done!** ✅

---

## 📁 FILES THAY ĐỔI

| File                               | Status  | Mô tả          |
| ---------------------------------- | ------- | -------------- |
| `vnpay_nodejs/app.js`              | ✏️ Sửa  | Thêm CORS      |
| `vnpay_nodejs/config/default.json` | ✏️ Sửa  | Return URL     |
| `js/vnpay-api.js`                  | 🆕 Mới  | VNPay module   |
| `js/checkout.js`                   | ✏️ Sửa  | Payment logic  |
| `html/vnpay-return.html`           | 🆕 Mới  | Return page    |
| `start-vnpay.bat`                  | 🆕 Mới  | Startup script |
| `README_VNPAY.md`                  | 📖 Docs | Full guide     |

---

## 🔧 TROUBLESHOOTING

| Vấn đề                 | Giải pháp                                          |
| ---------------------- | -------------------------------------------------- |
| "Cannot connect VNPay" | Chạy `cd vnpay_nodejs && npm start`                |
| "CORS error"           | Đảm bảo đã `npm install cors` trong `vnpay_nodejs` |
| "Order not found"      | Check localStorage có `vvv_pending_order`          |

---

## 📚 TÀI LIỆU

- **Chi tiết:** `README_VNPAY.md`
- **VNPay Docs:** https://sandbox.vnpayment.vn/apis/docs/

---

**🎉 Tích hợp thành công! Ready to test!**

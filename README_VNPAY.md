# 🎉 HƯỚNG DẪN TÍCH HỢP VNPAY - VỰA VUI VẺ

## ✅ Đã Hoàn Thành

Tích hợp VNPay đã được cài đặt thành công với các thay đổi sau:

### 1. **Backend Setup** ✓

- ✅ Thêm CORS middleware vào `vnpay_nodejs/app.js`
- ✅ Cập nhật `vnp_ReturnUrl` trong `vnpay_nodejs/config/default.json`
- ✅ Cài đặt package `cors`

### 2. **Frontend Module** ✓

- ✅ Tạo `js/vnpay-api.js` - Module xử lý giao tiếp với VNPay
- ✅ Import vào `js/checkout.js`

### 3. **Checkout Flow** ✓

- ✅ Thêm option "💳 VNPay - Thanh toán online" vào payment methods
- ✅ Xử lý redirect sang VNPay khi user chọn VNPay
- ✅ Lưu pending order vào localStorage

### 4. **Return Page** ✓

- ✅ Tạo `html/vnpay-return.html` - Xử lý kết quả thanh toán
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Hiển thị success/error với UI đẹp

---

## 🚀 CÁCH CHẠY

### **Bước 1: Khởi động VNPay Backend**

```powershell
# Mở Terminal 1
cd vnpay_nodejs
npm start
```

✅ VNPay backend chạy tại: **http://localhost:8888**

### **Bước 2: Khởi động Main Project**

```powershell
# Mở Terminal 2 (mới)
cd ..
npm start
```

✅ Frontend: **http://localhost:8000**  
✅ API Backend: **http://localhost:3000**

### **Bước 3: Test Flow**

1. Truy cập: http://localhost:8000/html/index.html
2. Đăng nhập (hoặc tạo tài khoản)
3. Thêm sản phẩm vào giỏ hàng
4. Click **"Thanh toán"**
5. Chọn **"💳 VNPay - Thanh toán online"**
6. Điền thông tin giao hàng
7. Click **"Xác nhận đặt hàng"**
8. ➡️ Tự động redirect sang VNPay sandbox
9. Thanh toán với thẻ test (xem bên dưới)
10. ✅ Return về trang xác nhận thành công

---

## 🧪 THÔNG TIN TEST (VNPay Sandbox)

### **Ngân hàng: NCB (Ngân hàng TMCP Quốc dân)**

```
Số thẻ:        9704198526191432198
Tên chủ thẻ:   NGUYEN VAN A
Ngày hết hạn:  07/15
OTP:           123456
```

### **Các Response Code Thường Gặp:**

| Code | Ý nghĩa                     |
| ---- | --------------------------- |
| `00` | ✅ Giao dịch thành công     |
| `24` | ❌ Khách hàng hủy giao dịch |
| `11` | ❌ Hết hạn chờ thanh toán   |
| `51` | ❌ Tài khoản không đủ số dư |
| `99` | ❌ Lỗi khác                 |

---

## 📊 FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────┐
│  User Click "Thanh toán" → Chọn VNPay                       │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  apiCreateOrder() → Tạo đơn hàng với status='pending'       │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  createVNPayPaymentUrl() → POST localhost:8888/order/...    │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  submitVNPayForm() → Submit form redirect sang VNPay        │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  User thanh toán trên VNPay Sandbox                          │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  VNPay redirect về: localhost:8000/html/vnpay-return.html   │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  parseVNPayReturn() → Parse response parameters             │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
                   ┌─────┴─────┐
                   │           │
            [Code = 00]   [Code ≠ 00]
                   │           │
                   ▼           ▼
        ┌──────────────┐  ┌──────────┐
        │ SUCCESS      │  │ ERROR    │
        │ ✅ Mark Paid │  │ ❌ Show  │
        │ → Redirect   │  │   Error  │
        └──────────────┘  └──────────┘
```

---

## 🔧 TROUBLESHOOTING

### **Lỗi: "Cannot connect to VNPay"**

- ✅ Check VNPay backend đã chạy chưa: `http://localhost:8888`
- ✅ Check CORS đã enable chưa trong `vnpay_nodejs/app.js`

### **Lỗi: "CORS policy blocking"**

- ✅ Đảm bảo `cors` package đã install: `npm install cors` trong `vnpay_nodejs`
- ✅ Check origin trong CORS config: `['http://localhost:8000', 'http://127.0.0.1:8000']`

### **Lỗi: "Order not found after payment"**

- ✅ Check localStorage có `vvv_pending_order` không
- ✅ Check console log để debug

### **VNPay return về URL sai**

- ✅ Check `vnp_ReturnUrl` trong `vnpay_nodejs/config/default.json`
- ✅ Phải là: `http://localhost:8000/html/vnpay-return.html`

---

## 📁 CẤU TRÚC FILES

```
Group5_FinalProject/
├── vnpay_nodejs/
│   ├── app.js                    # ✏️ Đã thêm CORS
│   ├── config/
│   │   └── default.json          # ✏️ Đã sửa vnp_ReturnUrl
│   └── routes/
│       └── order.js              # (Không đổi)
│
├── html/
│   └── vnpay-return.html         # 🆕 Trang xử lý return
│
├── js/
│   ├── vnpay-api.js              # 🆕 VNPay API module
│   ├── checkout.js               # ✏️ Thêm VNPay logic
│   └── api.js                    # (Không đổi)
│
└── README_VNPAY.md               # 📖 File này
```

---

## ⚡ NEXT STEPS (Tùy chọn)

### 1. **Thêm loading spinner khi redirect**

```javascript
// Trong checkout.js, trước khi redirect
const loader = document.createElement("div");
loader.innerHTML = '<div class="loading">Đang chuyển sang VNPay...</div>';
document.body.appendChild(loader);
```

### 2. **Handle timeout (đơn hàng quá 15 phút chưa thanh toán)**

```javascript
// Thêm vào vnpay-return.html
const orderTime = localStorage.getItem("vvv_pending_order_time");
const elapsed = Date.now() - parseInt(orderTime);
if (elapsed > 15 * 60 * 1000) {
  // Cancel order
}
```

### 3. **Thêm webhook (IPN) để xử lý payment confirmation từ VNPay**

- Tạo endpoint `/order/vnpay_ipn` trong VNPay backend
- VNPay sẽ call endpoint này để confirm payment
- Reliable hơn là chỉ dựa vào return URL

### 4. **Multiple payment methods**

- Thêm các ngân hàng cụ thể (VCB, TCB, MB...)
- User chọn bank trước khi redirect

### 5. **Production deployment**

```json
// vnpay_nodejs/config/production.json
{
  "vnp_Url": "https://pay.vnpay.vn/paymentv2/vpcpay.html",
  "vnp_ReturnUrl": "https://vuavuive.com/vnpay-return"
}
```

---

## 🎯 TẠI SAO GIẢI PHÁP NÀY TỐI ƯU?

| Tiêu chí        | Đánh giá   | Lý do                                                  |
| --------------- | ---------- | ------------------------------------------------------ |
| **Ít Conflict** | ⭐⭐⭐⭐⭐ | VNPay chạy port riêng (8888), không đụng code hiện tại |
| **Dễ Bảo Trì**  | ⭐⭐⭐⭐⭐ | Logic VNPay tách biệt trong module riêng               |
| **An Toàn**     | ⭐⭐⭐⭐⭐ | Secret keys chỉ ở backend, không expose                |
| **UX**          | ⭐⭐⭐⭐   | Smooth redirect, clear feedback                        |
| **Mở rộng**     | ⭐⭐⭐⭐⭐ | Dễ thêm Momo, ZaloPay sau này                          |

---

## 📝 CHECKLIST HOÀN THÀNH

- [x] Cài CORS cho VNPay backend
- [x] Tạo `js/vnpay-api.js`
- [x] Sửa payment options trong `js/checkout.js`
- [x] Thêm VNPay handling logic
- [x] Tạo `html/vnpay-return.html`
- [x] Cập nhật `vnp_ReturnUrl` trong config
- [x] Test với sandbox credentials
- [ ] Handle edge cases (timeout, duplicate payment)
- [ ] Add webhook (IPN) support
- [ ] Document cho team

---

## 🤝 HỖ TRỢ

Nếu gặp vấn đề:

1. **Check console logs** - Tất cả bước quan trọng đều có log
2. **Check network tab** - Xem request/response từ VNPay
3. **Check localStorage** - Xem `vvv_pending_order` có được lưu không
4. **Check both terminals** - VNPay backend (8888) và main backend (3000) đều phải chạy

---

## 📚 TÀI LIỆU THAM KHẢO

- [VNPay Documentation](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/)
- [VNPay Test Credentials](https://sandbox.vnpayment.vn/apis/vnpay-demo/)

---

**🎉 Tích hợp hoàn tất! Chúc bạn test thành công!**

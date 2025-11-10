# 📝 HƯỚNG DẪN CẬP NHẬT TRẠNG THÁI THANH TOÁN

## ✅ Đã hoàn thành

### 1. **Tự động đổi payment_status khi Admin click "Hoàn tất"**

Khi Admin click nút **"Hoàn tất"** (delivered) ở cột **Thao tác**, hệ thống sẽ:

#### 🎯 Với đơn hàng COD:

```
Trạng thái giao: "Đang giao" → "Đã giao" (delivered)
        ↓
Thanh toán: "Chờ thanh toán" → "Đã thanh toán" ✅ (TỰ ĐỘNG)
```

**Logic xử lý:**

- Kiểm tra `paymentMethod` = "COD" hoặc rỗng (mặc định COD)
- Kiểm tra `payment_status` ≠ "paid"
- ✅ Tự động đổi `payment_status = "paid"`
- ✅ Ghi nhận `paid_at` = thời gian hiện tại

#### 💳 Với đơn hàng VNPay:

```
VNPay thành công:
  → payment_status = "paid" (đã được set từ vnpay-return.html)
  → Không cần xử lý thêm

VNPay thất bại:
  → payment_status = "failed"
  → Đơn hàng = "cancelled"
```

---

## 🔧 Code đã sửa

### File: `backoffice/dataManager.js` (dòng 388-409)

```javascript
if (newStatus === "delivered") {
  const paymentMethod = (
    order.paymentMethod ||
    order.payment ||
    ""
  ).toUpperCase();
  const currentPaymentStatus = order.payment_status || "pending";

  // Nếu là COD hoặc không có payment method → đổi thành paid
  const isCOD =
    paymentMethod === "COD" || paymentMethod === "" || !paymentMethod;
  const notPaidYet = currentPaymentStatus !== "paid";

  if (isCOD && notPaidYet) {
    order.payment_status = "paid";
    order.paid_at = new Date().toISOString();
    console.log(`✅ Order ${id}: Auto-marked as paid (COD delivered)`);
  }
}
```

### File: `backoffice/app.js` (dòng 1111-1117)

```javascript
const paymentLabels = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  cod: "COD",
  failed: "Thanh toán thất bại", // ← Mới thêm
  cancelled: "Đã hủy", // ← Mới thêm
  banking: "Chuyển khoản",
};
```

### File: `backoffice/styles.css` (dòng 1017-1047)

```css
/* Payment Status Badges - Màu sắc khác nhau */
.tag.payment-paid {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #16a34a;
}

.tag.payment-pending {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fbbf24;
}

.tag.payment-failed {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #dc2626;
}
```

---

## 🧪 Cách test

### Test COD - Tự động chuyển sang "Đã thanh toán":

1. **Tạo đơn hàng COD mới** (từ frontend)

   - Chọn sản phẩm → Checkout
   - Chọn "💵 COD - Tiền mặt khi nhận hàng"
   - Đặt hàng
   - ✅ `payment_status` = "pending" hoặc "cod"

2. **Vào Backoffice** (`http://localhost:8080/backoffice/`)

   - Đăng nhập (Admin hoặc Manager)
   - Vào **Đơn hàng**
   - Tìm đơn vừa tạo

3. **Click các nút theo thứ tự:**

   - "Xác nhận" → Trạng thái: "Đã xác nhận"
   - "Sẵn sàng" → Trạng thái: "Sẵn sàng"
   - "Shipper nhận" → Trạng thái: "Shipper nhận"
   - "Đang giao" → Trạng thái: "Đang giao"
   - **"Hoàn tất"** → Trạng thái: "Đã giao"

4. **Kiểm tra cột "THANH TOÁN":**
   - ✅ Trước: "Chờ thanh toán" (màu vàng)
   - ✅ Sau: "Đã thanh toán" (màu xanh lá) 🎉

### Test VNPay - Đã được xử lý tự động:

1. **Thanh toán thành công:**

   - Đặt hàng → Chọn VNPay
   - Thanh toán thành công trên sandbox
   - ✅ `payment_status` = "paid" ngay lập tức
   - ✅ Không cần Admin click "Hoàn tất"

2. **Thanh toán thất bại:**
   - Đặt hàng → Chọn VNPay
   - Hủy hoặc dùng thẻ hết hạn
   - ✅ `payment_status` = "failed"
   - ✅ `status` = "cancelled"
   - ✅ Stock không bị trừ

---

## 🎨 Màu sắc hiển thị

| Trạng thái              | Màu           | Badge       |
| ----------------------- | ------------- | ----------- |
| **Đã thanh toán**       | 🟢 Xanh lá    | `paid`      |
| **Chờ thanh toán**      | 🟡 Vàng       | `pending`   |
| **COD**                 | 🔵 Xanh dương | `cod`       |
| **Thanh toán thất bại** | 🔴 Đỏ         | `failed`    |
| **Đã hủy**              | ⚫ Xám        | `cancelled` |

---

## ⚠️ Lưu ý quan trọng

### 1. **Backend phải restart sau khi sửa code**

```powershell
cd backoffice
taskkill /F /IM node.exe
node server.js
```

### 2. **Refresh trang Backoffice sau khi backend restart**

- Nhấn `Ctrl + F5` để hard refresh
- Hoặc clear cache: `Ctrl + Shift + Delete`

### 3. **Kiểm tra console log**

Khi click "Hoàn tất", kiểm tra terminal backend sẽ thấy:

```
✅ Order ORD-xxx: Auto-marked as paid (COD delivered)
```

### 4. **Đơn hàng cũ**

- Đơn hàng đã "delivered" trước khi cập nhật code → vẫn giữ `payment_status` cũ
- Chỉ áp dụng cho đơn hàng mới click "Hoàn tất" sau khi code được cập nhật

---

## 📊 Luồng hoàn chỉnh

### COD Flow:

```
1. Khách đặt hàng (COD)
   ├─ payment_status: "pending" / "cod"
   └─ stock: KHÔNG trừ (vì pending)

2. Admin xử lý đơn
   ├─ Xác nhận → Sẵn sàng → Shipper nhận → Đang giao
   └─ payment_status: vẫn "pending"

3. Admin click "Hoàn tất" (delivered)
   ├─ delivery_status: "delivered" ✅
   ├─ payment_status: "paid" ✅ (TỰ ĐỘNG)
   └─ paid_at: timestamp ✅

4. Hiển thị
   └─ Cột "Thanh toán": "Đã thanh toán" (xanh lá) 🎉
```

### VNPay Flow:

```
1. Khách đặt hàng (VNPay)
   ├─ payment_status: "pending"
   └─ stock: KHÔNG trừ

2. Khách thanh toán VNPay

   2A. THÀNH CÔNG ✅
       ├─ payment_status: "paid" (vnpay-return.html)
       ├─ stock: TRỪ (markAsPaid)
       └─ Admin giao hàng bình thường

   2B. THẤT BẠI ❌
       ├─ payment_status: "failed"
       ├─ status: "cancelled"
       └─ stock: KHÔNG trừ
```

---

## ✅ Kết luận

**Yêu cầu đã hoàn thành:**

- ✅ Admin click "Hoàn tất" → COD tự động chuyển "Đã thanh toán"
- ✅ VNPay thành công → Hiển thị "Đã thanh toán"
- ✅ VNPay thất bại → Hiển thị "Thanh toán thất bại"
- ✅ Màu sắc badge rõ ràng, dễ phân biệt
- ✅ Stock chỉ trừ khi thanh toán thành công

**Backend đã restart với code mới!** 🚀

Bây giờ bạn có thể test lại bằng cách:

1. Refresh trang Backoffice (Ctrl + F5)
2. Tìm đơn hàng COD đang "Đang giao"
3. Click "Hoàn tất"
4. Xem cột "Thanh toán" đổi sang "Đã thanh toán" màu xanh 🎉

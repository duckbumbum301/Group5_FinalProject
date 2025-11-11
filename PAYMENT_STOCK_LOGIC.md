    # Logic Thanh Toán & Trừ Stock - Đã Sửa ✅

## 🎯 Logic Mới (Đúng)

### 📦 **COD - Thanh toán khi nhận hàng**

1. **Khách đặt hàng COD**

   - Frontend gửi: `paymentMethod: "COD"`, `payment_status: "cod"`
   - Backend middleware: **TRỪ STOCK NGAY** ✅
   - Lý do: Đơn COD có độ tin cậy cao, trừ ngay để tránh oversell

2. **Admin xác nhận giao hàng thành công**

   - Admin click "Hoàn tất" → `delivery_status = "delivered"`
   - Backend server: Tự động set `payment_status = "paid"` ✅
   - Backoffice hiển thị: **"✅ Đã thanh toán"**

3. **Admin hủy đơn COD**
   - Admin click "Hủy" → `delivery_status = "cancelled"`
   - Backend: `payment_status = "cancelled"`
   - Middleware stockRestoreMiddleware: **HOÀN TRẢ STOCK** ✅

---

### 💳 **VNPay - Thanh toán online**

1. **Khách đặt hàng VNPay**

   - Frontend gửi: `paymentMethod: "VNPAY"`, `payment_status: "pending"`
   - Backend middleware: Kiểm tra `isVNPay && isPendingPayment` → **KHÔNG TRỪ STOCK** ⏳
   - Lý do: Chờ xác nhận thanh toán từ VNPay

2. **Khách thanh toán thành công trên VNPay**

   - VNPay callback → vnpay-return.html
   - Frontend gọi: `apiMarkOrderPaid(orderId)`
   - Backend `/api/orders/:id/paid`:
     - Set `payment_status = "paid"`
     - Set `paid_at = timestamp`
     - **TRỪ STOCK** ✅
   - Backoffice hiển thị: **"✅ Đã thanh toán"**

3. **Khách hủy thanh toán hoặc thanh toán thất bại**
   - VNPay return với `responseCode != "00"`
   - Frontend gọi: `apiMarkOrderPaymentFailed(orderId, reason)`
   - Backend `/api/orders/:id/payment-failed`:
     - Set `payment_status = "failed"`
     - Set `delivery_status = "cancelled"`
     - Set `status = "cancelled"`
     - **KHÔNG TRỪ STOCK** ❌ (Vì chưa bao giờ trừ)
   - Backoffice hiển thị: **"❌ Chưa thanh toán - Đơn hàng đã bị hủy"**

---

## 🔧 Files Đã Sửa

### 1. `backoffice/server-middleware.js`

```javascript
// Line 20-45: stockDeductionMiddleware
const isVNPay = order.paymentMethod === "VNPAY";
const isPendingPayment = order.payment_status === "pending";

if (isVNPay && isPendingPayment) {
  console.log(
    "⏳ VNPay pending - Stock will be deducted ONLY after payment success"
  );
  return next(); // KHÔNG trừ stock
}

// COD hoặc paid → TRỪ STOCK NGAY
```

### 2. `backoffice/server-simple.js`

```javascript
// Line 78-110: API VNPay Success - TRỪ STOCK
server.patch("/api/orders/:id/paid", (req, res) => {
  order.payment_status = "paid";
  // TRỪ STOCK ở đây
});

// Line 112-143: API VNPay Failed - KHÔNG TRỪ STOCK
server.patch("/api/orders/:id/payment-failed", (req, res) => {
  order.payment_status = "failed";
  order.delivery_status = "cancelled";
  // KHÔNG trừ stock
});

// Line 145-166: API COD Delivered
server.patch("/orders/:id", (req, res, next) => {
  if (order.paymentMethod === "COD" && delivery_status === "delivered") {
    req.body.payment_status = "paid"; // ✅ Sửa từ "completed" → "delivered"
  }
});
```

### 3. `js/api.js`

```javascript
// Line 429-456: Sửa endpoint từ /orders/:id/paid → /api/orders/:id/paid
export async function apiMarkOrderPaid(orderId) {
  const response = await fetch(`${API_BASE}/api/orders/${orderId}/paid`, {
    method: "PATCH",
  });
}

// Line 457-492: Sửa endpoint
export async function apiMarkOrderPaymentFailed(orderId, reason) {
  const response = await fetch(
    `${API_BASE}/api/orders/${orderId}/payment-failed`,
    {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }
  );
}
```

### 4. `backoffice/app.js`

```javascript
// Line 1088-1118: Cập nhật payment labels với icon
const paymentLabels = {
  pending: "⏳ Chờ thanh toán",
  paid: "✅ Đã thanh toán",
  cod: "💵 COD",
  failed: "❌ Chưa thanh toán - Đơn hàng đã bị hủy",
  cancelled: "🚫 Đã hủy",
  banking: "🏦 Chuyển khoản",
};
```

### 5. `backoffice/styles.css`

```css
/* Line 1022-1058: Cập nhật màu sắc badges */
.tag.payment-paid {
  background: #d1fae5;
  color: #065f46;
}
.tag.payment-pending {
  background: #fef3c7;
  color: #92400e;
}
.tag.payment-failed {
  background: #fee2e2;
  color: #991b1b;
}
.tag.payment-cancelled {
  background: #f3f4f6;
  color: #4b5563;
}
```

---

## ✅ Kết Quả

| Trường hợp                    | Khi nào trừ stock?    | Payment Status |
| ----------------------------- | --------------------- | -------------- |
| **COD - Đặt hàng**            | ✅ Ngay khi tạo order | `"cod"`        |
| **COD - Giao hàng**           | (Đã trừ)              | `"paid"` ✅    |
| **COD - Hủy**                 | ❌ Hoàn trả stock     | `"cancelled"`  |
| **VNPay - Đặt hàng**          | ❌ Chưa trừ           | `"pending"` ⏳ |
| **VNPay - Thanh toán OK**     | ✅ Lúc này mới trừ    | `"paid"` ✅    |
| **VNPay - Thanh toán Failed** | ❌ Không trừ          | `"failed"` ❌  |

---

## 🧪 Test Cases

### Test 1: COD

1. Đặt hàng sản phẩm A (stock: 10) với COD
2. ✅ Check DB → stock = 9
3. Admin đánh dấu "Hoàn tất"
4. ✅ Backoffice hiển thị: "✅ Đã thanh toán"

### Test 2: VNPay Success

1. Đặt hàng sản phẩm B (stock: 5) với VNPay
2. ✅ Check DB → stock = 5 (chưa trừ)
3. Thanh toán thành công trên VNPay
4. ✅ Check DB → stock = 4 (trừ lúc này)
5. ✅ Backoffice hiển thị: "✅ Đã thanh toán"

### Test 3: VNPay Failed

1. Đặt hàng sản phẩm C (stock: 8) với VNPay
2. ✅ Check DB → stock = 8 (chưa trừ)
3. Hủy thanh toán trên VNPay
4. ✅ Check DB → stock = 8 (không trừ)
5. ✅ Backoffice hiển thị: "❌ Chưa thanh toán - Đơn hàng đã bị hủy"

---

## 📝 Notes

- **Middleware chỉ trừ stock 1 lần duy nhất**
- **VNPay pending không bao giờ trừ stock tại middleware**
- **VNPay success trừ stock tại API endpoint `/api/orders/:id/paid`**
- **COD trừ stock ngay khi tạo order (tin cậy cao)**

/*
 * ============================================================================
 *  VNPAY INTEGRATION - ARCHITECTURE OVERVIEW
 *  Dự án: Vựa Vui Vẻ
 * ============================================================================
 */

/*
 * PAYMENT FLOW DIAGRAM
 * ====================
 *
 *   ┌─────────────┐
 *   │   Browser   │
 *   │ (localhost: │
 *   │    8000)    │
 *   └──────┬──────┘
 *          │
 *          │ 1. User chọn VNPay
 *          │
 *          ▼
 *   ┌─────────────────────────────────────┐
 *   │  Frontend (js/checkout.js)          │
 *   │  - Tạo order (status: pending)      │
 *   │  - Call createVNPayPaymentUrl()     │
 *   └──────┬──────────────────────────────┘
 *          │
 *          │ 2. POST create_payment_url
 *          │
 *          ▼
 *   ┌─────────────────────────────────────┐
 *   │  VNPay Backend (localhost:8888)     │
 *   │  - Generate payment URL             │
 *   │  - Sign with secret key             │
 *   └──────┬──────────────────────────────┘
 *          │
 *          │ 3. Redirect URL
 *          │
 *          ▼
 *   ┌─────────────────────────────────────┐
 *   │  VNPay Payment Gateway              │
 *   │  (sandbox.vnpayment.vn)             │
 *   │  - User nhập thông tin thẻ         │
 *   │  - Xác thực OTP                     │
 *   └──────┬──────────────────────────────┘
 *          │
 *          │ 4. Payment result
 *          │
 *          ▼
 *   ┌─────────────────────────────────────┐
 *   │  Return Page (vnpay-return.html)    │
 *   │  - Parse response code              │
 *   │  - Update order status              │
 *   │  - Show success/error               │
 *   └──────┬──────────────────────────────┘
 *          │
 *          │ 5. Redirect home
 *          │
 *          ▼
 *   ┌─────────────────────────────────────┐
 *   │  Homepage (index.html)              │
 *   │  - Show order confirmation          │
 *   └─────────────────────────────────────┘
 */

/*
 * MODULE STRUCTURE
 * ================
 *
 * Frontend Modules:
 * ─────────────────
 * ├── js/checkout.js
 * │   ├── import vnpay-api.js
 * │   ├── openCheckoutModal()
 * │   └── Handle payment method selection
 * │
 * ├── js/vnpay-api.js
 * │   ├── createVNPayPaymentUrl()
 * │   ├── submitVNPayForm()
 * │   ├── parseVNPayReturn()
 * │   └── Error handling
 * │
 * └── html/vnpay-return.html
 *     ├── Parse URL parameters
 *     ├── Update order via API
 *     └── Show result UI
 *
 * Backend Modules:
 * ────────────────
 * ├── vnpay_nodejs/app.js
 * │   └── CORS middleware
 * │
 * ├── vnpay_nodejs/routes/order.js
 * │   ├── POST /create_payment_url
 * │   ├── GET /vnpay_return
 * │   └── GET /vnpay_ipn
 * │
 * └── vnpay_nodejs/config/default.json
 *     ├── vnp_TmnCode
 *     ├── vnp_HashSecret
 *     └── vnp_ReturnUrl
 */

/*
 * API ENDPOINTS
 * =============
 *
 * VNPay Backend (localhost:8888):
 * --------------------------------
 * POST   /order/create_payment_url    - Tạo URL thanh toán
 * GET    /order/vnpay_return          - Callback từ VNPay (legacy)
 * GET    /order/vnpay_ipn             - Webhook xác nhận (optional)
 *
 * Main Backend (localhost:3000):
 * ------------------------------
 * POST   /api/orders                  - Tạo đơn hàng
 * PATCH  /api/orders/:id/paid         - Đánh dấu đã thanh toán
 * GET    /api/orders/:id              - Lấy thông tin đơn hàng
 */

/*
 * DATA FLOW
 * =========
 *
 * 1. CREATE ORDER
 *    Frontend → Main Backend
 *    POST /api/orders
 *    {
 *      paymentMethod: "VNPAY",
 *      payment_status: "pending",
 *      total: 100000,
 *      ...
 *    }
 *    Response: { id: "ORD123", ... }
 *
 * 2. CREATE PAYMENT URL
 *    Frontend → VNPay Backend
 *    POST /order/create_payment_url
 *    {
 *      amount: 100000,
 *      orderId: "ORD123",
 *      orderDescription: "..."
 *    }
 *    Response: Redirect to VNPay
 *
 * 3. PAYMENT CALLBACK
 *    VNPay → Frontend
 *    GET /html/vnpay-return.html?
 *        vnp_ResponseCode=00&
 *        vnp_TxnRef=ORD123&
 *        vnp_Amount=10000000&
 *        vnp_TransactionNo=12345678&
 *        vnp_SecureHash=...
 *
 * 4. UPDATE ORDER
 *    Frontend → Main Backend
 *    PATCH /api/orders/ORD123/paid
 *    Response: { payment_status: "paid" }
 */

/*
 * SECURITY CONSIDERATIONS
 * =======================
 *
 * ✅ SECRET KEY chỉ ở backend
 *    - vnp_HashSecret KHÔNG bao giờ expose ra frontend
 *    - Frontend chỉ gọi API, không tự generate URL
 *
 * ✅ VALIDATE signature
 *    - VNPay backend tự động validate vnp_SecureHash
 *    - Không tin tưởng response code nếu hash sai
 *
 * ✅ PREVENT replay attacks
 *    - Check timestamp (vnp_CreateDate)
 *    - Lưu transaction ID để tránh duplicate
 *
 * ✅ CORS properly configured
 *    - Only allow localhost:8000 (dev)
 *    - Change to production domain in prod
 *
 * ⚠️  HTTPS required in production
 *    - VNPay không chấp nhận HTTP callback
 *    - SSL certificate bắt buộc
 */

/*
 * TESTING CHECKLIST
 * =================
 *
 * □ VNPay backend running (port 8888)
 * □ Main backend running (port 3000)
 * □ Frontend running (port 8000)
 * □ CORS enabled in VNPay backend
 * □ Test card works (9704198526191432198)
 * □ Success flow: code 00
 * □ Cancel flow: code 24
 * □ Error handling: timeout, network error
 * □ Order status updated correctly
 * □ Cart cleared after payment
 * □ Return page displays correctly
 */

/*
 * PRODUCTION DEPLOYMENT
 * =====================
 *
 * 1. Update config/production.json:
 *    {
 *      "vnp_Url": "https://pay.vnpay.vn/...",
 *      "vnp_ReturnUrl": "https://yourdomain.com/vnpay-return"
 *    }
 *
 * 2. Update CORS origins:
 *    app.use(cors({
 *      origin: ['https://yourdomain.com'],
 *      ...
 *    }));
 *
 * 3. Use real credentials (from VNPay merchant portal)
 *
 * 4. Enable HTTPS/SSL
 *
 * 5. Setup webhook/IPN for reliable payment confirmation
 *
 * 6. Monitor logs and errors
 *
 * 7. Test thoroughly on staging before going live
 */

// EOF

// js/vnpay-api.js - VNPay Integration Module
// Xử lý tất cả logic giao tiếp với VNPay backend

const VNPAY_BACKEND_URL = "http://localhost:8888";

/**
 * Tạo URL thanh toán VNPay
 * @param {Object} params - Thông tin thanh toán
 * @param {number} params.amount - Số tiền (VND)
 * @param {string} params.orderId - Mã đơn hàng
 * @param {string} params.orderInfo - Thông tin đơn hàng
 * @param {string} [params.bankCode] - Mã ngân hàng (để trống = cổng VNPAYQR)
 * @returns {Promise<{ok: boolean, paymentUrl?: string, error?: string}>}
 */
export async function createVNPayPaymentUrl({
  amount,
  orderId,
  orderInfo,
  bankCode = "",
}) {
  try {
    // Validate input
    if (!amount || amount <= 0) {
      return { ok: false, error: "Số tiền không hợp lệ" };
    }
    if (!orderId) {
      return { ok: false, error: "Thiếu mã đơn hàng" };
    }

    const formData = new URLSearchParams({
      amount: Math.round(amount).toString(),
      bankCode: bankCode,
      language: "vn",
      orderDescription: orderInfo || `Thanh toán đơn hàng ${orderId}`,
      orderType: "other",
      orderId: orderId.toString(), // ✅ Gửi orderId từ frontend
    });

    console.log("🔄 Calling VNPay API...", {
      url: `${VNPAY_BACKEND_URL}/order/create_payment_url`,
      amount,
      orderId,
    });

    const response = await fetch(
      `${VNPAY_BACKEND_URL}/order/create_payment_url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    console.log("📥 VNPay API Response:", response.status, response.ok);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Backend giờ trả về JSON với payment URL
    const data = await response.json();
    console.log("📦 VNPay Data:", data);

    if (data.code === "00" && data.data) {
      return { ok: true, paymentUrl: data.data };
    }

    return { ok: false, error: data.message || "Không thể tạo URL thanh toán" };
  } catch (error) {
    console.error("❌ VNPay API Error:", error);
    return { ok: false, error: error.message || "Lỗi kết nối VNPay" };
  }
}

/**
 * Tạo form ẩn và submit để redirect sang VNPay
 * (Workaround cho CORS issue)
 */
export function submitVNPayForm(formData) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${VNPAY_BACKEND_URL}/order/create_payment_url`;
  form.style.display = "none";

  for (const [key, value] of Object.entries(formData)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

/**
 * Parse VNPay return parameters từ URL
 * @param {string} [url] - URL để parse (mặc định: window.location.href)
 * @returns {Object} VNPay response parameters
 */
export function parseVNPayReturn(url = window.location.href) {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);

  return {
    responseCode: params.get("vnp_ResponseCode"),
    txnRef: params.get("vnp_TxnRef"), // Order ID
    amount: params.get("vnp_Amount"),
    bankCode: params.get("vnp_BankCode"),
    transactionNo: params.get("vnp_TransactionNo"),
    transactionStatus: params.get("vnp_TransactionStatus"),
    secureHash: params.get("vnp_SecureHash"),
    // Response code meanings
    isSuccess: params.get("vnp_ResponseCode") === "00",
    message: getVNPayMessage(params.get("vnp_ResponseCode")),
  };
}

/**
 * Lấy message từ response code
 */
function getVNPayMessage(code) {
  const messages = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
    10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
    12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
    13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
    24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
    65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
    75: "Ngân hàng thanh toán đang bảo trì.",
    79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
    99: "Các lỗi khác",
  };
  return messages[code] || "Lỗi không xác định";
}

/**
 * Check if we're on VNPay return page
 */
export function isVNPayReturnUrl(url = window.location.href) {
  return url.includes("vnp_ResponseCode") && url.includes("vnp_TxnRef");
}

export default {
  createVNPayPaymentUrl,
  submitVNPayForm,
  parseVNPayReturn,
  isVNPayReturnUrl,
  getVNPayMessage,
};

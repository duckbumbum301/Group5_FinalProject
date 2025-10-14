// js/api.js — Mock "REST API" chạy trong trình duyệt bằng localStorage
import { PRODUCTS } from './data.js';

const LS_ORDERS = 'vvv_orders';

function lsGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// ========= PRODUCTS =========
export async function apiListProducts() {
  // mock: coi như gọi server
  return PRODUCTS;
}
export async function apiGetProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

// ========= VOUCHERS (mock) =========
// DEMO: "FREESHIP" => ship = 0;  "GIAM10" => -10% subtotal
export async function apiApplyVoucher(code, { subtotal, shippingFee }) {
  const c = (code || '').trim().toUpperCase();
  if (!c) return { ok: false, message: 'Bạn chưa nhập mã.' };

  if (c === 'FREESHIP') {
    return { ok: true, type: 'ship', value: shippingFee, message: 'Đã áp dụng freeship.' };
  }
  if (c === 'GIAM10') {
    return { ok: true, type: 'percent', value: 10, message: 'Giảm 10% đơn hàng.' };
  }
  return { ok: false, message: 'Mã không hợp lệ.' };
}

// ========= DELIVERY SLOTS (mock) =========
export async function apiListDeliverySlots() {
  // 3 khung giờ mỗi ngày, 2 ngày tới
  const slots = [];
  const today = new Date();
  for (let d = 0; d < 2; d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d);
    ['09:00-11:00', '13:00-15:00', '18:00-20:00'].forEach(win => {
      slots.push({
        id: `${date.toISOString().slice(0,10)}_${win}`,
        date: date.toISOString().slice(0,10),
        window: win,
        capacity: 50,
        used: 0,
      });
    });
  }
  return slots;
}

// ========= SHIPPING (mock) =========
export function calcShippingFee(addressText, subtotal) {
  // Quy tắc demo:
  // - Nội thành (chứa "Q." hoặc "Quận" hoặc "TP.") => 15k
  // - Ngoại thành (chứa "H." hoặc "Huyện") => 25k
  // - Đơn >= 300k: freeship (0đ)
  const txt = (addressText || '').toLowerCase();
  if (!txt) return 20000;
  let fee = /q\.\s*\d+|quận|tp\./.test(txt) ? 15000 : (/h\.\s*|huyện/.test(txt) ? 25000 : 20000);
  if (subtotal >= 300000) fee = 0;
  return fee;
}

// ========= ORDERS =========
export async function apiCreateOrder(orderPayload) {
  const orders = lsGet(LS_ORDERS, []);
  const id = Date.now().toString();
  const newOrder = { id, ...orderPayload, created_at: new Date().toISOString() };
  orders.push(newOrder);
  lsSet(LS_ORDERS, orders);
  return newOrder;
}
export async function apiListOrders() {
  return lsGet(LS_ORDERS, []);
}

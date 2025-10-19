// js/api.js — Mock "REST API" chạy trong trình duyệt bằng localStorage
import { PRODUCTS } from './data.js';

const LS_ORDERS = 'vvv_orders';
const LS_USERS  = 'vvv_users';      // danh sách người dùng đã đăng ký
const LS_SESSION = 'vvv_session';   // phiên đăng nhập hiện tại

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

// ========= AUTH / USERS (mock) =========
// User shape: { id, name, email, password, address }
function getUsers(){ return lsGet(LS_USERS, []); }
function setUsers(list){ lsSet(LS_USERS, list); }

export async function apiRegisterUser({ name, email, password, address }){
  email = (email || '').trim().toLowerCase();
  const users = getUsers();
  if (!name || !email || !password) {
    return { ok:false, message:'Vui lòng nhập đủ họ tên, email, mật khẩu.' };
  }
  if (users.some(u => u.email === email)) {
    return { ok:false, message:'Email đã tồn tại.' };
  }
  const id = Date.now().toString();
  const user = { id, name: name.trim(), email, password: String(password), address: (address||'').trim() };
  users.push(user);
  setUsers(users);
  // tự động đăng nhập sau khi đăng ký
  lsSet(LS_SESSION, { id: user.id, email: user.email, name: user.name });
  return { ok:true, user: { id:user.id, name:user.name, email:user.email, address:user.address } };
}

export async function apiLoginUser({ email, password }){
  const users = getUsers();
  const e = (email||'').trim().toLowerCase();
  const p = String(password||'');
  const u = users.find(x => x.email === e && x.password === p);
  if (!u) return { ok:false, message:'Sai email hoặc mật khẩu.' };
  lsSet(LS_SESSION, { id: u.id, email: u.email, name: u.name });
  return { ok:true, user: { id:u.id, name:u.name, email:u.email, address:u.address } };
}

export async function apiLogoutUser(){
  localStorage.removeItem(LS_SESSION);
  return { ok:true };
}

export async function apiCurrentUser(){
  const s = lsGet(LS_SESSION, null);
  if (!s) return null;
  const users = getUsers();
  const u = users.find(x => x.id === s.id);
  return u ? { id:u.id, name:u.name, email:u.email, address:u.address } : null;
}

export async function apiUpdateProfile({ name, address }){
  const s = lsGet(LS_SESSION, null);
  if (!s) return { ok:false, message:'Chưa đăng nhập.' };
  const users = getUsers();
  const idx = users.findIndex(x => x.id === s.id);
  if (idx === -1) return { ok:false, message:'Không tìm thấy người dùng.' };
  users[idx] = { ...users[idx], name: (name||users[idx].name), address: (address||users[idx].address) };
  setUsers(users);
  lsSet(LS_SESSION, { id: users[idx].id, email: users[idx].email, name: users[idx].name });
  return { ok:true, user: { id:users[idx].id, name:users[idx].name, email:users[idx].email, address:users[idx].address } };
}

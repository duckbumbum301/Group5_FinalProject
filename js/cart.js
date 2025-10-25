// js/cart.js (Quản lý logic giỏ hàng)

const LS_CART = 'vvv_cart';
const LS_CART_USER_PREFIX = 'vvv_cart_user_';
let cart = {}; // { productId: qty }

// Tải giỏ hàng từ localStorage khi ứng dụng khởi động
export function loadCart() 
{
  try {
    cart = JSON.parse(localStorage.getItem(LS_CART) || '{}');
  } catch {
    cart = {};
  }
}

// Lưu giỏ hàng vào localStorage
function saveCart() 
{
  localStorage.setItem(LS_CART, JSON.stringify(cart));
}

// Thêm sản phẩm vào giỏ
export function addToCart(productId, quantity = 1) 
{
  cart[productId] = (cart[productId] || 0) + quantity;
  saveCart();
  document.dispatchEvent(new CustomEvent('cart:changed', { detail: { cart } }));
}

// Xóa sản phẩm khỏi giỏ
export function removeFromCart(productId) 
{
  if (cart[productId]) {
    delete cart[productId];
    saveCart();
    document.dispatchEvent(new CustomEvent('cart:changed', { detail: { cart } }));
  }
}

// Cập nhật số lượng
export function updateCartQuantity(productId, quantity) 
{
  if (cart[productId]) {
    let val = parseInt(quantity, 10);
    if (Number.isNaN(val) || val < 0) val = 0;
    
    if (val === 0) {
      // Xóa sản phẩm nếu số lượng = 0
      delete cart[productId];
    } else {
      cart[productId] = val;
    }
    
    saveCart();
    document.dispatchEvent(new CustomEvent('cart:changed', { detail: { cart } }));
  }
}

// Xóa toàn bộ giỏ hàng
export function clearCart() {
  cart = {};
  saveCart();
  document.dispatchEvent(new CustomEvent('cart:changed', { detail: { cart } }));
}

// Trả về dữ liệu giỏ hàng hiện tại
export function getCart() 
{
  return cart;
}

// Sao lưu giỏ hàng theo user (lưu vào localStorage riêng cho user)
export function backupCartForUser(userId) {
  if (!userId) return;
  try {
    const raw = localStorage.getItem(LS_CART) || '{}';
    localStorage.setItem(`${LS_CART_USER_PREFIX}${userId}`, raw);
  } catch {}
}

// Khôi phục giỏ hàng theo user (ghi đè vvv_cart và phát sự kiện cập nhật)
export function restoreCartForUser(userId) {
  if (!userId) return;
  try {
    const raw = localStorage.getItem(`${LS_CART_USER_PREFIX}${userId}`);
    if (!raw) return;
    localStorage.setItem(LS_CART, raw);
    try { cart = JSON.parse(raw || '{}'); } catch { cart = {}; }
    document.dispatchEvent(new CustomEvent('cart:changed', { detail: { cart } }));
  } catch {}
}

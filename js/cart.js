// js/cart.js (Quản lý logic giỏ hàng)
import { renderUI } from './ui.js';

const LS_CART = 'vvv_cart';
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
  renderUI(); // Yêu cầu UI cập nhật sau khi thay đổi dữ liệu
}

// Xóa sản phẩm khỏi giỏ
export function removeFromCart(productId) 
{
  if (cart[productId]) {
    delete cart[productId];
    saveCart();
    renderUI();
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
    renderUI();
  }
}

// Xóa toàn bộ giỏ hàng
export function clearCart() 
{
  cart = {};
  saveCart();
  renderUI();
}

// Trả về dữ liệu giỏ hàng hiện tại
export function getCart() 
{
  return cart;
}

// js/ui.js (Quản lý việc hiển thị, cập nhật giao diện)

import { $, money } from './utils.js';
import { PRODUCTS } from './data.js';
import { getCart } from './cart.js';

// DOM refs cho UI
const gridEl = $('#productGrid');
const cartBadge = $('#cartBadge');
const cartItemsEl = $('#cartItems');
const cartSubtotalEl = $('#cartSubtotal');
const cartDrawer = $('#cartDrawer');

// Hàm chính để render toàn bộ giao diện (trừ product grid)
export function renderUI() {
  renderCart();
}

// Render lưới sản phẩm
export function renderProducts(productsToRender, favoriteSet) {
  const catToThumb = (cat) => ({
    veg:'thumb--veg', 
    fruit:'thumb--fruit', 
    meat:'thumb--meat', 
    dry:'thumb--dry', 
    drink:'thumb--drink',
    spice:'thumb--spice',
    household:'thumb--household',
    sweet:'thumb--sweet',

    // --- Danh mục mới (map về class có sẵn) ---
    vegfruit:'thumb--veg',
    meatfish:'thumb--meat',
    cookingoil:'thumb--spice',
    noodle:'thumb--dry',
    milk:'thumb--drink',
    icecream:'thumb--sweet',
    frozen:'thumb--meat',
    snack:'thumb--sweet',
    personalcare:'thumb--household',
    cleaning:'thumb--household',
    baby:'thumb--household',
  }[cat] || 'thumb--veg');
  
  const cardHTML = p => {
    const catClass = catToThumb(p.cat);
    const favPressed = favoriteSet.has(p.id) ? 'true' : 'false';
    const thumbInner = p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:120px;object-fit:cover;border-radius:10px;" />`
      : `${p.emoji || '🛒'}`;
    return `
    <article class="card" data-id="${p.id}">
      <div class="thumb ${catClass}" aria-hidden="true">${thumbInner}</div>
      <div class="name">${p.name}</div>
      <div class="meta">
        <span class="price">${money(p.price)}</span>
        <div class="kit">
          <button class="btn fav" aria-pressed="${favPressed}" data-action="fav">❤️</button>
          <button class="btn btn--pri" data-action="add">Thêm</button>
        </div>
      </div>
    </article>`;
  };
  gridEl.innerHTML = productsToRender.map(cardHTML).join('') || `<p class="muted">Không tìm thấy sản phẩm phù hợp.</p>`;
}

// Render giỏ hàng
function renderCart() {
  const cart = getCart();
  const entries = Object.entries(cart).filter(([,q]) => q > 0);

  const lines = entries.map(([pid, qty]) => {
    const p = PRODUCTS.find(x => x.id === pid);
    return p ? `
      <div class="cart-item" data-id="${p.id}">
        <div>
          <strong>${p.name}</strong>
          <div class="muted">${money(p.price)} • ${p.unit}</div>
        </div>
        <div class="qty">
          <label for="qty-${p.id}" class="muted">SL:</label>
          <input id="qty-${p.id}" type="number" min="1" step="1" value="${qty}" data-action="qty">
        </div>
        <button class="btn btn--icon remove-btn" data-action="remove" data-product-id="${p.id}">Xóa</button>
      </div>
    ` : '';
  }).join('');
  cartItemsEl.innerHTML = lines || `<p class="muted">Giỏ hàng đang trống.</p>`;

  const subtotal = entries.reduce((s, [pid, q]) => {
    const p = PRODUCTS.find(x => x.id === pid);
    return s + (p ? p.price * q : 0);
  }, 0);
  cartSubtotalEl.textContent = money(subtotal);

  const count = entries.reduce((s, [, q]) => s + q, 0);
  cartBadge.textContent = count;
}

// Đóng/mở giỏ hàng
export function openCart() { 
  cartDrawer.removeAttribute('hidden'); 
}
export function closeCart() { 
  cartDrawer.setAttribute('hidden',''); 
}

// js/ui.js (Quản lý việc hiển thị, cập nhật giao diện)

import { $, money } from './utils.js';
import { getCart } from './cart.js';
import { apiGetProductById } from './api.js';

// DOM refs cho UI
const gridEl = $('#productGrid');
const cartBadge = $('#cartBadge');
const cartItemsEl = $('#cartItems');
const cartSubtotalEl = $('#cartSubtotal');
const cartDrawer = $('#cartDrawer');

// Hàm chính để render toàn bộ giao diện (trừ product grid)
export async function renderUI() {
  await renderCart();
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

  const cardHTML = (p) => {
    const catClass = catToThumb(p.cat);
    const favPressed = favoriteSet.has(p.id) ? 'true' : 'false';
    const isSale = Number.isFinite(p.salePercent) && p.salePercent > 0;
    const salePrice = isSale ? p.price * (1 - p.salePercent / 100) : p.price;
    const thumbInner = p.image
      ? `<img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" fetchpriority="low" width="300" height="120" style="width:100%;height:120px;object-fit:cover;border-radius:10px;" />`
      : `${p.emoji || '🛒'}`;
    const badgeHtml = isSale ? `<span class="badge-sale">-${Math.round(p.salePercent)}%</span>` : '';
    const priceHtml = isSale
      ? `<span class="price price--sale">${money(salePrice)}</span> <span class="price price--orig">${money(p.price)}</span>`
      : `<span class="price">${money(p.price)}</span>`;
    return `
    <article class="card" data-id="${p.id}">
      <div class="thumb ${catClass}" aria-hidden="true">${thumbInner}${badgeHtml}</div>
      <div class="name">${p.name}</div>
      <div class="meta">
        ${priceHtml}
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
async function renderCart() {
  const cart = getCart();
  const entries = Object.entries(cart).filter(([, q]) => q > 0);

  const ids = entries.map(([pid]) => pid);
  const products = await Promise.all(ids.map((id) => apiGetProductById(id)));
  const map = {};
  for (const p of products) {
    if (p && p.id) map[p.id] = p;
  }

  const lines = entries
    .map(([pid, qty]) => {
      const p = map[pid];
      return p
        ? `\n      <div class="cart-item" data-id="${p.id}">\n        <div>\n          <strong>${p.name}</strong>\n          <div class="muted">${money(p.price)} • ${p.unit}</div>\n        </div>\n        <div class="qty">\n          <label for="qty-${p.id}" class="muted">SL:</label>\n          <input id="qty-${p.id}" type="number" min="1" step="1" value="${qty}" data-action="qty">\n        </div>\n        <button class="btn btn--icon remove-btn" data-action="remove" data-product-id="${p.id}">Xóa</button>\n      </div>\n    `
        : '';
    })
    .join('');
  cartItemsEl.innerHTML = lines || `<p class="muted">Giỏ hàng đang trống.</p>`;

  const subtotal = entries.reduce((s, [pid, q]) => {
    const p = map[pid];
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

// Render products into a specific grid element (Flash Sale section)
export function renderProductsInto(targetEl, productsToRender, favoriteSet) {
  // Dùng cùng phong cách thẻ như renderProducts để thống nhất UI
  const catToClass = (cat) => ({
    veg:'thumb--veg', fruit:'thumb--fruit', meat:'thumb--meat', dry:'thumb--dry', drink:'thumb--drink',
    spice:'thumb--spice', household:'thumb--household', sweet:'thumb--sweet',
  }[cat] || 'thumb--veg');

  const cards = productsToRender.map((p) => {
    const isFav = favoriteSet?.has?.(p.id);
    const isSale = Number.isFinite(p.salePercent) && p.salePercent > 0;
    const salePrice = isSale ? Math.round(p.price * (100 - p.salePercent) / 100) : p.price;
    const badgeHtml = isSale ? `<span class="badge-sale">-${Math.round(p.salePercent)}%</span>` : '';
    const priceHtml = isSale
      ? `<span class="price price--sale">${money(salePrice)}</span> <span class="price price--orig">${money(p.price)}</span>`
      : `<span class="price">${money(p.price)}</span>`;
    const catClass = catToClass(p.cat);
    const thumbInner = p.image
      ? `<img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" fetchpriority="low" width="300" height="120" style="width:100%;height:120px;object-fit:cover;border-radius:10px;" />`
      : `${p.emoji || '🛒'}`;

    return `
      <article class="card" data-id="${p.id}">
        <div class="thumb ${catClass}" aria-hidden="true">${thumbInner}${badgeHtml}</div>
        <div class="name">${p.name}</div>
        <div class="meta">
          ${priceHtml}
          <div class="kit">
            <button class="btn fav" aria-pressed="${isFav ? 'true' : 'false'}" data-action="fav">❤️</button>
            <button class="btn btn--pri" data-action="add">Thêm</button>
          </div>
        </div>
      </article>`;
  }).join('');

  targetEl.innerHTML = cards || '<p class="muted">Không có sản phẩm trong khung giờ này.</p>';
}

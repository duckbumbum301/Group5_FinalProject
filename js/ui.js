// js/ui.js (Quản lý việc hiển thị, cập nhật giao diện)

import { $, money, moneyCompact } from './utils.js';
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
      ? `<img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" fetchpriority="low" style="width:100%;height:100%;object-fit:contain;border-radius:12px;" onerror="this.onerror=null; this.src='../images/brand/LogoVVV.png';" />`
      : `${p.emoji || '🛒'}`;
    const badgeHtml = isSale ? `<span class="badge-sale">-${Math.round(p.salePercent)}%</span>` : '';
    const priceHtml = isSale
      ? `<span class="price price--sale">${money(salePrice)}</span> <span class="price price--orig">${money(p.price)}</span>`
      : `<span class="price">${money(p.price)}</span>`;

    // Rating: lấy từ localStorage nếu có, ngược lại random 1–5 và lưu lại
    let ratingMap = {};
    try { ratingMap = JSON.parse(localStorage.getItem('vvv_rating') || '{}'); } catch {}
    if (!ratingMap[p.id]) {
      ratingMap[p.id] = Math.max(1, Math.min(5, Math.floor(Math.random() * 5) + 1));
      try { localStorage.setItem('vvv_rating', JSON.stringify(ratingMap)); } catch {}
    }
    const stars = Array.from({ length: 5 }, (_, i) => i < (ratingMap[p.id] || 1) ? '★' : '☆').join('');
    return `
    <article class="card" data-id="${p.id}">
      <div class="thumb ${catClass}" aria-hidden="true">${thumbInner}${badgeHtml}</div>
      <div class="rating" aria-label="Đánh giá">${stars}</div>
      <div class="name">${p.name}</div>
      <div class="meta">
        <div class="pricegroup">${priceHtml}</div>
        <button class="btn btn--fav fav" aria-pressed="${favPressed}" data-action="fav" aria-label="Yêu thích"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5c0-2.62 2.13-4.75 4.75-4.75 1.77 0 3.39.91 4.25 2.31.86-1.4 2.48-2.31 4.25-2.31 2.62 0 4.75 2.13 4.75 4.75 0 3.78-3.4 6.86-8.55 11.54z"/></svg></button>
      </div>
      <div class="card__foot">
        <button class="btn btn--cart" data-action="add" aria-label="Thêm vào giỏ">Thêm vào giỏ</button>
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

  const { getFlashEffectivePrice } = await import('./utils.js');

  // Lấy map lựa chọn đã lưu để render trạng thái checkbox
  let selMap = {};
  try { selMap = JSON.parse(localStorage.getItem('vvv_cart_sel') || '{}'); } catch {}

  const lines = entries
    .map(([pid, qty]) => {
      const p = map[pid];
      if (!p) return '';
      const eff = getFlashEffectivePrice ? getFlashEffectivePrice(p) : p.price;
      const isDiscount = eff !== p.price;
      const priceHtml = isDiscount
        ? `<span class="price price--sale">${money(eff)}</span> <span class="price price--orig">${money(p.price)}</span>`
        : `${money(p.price)}`;
      const isSel = Object.prototype.hasOwnProperty.call(selMap, p.id) ? !!selMap[p.id] : true;
      return `
      <div class="cart-item" data-id="${p.id}">
        <div>
          <strong>${p.name}</strong>
          <div class="muted">${priceHtml} • ${p.unit}</div>
        </div>
        <div class="qty">
          <input type="checkbox" data-action="sel" ${isSel ? 'checked' : ''} aria-label="Chọn mua" />
          <label for="qty-${p.id}" class="muted">SL:</label>
          <input id="qty-${p.id}" type="number" min="1" step="1" inputmode="numeric" pattern="[0-9]*" value="${qty}" data-action="qty" />
          <button class="btn btn--outline" data-action="remove">Xóa</button>
        </div>
      </div>`;
    })
    .join('');
  cartItemsEl.innerHTML = lines || `<p class="muted">Giỏ hàng đang trống.</p>`;

  const selectedEntries = entries.filter(([pid]) => {
    return Object.prototype.hasOwnProperty.call(selMap, pid) ? !!selMap[pid] : true;
  });
  const subtotal = selectedEntries.reduce((s, [pid, q]) => {
    const p = map[pid];
    const eff = p ? (getFlashEffectivePrice ? getFlashEffectivePrice(p) : p.price) : 0;
    return s + eff * q;
  }, 0);
  cartSubtotalEl.textContent = moneyCompact(subtotal);

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
      ? `<img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" fetchpriority="low" style="width:100%;height:100%;object-fit:contain;border-radius:12px;" onerror="this.onerror=null; this.src='../images/brand/LogoVVV.png';" />`
      : `${p.emoji || '🛒'}`;

    // Rating ổn định theo product id
    let ratingMap = {};
    try { ratingMap = JSON.parse(localStorage.getItem('vvv_rating') || '{}'); } catch {}
    if (!ratingMap[p.id]) {
      ratingMap[p.id] = Math.max(1, Math.min(5, Math.floor(Math.random() * 5) + 1));
      try { localStorage.setItem('vvv_rating', JSON.stringify(ratingMap)); } catch {}
    }
    const stars = Array.from({ length: 5 }, (_, i) => i < (ratingMap[p.id] || 1) ? '★' : '☆').join('');

    return `
      <article class="card" data-id="${p.id}">
        <div class="thumb ${catClass}" aria-hidden="true">${thumbInner}${badgeHtml}</div>
        <div class="rating" aria-label="Đánh giá">${stars}</div>
        <div class="name">${p.name}</div>
        <div class="meta">
          <div class="pricegroup">${priceHtml}</div>
          <button class="btn btn--fav fav" aria-pressed="${isFav ? 'true' : 'false'}" data-action="fav" aria-label="Yêu thích"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5c0-2.62 2.13-4.75 4.75-4.75 1.77 0 3.39.91 4.25 2.31.86-1.4 2.48-2.31 4.25-2.31 2.62 0 4.75 2.13 4.75 4.75 0 3.78-3.4 6.86-8.55 11.54z"/></svg></button>
        </div>
        <div class="card__foot">
          <button class="btn btn--cart" data-action="add" aria-label="Thêm vào giỏ">Thêm vào giỏ</button>
        </div>
      </article>`;
  }).join('');

  targetEl.innerHTML = cards || '<p class="muted">Không có sản phẩm trong khung giờ này.</p>';
}

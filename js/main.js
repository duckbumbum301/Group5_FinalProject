// js/main.js — Entry: filter nâng cao + Product Modal + Checkout (mock) + Orders modal

import { $, money, debounce, normalizeVN, ensureDatalist } from './utils.js';
import { PRODUCTS, RECIPES } from './data.js';
import { loadCart, addToCart, removeFromCart, updateCartQuantity, getCart, clearCart } from './cart.js';
import { renderUI, renderProducts, openCart, closeCart } from './ui.js';
import { apiListProducts, apiGetProductById, apiApplyVoucher, apiListDeliverySlots, calcShippingFee, apiCreateOrder, apiListOrders } from './api.js';

// Toast helper
function ensureToastContainer() {
  let c = document.getElementById('toastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toastContainer';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}
function showToast(message, duration = 2500) {
  const container = ensureToastContainer();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-message">${message}</span><button class="toast-close" aria-label="Close">×</button>`;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  const remove = () => { t.classList.remove('show'); t.addEventListener('transitionend', () => t.remove(), { once: true }); };
  const timer = setTimeout(remove, duration);
  t.querySelector('.toast-close').addEventListener('click', () => { clearTimeout(timer); remove(); });
}

// ---------- State ----------
const LS_USER = 'vvv_user';
const LS_ORDERS = 'vvv_orders';
const LS_FAV  = 'vvv_fav';

let user = {};    // { name, email, address }
let orders = [];  // []
let favs = new Set(); // Set<productId>

let filters = {
  q: '',
  qNorm: '',
  cat: 'all',
  sort: 'pop',
  priceMax: 250000,
  favOnly: false,
  nameOnly: false,
  nameTerm: '',
  nameTokens: [],
};

// infinite scroll state
let pageSize = 16;
let currentPage = 1;
let currentRendered = []; // items đang hiển thị sau filter
let sentinel; // element để observe load-more

// ---------- DOM refs ----------
const yearEl = $('#year');
const gridEl = $('#productGrid');
const priceRange = $('#priceRange');
const priceValue = $('#priceValue');
const searchToggle = $('#searchToggle');
const searchbar = $('#searchbar');
const searchInput = $('#searchInput');
const sortSelect = $('#sortSelect');
const catFilter = $('#categoryFilter');
const favOnly = $('#favOnly');
const cartOpenBtn = $('#cartOpenBtn');
const cartOverlay = $('#cartOverlay');
const cartCloseBtn = $('#cartCloseBtn');
const cartItems = $('#cartItems');
const recipeInput = $('#recipeInput');
const recipeList = $('#recipeList');
const recipeAddAllBtn = $('#recipeAddAllBtn');
const contactForm = $('#contactForm');
const contactMsg = $('#contactMsg');
const accountBtn = $('#accountBtn');
const accountModal = $('#accountModal');
const accountOverlay = $('#accountOverlay');
const accountCloseBtn = $('#accountCloseBtn');
const accountForm = $('#accountForm');
const accountMsg = $('#accountMsg');
const checkoutBtn = $('#checkoutBtn');

// NEW: Orders
const ordersBtn = $('#ordersBtn');

// Mega Menu refs
const productsMenuToggle = $('#productsMenuToggle');
const productsMegaMenu = $('#productsMegaMenu');
const navItem = document.querySelector('.nav-item--dropdown');

// ---------- Helpers ----------
function buildSearchIndex(items) {
  return items.map(p => ({ ...p, _norm: normalizeVN(p.name) }));
}
let productIndex = buildSearchIndex(PRODUCTS);

// ---------- Filtering + Render ----------
function applyFilters() {
  let items = productIndex.filter(p => p.stock && p.price <= filters.priceMax);

  if ((filters.nameOnly && filters.nameTerm) || (filters.nameTokens && filters.nameTokens.length)) {
    const tokens = (filters.nameTokens || []).map(s => normalizeVN(s));
    const hasTerm = (txtNorm) => tokens.length
      ? tokens.some(tk => txtNorm.includes(tk))
      : (filters.nameTerm ? txtNorm.includes(normalizeVN(filters.nameTerm)) : true);
    items = items.filter(p => hasTerm(p._norm));
  } else {
    if (filters.cat !== 'all') items = items.filter(p => p.cat === filters.cat);
    if (filters.qNorm) items = items.filter(p => p._norm.includes(filters.qNorm));
    if (filters.favOnly) items = items.filter(p => favs.has(p.id));
  }

  if (filters.sort === 'priceAsc') items.sort((a,b) => a.price - b.price);
  else if (filters.sort === 'priceDesc') items.sort((a,b) => b.price - a.price);
  else items.sort((a,b) => b.pop - a.pop);

  return items;
}
function renderWithPagination() {
  currentRendered = applyFilters();
  currentPage = 1;
  renderProducts(currentRendered.slice(0, pageSize), favs);
  attachCardClicks();
  setupInfiniteScroll();
}
function loadMore() {
  const next = currentRendered.slice(0, ++currentPage * pageSize);
  renderProducts(next, favs);
  attachCardClicks();
}

// ---------- Favorites ----------
function toggleFav(pid, btn) {
  if (favs.has(pid)) favs.delete(pid); else favs.add(pid);
  if (btn) btn.setAttribute('aria-pressed', favs.has(pid) ? 'true' : 'false');
  localStorage.setItem(LS_FAV, JSON.stringify([...favs]));
}

// ---------- Product Detail Modal ----------
function ensureProductModal() {
  let el = document.getElementById('productModal');
  if (!el) {
    el = document.createElement('section');
    el.id = 'productModal';
    el.className = 'modal';
    el.hidden = true;
    el.innerHTML = `
      <div class="modal__overlay" id="productOverlay"></div>
      <div class="modal__panel">
        <header class="modal__head">
          <h3 id="pmTitle">Chi tiết sản phẩm</h3>
          <button class="btn btn--icon" id="pmClose">✕</button>
        </header>
        <div class="pm-body">
          <div class="pm-thumb" id="pmThumb">🛒</div>
          <div class="pm-info">
            <div class="pm-name" id="pmName"></div>
            <div class="pm-price" id="pmPrice"></div>
            <p class="pm-desc" id="pmDesc"></p>
            <label class="pm-qty">SL:
              <input id="pmQty" type="number" min="1" step="1" value="1" />
            </label>
            <button class="btn btn--pri" id="pmAdd">Thêm vào giỏ</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);
    $('#pmClose', el).addEventListener('click', closeProductModal);
    $('#productOverlay', el).addEventListener('click', closeProductModal);
    document.addEventListener('keydown', (e) => { if (!el.hidden && e.key === 'Escape') closeProductModal(); });
  }
  return el;
}
let currentProductId = null;
async function openProductModal(productId) {
  const modal = ensureProductModal();
  const p = await apiGetProductById(productId);
  if (!p) return;

  currentProductId = p.id;
  $('#pmName', modal).textContent = p.name;
  $('#pmPrice', modal).textContent = money(p.price) + ' • ' + p.unit;
  $('#pmDesc', modal).textContent = 'Sản phẩm tươi ngon, giao nhanh trong ngày. (Mô tả demo)';
  const pmThumb = $('#pmThumb', modal);
  pmThumb.innerHTML = '';
  if (p.image) {
    pmThumb.innerHTML = `<img src="${p.image}" alt="${p.name}" style="width:160px;height:160px;object-fit:cover;border-radius:12px;" />`;
  } else {
    pmThumb.textContent = p.emoji || '🛒';
  }
  $('#pmQty', modal).value = 1;

  $('#pmAdd', modal).onclick = () => {
    const qty = Math.max(1, parseInt($('#pmQty', modal).value || '1', 10));
    addToCart(p.id, qty);
    showToast(`${p.name} (+${qty}) đã vào giỏ.`);
    closeProductModal();
    openCart();
  };

  modal.hidden = false;
}
function closeProductModal() {
  const modal = ensureProductModal();
  modal.hidden = true;
  currentProductId = null;
}
function attachCardClicks() {
  gridEl.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      const isBtn = e.target.closest('[data-action]');
      if (isBtn) return;
      const pid = card.dataset.id;
      if (pid) openProductModal(pid);
    });
  });
}

// ---------- Checkout Modal ----------
function ensureCheckoutModal() {
  let el = document.getElementById('checkoutModal');
  if (!el) {
    el = document.createElement('section');
    el.id = 'checkoutModal';
    el.className = 'modal';
    el.hidden = true;
    el.innerHTML = `
      <div class="modal__overlay" id="coOverlay"></div>
      <div class="modal__panel">
        <header class="modal__head">
          <h3>Thanh toán</h3>
          <button class="btn btn--icon" id="coClose">✕</button>
        </header>

        <form class="form" id="coForm">
          <div class="grid" style="grid-template-columns:1fr;">
            <input name="name" class="input" placeholder="Họ tên" required />
            <input name="phone" class="input" placeholder="Số điện thoại" required />
            <textarea name="address" class="input" placeholder="Địa chỉ giao hàng" required></textarea>
          </div>

          <div class="grid" style="grid-template-columns:1fr 1fr;">
            <div>
              <label>Khung giờ giao</label>
              <select name="slot" class="input" id="coSlot"></select>
            </div>
            <div>
              <label>Voucher</label>
              <div style="display:flex; gap:8px;">
                <input name="voucher" class="input" placeholder="FREESHIP / GIAM10" />
                <button type="button" class="btn" id="coApplyVoucher">Áp dụng</button>
              </div>
              <p class="muted" id="coVoucherMsg"></p>
            </div>
          </div>

          <div class="grid" style="grid-template-columns:1fr 1fr;">
            <div>
              <label>Phương thức thanh toán</label>
              <select name="payment" class="input">
                <option value="COD">COD - tiền mặt</option>
                <option value="ONLINE">Online (demo)</option>
              </select>
            </div>
            <div>
              <label>Ghi chú</label>
              <input name="note" class="input" placeholder="Ví dụ: gọi trước khi giao" />
            </div>
          </div>

          <div id="coSummary" class="muted"></div>
          <button class="btn btn--pri btn--full">Xác nhận đặt hàng</button>
        </form>
      </div>`;
    document.body.appendChild(el);
    $('#coClose', el).addEventListener('click', closeCheckoutModal);
    $('#coOverlay', el).addEventListener('click', closeCheckoutModal);
    document.addEventListener('keydown', (e) => { if (!el.hidden && e.key === 'Escape') closeCheckoutModal(); });
  }
  return el;
}
async function openCheckoutModal() {
  const el = ensureCheckoutModal();
  const slots = await apiListDeliverySlots();
  const sel = $('#coSlot', el);
  sel.innerHTML = slots.map(s => `<option value="${s.id}">${s.date} • ${s.window}</option>`).join('');

  const form = $('#coForm', el);
  form.elements.name.value = user.name || '';
  form.elements.phone.value = user.phone || '';
  form.elements.address.value = user.address || '';

  const cart = getCart();
  const entries = Object.entries(cart).filter(([,q]) => q > 0);
  const subtotal = entries.reduce((s, [pid, q]) => {
    const p = PRODUCTS.find(x => x.id === pid);
    return s + (p ? p.price * q : 0);
  }, 0);

  let shipping = calcShippingFee(form.elements.address.value, subtotal);
  const sumEl = $('#coSummary', el);
  sumEl.textContent = `Tạm tính: ${money(subtotal)} • Phí ship: ${money(shipping)} • Tổng: ${money(subtotal + shipping)}`;

  $('#coApplyVoucher', el).onclick = async () => {
    const code = form.elements.voucher.value;
    const res = await apiApplyVoucher(code, { subtotal, shippingFee: shipping });
    const msg = $('#coVoucherMsg', el);
    if (!res.ok) { msg.textContent = res.message; return; }
    msg.textContent = res.message;
    let discount = 0;
    if (res.type === 'ship') shipping = 0;
    if (res.type === 'percent') discount = Math.round(subtotal * res.value / 100);
    const total = subtotal + shipping - discount;
    sumEl.textContent = `Tạm tính: ${money(subtotal)} • Giảm: ${money(discount)} • Ship: ${money(shipping)} • Tổng: ${money(total)}`;
    form.dataset.total = String(total);
    form.dataset.discount = String(discount);
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get('name') || '').toString().trim();
    const phone = (fd.get('phone') || '').toString().trim();
    const address = (fd.get('address') || '').toString().trim();
    const slot = (fd.get('slot') || '').toString();
    const voucher = (fd.get('voucher') || '').toString().trim().toUpperCase();
    const payment = (fd.get('payment') || 'COD').toString();
    const note = (fd.get('note') || '').toString();

    if (!name || !phone || !address) { alert('Vui lòng điền đầy đủ thông tin.'); return; }

    const discount = parseInt(form.dataset.discount || '0', 10) || 0;
    const totalNow = parseInt(form.dataset.total || '0', 10) || (subtotal + shipping - discount);

    user = { ...user, name, phone, address };
    localStorage.setItem(LS_USER, JSON.stringify(user));

    const newOrder = await apiCreateOrder({
      user, slot, voucher, payment, note,
      subtotal,
      shipping_fee: shipping,
      discount,
      total: totalNow,
      items: { ...getCart() },
    });

    showToast(`Đặt hàng thành công! Mã đơn: ${newOrder.id}`);
    clearCart();
    closeCheckoutModal();
  };

  el.hidden = false;
}
function closeCheckoutModal() {
  const el = ensureCheckoutModal();
  el.hidden = true;
}

// ---------- ORDERS MODAL (mới) ----------
function ensureOrdersModal() {
  return document.getElementById('ordersModal');
}
function fmtDate(iso) {
  try { const d = new Date(iso); return d.toLocaleString('vi-VN'); } catch { return iso; }
}
async function openOrdersModal() {
  const modal = ensureOrdersModal();
  const body = document.getElementById('ordersBody');
  const data = await apiListOrders();

  if (!data || data.length === 0) {
    body.innerHTML = `<p class="muted">Bạn chưa có đơn hàng nào.</p>`;
  } else {
    body.innerHTML = data.slice().reverse().map(o => {
      const items = Object.entries(o.items || {})
        .filter(([,q]) => q > 0)
        .map(([pid, q]) => {
          const p = PRODUCTS.find(x => x.id === pid);
          return p ? `• ${p.name} × ${q}` : '';
        }).join('<br>');
      return `
        <div class="order-card">
          <div class="order-head">
            <div><strong>Mã đơn:</strong> ${o.id}</div>
            <div class="muted">${fmtDate(o.created_at)}</div>
          </div>
          <div class="muted">Thanh toán: ${o.payment || 'COD'} · Khung giờ: ${o.slot || '-'}</div>
          <div class="order-items">${items || '(Không có mục hàng)'}</div>
          <div style="margin-top:8px;">
            <span class="muted">Tạm tính:</span> ${money(o.subtotal || 0)} · 
            <span class="muted">Giảm:</span> ${money(o.discount || 0)} · 
            <span class="muted">Ship:</span> ${money(o.shipping_fee || 0)} · 
            <span class="order-total">Tổng: ${money(o.total || 0)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // bind close
  document.getElementById('ordersCloseBtn')?.addEventListener('click', closeOrdersModal, { once:true });
  document.getElementById('ordersOverlay')?.addEventListener('click', closeOrdersModal, { once:true });
  document.addEventListener('keydown', escOrdersOnce);

  modal.hidden = false;
}
function closeOrdersModal() {
  const modal = ensureOrdersModal();
  if (modal) modal.hidden = true;
  document.removeEventListener('keydown', escOrdersOnce);
}
function escOrdersOnce(e){ if (e.key === 'Escape') closeOrdersModal(); }

// ---------- Mega Menu ----------
function openMegaMenu() {
  productsMegaMenu.removeAttribute('hidden');
  productsMegaMenu.setAttribute('aria-hidden', 'false');
  productsMenuToggle.setAttribute('aria-expanded', 'true');
  navItem.setAttribute('aria-expanded', 'true');
  const firstLink = productsMegaMenu.querySelector('.mega-menu__link');
  if (firstLink) firstLink.focus();
}
function closeMegaMenu() {
  productsMegaMenu.setAttribute('hidden', '');
  productsMegaMenu.setAttribute('aria-hidden', 'true');
  productsMenuToggle.setAttribute('aria-expanded', 'false');
  navItem.setAttribute('aria-expanded', 'false');
}
function toggleMegaMenu() {
  const isOpen = !productsMegaMenu.hasAttribute('hidden');
  if (isOpen) closeMegaMenu(); else openMegaMenu();
}
function handleMegaMenuKeydown(e) {
  if (e.key === 'Escape') { closeMegaMenu(); productsMenuToggle.focus(); }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const links = Array.from(productsMegaMenu.querySelectorAll('.mega-menu__link'));
    const currentIndex = links.indexOf(document.activeElement);
    const nextIndex = e.key === 'ArrowDown' ? (currentIndex < links.length - 1 ? currentIndex + 1 : 0)
                                            : (currentIndex > 0 ? currentIndex - 1 : links.length - 1);
    links[nextIndex].focus();
  }
}
function handleMegaMenuLinkClick(e) {
  const link = e.target.closest('.mega-menu__link');
  if (!link) return;
  const text = (link.textContent || '').trim();
  if (!text) return;

  // mặc định lọc theo tên click
  filters.nameOnly = true;
  filters.nameTerm = text;
  filters.nameTokens = [];

  // nhóm đặc biệt:
  if (text === 'Cá') { filters.nameTerm = ''; filters.nameTokens = ['Cá ']; }
  if (text === 'Thịt đông lạnh') { filters.cat = 'frozen'; filters.nameTerm = ''; filters.nameTokens = ['Thịt']; }
  else if (text === 'Hải sản đông lạnh') { filters.cat = 'frozen'; filters.nameTerm = ''; filters.nameTokens = ['Hải sản', 'Tôm', 'Cua', 'Cá ']; }
  else if (text === 'Rau củ đông lạnh') { filters.cat = 'frozen'; filters.nameTerm = ''; filters.nameTokens = ['Rau', 'Rau củ', 'Ngô']; }
  else { filters.cat = 'all'; }

  if (catFilter && filters.cat) catFilter.value = filters.cat;
  if (searchInput) searchInput.value = text;
  filters.q = ''; filters.qNorm = '';

  renderWithPagination();
  closeMegaMenu();
  const catalogSection = document.getElementById('catalog');
  if (catalogSection) catalogSection.scrollIntoView({ behavior: 'smooth' });
}

// ---------- Recipes / Contact ----------
function addRecipeToCart() {
  const rName = (recipeInput.value || '').trim().toLowerCase();
  const recipe = RECIPES.find(r => r.name.toLowerCase() === rName);
  if (!recipe) { alert('Không tìm thấy công thức. Vui lòng chọn món từ gợi ý.'); return; }
  for (const item of recipe.items) {
    const product = PRODUCTS.find(p => p.name.toLowerCase().includes(item.match.toLowerCase()));
    if (product && item.qty > 0) addToCart(product.id, item.qty);
  }
  openCart();
}
function onSubmitContact(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = (fd.get('name') || '').toString().trim();
  const email = (fd.get('email') || '').toString().trim();
  const message = (fd.get('message') || '').toString().trim();
  if (!name || !email || !message) { contactMsg.textContent = 'Vui lòng điền đầy đủ thông tin.'; return; }
  contactMsg.textContent = 'Đã gửi! (Mô phỏng cho đồ án, không gửi ra ngoài.)';
  e.target.reset();
}

// ---------- Listeners ----------
function setupInfiniteScroll() {
  if (!sentinel) {
    sentinel = document.createElement('div');
    sentinel.id = 'gridSentinel';
    sentinel.style.height = '1px';
    gridEl.after(sentinel);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && currentPage * pageSize < currentRendered.length) loadMore();
    });
  });
  io.observe(sentinel);
}
function setupListeners() {
  // Search + Filters
  searchToggle.addEventListener('click', () => {
    const isHidden = searchbar.hasAttribute('hidden');
    searchbar.hidden = !isHidden;
    searchToggle.setAttribute('aria-expanded', String(isHidden));
    if (isHidden) searchInput.focus();
  });

  const dl = ensureDatalist('searchList', searchInput);
  dl.innerHTML = PRODUCTS.slice(0, 50).map(p => `<option value="${p.name}"></option>`).join('');

  searchInput.addEventListener('input', debounce(e => {
    filters.q = (e.target.value || '').trim();
    filters.qNorm = normalizeVN(filters.q);
    filters.nameOnly = false; filters.nameTerm = ''; filters.nameTokens = [];
    renderWithPagination();
  }, 200));

  catFilter.addEventListener('change', e => {
    filters.cat = e.target.value;
    filters.nameOnly=false; filters.nameTerm=''; filters.nameTokens=[];
    renderWithPagination();
  });
  sortSelect.addEventListener('change', e => { filters.sort = e.target.value; renderWithPagination(); });
  favOnly.addEventListener('change', e => {
    filters.favOnly = e.target.checked;
    filters.nameOnly=false; filters.nameTerm=''; filters.nameTokens=[];
    renderWithPagination();
  });
  priceRange.addEventListener('input', e => {
    filters.priceMax = +e.target.value;
    priceValue.textContent = `≤ ${money(filters.priceMax)}`;
    renderWithPagination();
  });

  // Cart Drawer
  cartOpenBtn.addEventListener('click', openCart);
  cartCloseBtn.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
  cartOverlay.addEventListener('click', closeCart);

  // Account
  accountBtn.addEventListener('click', () => {
    accountForm.elements.name.value = user.name || '';
    accountForm.elements.email.value = user.email || '';
    accountForm.elements.address.value = user.address || '';
    accountModal.removeAttribute('hidden');
  });
  accountCloseBtn.addEventListener('click', () => accountModal.setAttribute('hidden',''));
  accountOverlay.addEventListener('click', () => accountModal.setAttribute('hidden',''));
  accountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    user = {
      name: (fd.get('name') || '').toString().trim(),
      email: (fd.get('email') || '').toString().trim(),
      address: (fd.get('address') || '').toString().trim(),
    };
    if (!user.name || !user.email || !user.address) { accountMsg.textContent = 'Vui lòng điền đủ thông tin.'; return; }
    localStorage.setItem(LS_USER, JSON.stringify(user));
    accountMsg.textContent = 'Đã lưu thành công!';
    setTimeout(() => { accountModal.setAttribute('hidden',''); accountMsg.textContent = ''; }, 800);
  });

  // Checkout
  checkoutBtn.addEventListener('click', openCheckoutModal);

  // Orders (mới)
  ordersBtn?.addEventListener('click', openOrdersModal);

  // Recipes & Contact
  recipeAddAllBtn.addEventListener('click', addRecipeToCart);
  contactForm?.addEventListener('submit', onSubmitContact);

  // Mega Menu
  productsMenuToggle.addEventListener('click', toggleMegaMenu);
  productsMenuToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMegaMenu(); }
  });
  let hoverTimeout;
  navItem.addEventListener('mouseenter', () => { clearTimeout(hoverTimeout); openMegaMenu(); });
  navItem.addEventListener('mouseleave', () => { hoverTimeout = setTimeout(closeMegaMenu, 150); });
  productsMegaMenu.addEventListener('mouseenter', () => { clearTimeout(hoverTimeout); });
  productsMegaMenu.addEventListener('mouseleave', () => { hoverTimeout = setTimeout(closeMegaMenu, 150); });
  productsMegaMenu.addEventListener('keydown', handleMegaMenuKeydown);
  productsMegaMenu.addEventListener('click', handleMegaMenuLinkClick);

  // Grid: Add/Fav
  gridEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const card = e.target.closest('.card');
    const pid = card?.dataset.id;
    const action = btn.dataset.action;
    if (!pid) return;
    if (action === 'add') {
      const product = PRODUCTS.find(p => p.id === pid);
      showToast(`${product?.name || 'Sản phẩm'} đã được thêm vào giỏ hàng.`);
      addToCart(pid, 1);
    }
    if (action === 'fav') toggleFav(pid, btn);
  });

  // Cart events
  cartItems.addEventListener('click', e => {
    const removeBtn = e.target.closest('[data-action="remove"]');
    if (removeBtn) {
      e.preventDefault(); e.stopPropagation();
      const cartItem = removeBtn.closest('.cart-item');
      const pid = cartItem?.dataset.id;
      if (pid) removeFromCart(pid);
    }
  });
  cartItems.addEventListener('input', e => {
    const qtyInput = e.target.closest('[data-action="qty"]');
    if (qtyInput) {
      const cartItem = qtyInput.closest('.cart-item');
      const pid = cartItem?.dataset.id;
      if (pid) updateCartQuantity(pid, qtyInput.value);
    }
  });
}

// ---------- Init ----------
function init() {
  yearEl.textContent = new Date().getFullYear();

  loadCart();
  try {
    const favArr = JSON.parse(localStorage.getItem(LS_FAV) || '[]');
    favs = new Set(favArr);
    user = JSON.parse(localStorage.getItem(LS_USER) || '{}');
    orders = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
  } catch {
    favs = new Set(); user = {}; orders = [];
  }

  recipeList.innerHTML = RECIPES.map(r => `<option value="${r.name}"></option>`).join('');

  setupListeners();
  priceValue.textContent = `≤ ${money(filters.priceMax)}`;

  apiListProducts().then(list => { productIndex = buildSearchIndex(list); renderWithPagination(); });
  renderUI();
}
init();

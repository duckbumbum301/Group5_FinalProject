// js/main.js — giữ toàn bộ tính năng cũ, chỉ BỔ SUNG:
// - Ép đăng nhập trước khi bấm “Thanh toán” (redirect sang client/login.html)
// - Nút “Tài khoản” link với phần client và lưu trang hiện tại để quay lại
// - Sau khi thanh toán: clear giỏ + mở modal “Đơn Hàng”

import { $, money, debounce, normalizeVN, ensureDatalist } from "./utils.js";
import { RECIPES } from "./data.js";
import {
  loadCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCart,
} from "./cart.js";
import { renderUI, renderProducts, openCart, closeCart } from "./ui.js";
import {
  apiListProducts,
  apiGetProductById,
  apiRegisterUser,
  apiLoginUser,
  apiLogoutUser,
  apiCurrentUser,
  apiUpdateProfile,
  apiChangePassword,
} from "./api.js";
// Lazy-load checkout/orders on demand

import { closeMegaMenu, bindMegaMenu } from "./menu.js";
import { createExtras } from "./extras.js";
import { bindAuthModal, openAuthModal, closeAuthModal } from "./auth-modal.js";

// Toast helper (giữ nguyên)
function ensureToastContainer() {
  let c = document.getElementById("toastContainer");
  if (!c) {
    c = document.createElement("div");
    c.id = "toastContainer";
    c.className = "toast-container";
    document.body.appendChild(c);
  }
  return c;
}
function showToast(message, duration = 2500) {
  const container = ensureToastContainer();
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span class="toast-message">${message}</span><button class="toast-close" aria-label="Close">×</button>`;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  const remove = () => {
    t.classList.remove("show");
    t.addEventListener("transitionend", () => t.remove(), { once: true });
  };
  const timer = setTimeout(remove, duration);
  t.querySelector(".toast-close").addEventListener("click", () => {
    clearTimeout(timer);
    remove();
  });
}

// ---------- State ----------
const LS_USER = "vvv_user";
const LS_ORDERS = "vvv_orders";
const LS_FAV = "vvv_fav";

let user = {}; // { name, email, address, ... }
let orders = [];
let favs = new Set();

let filters = {
  q: "",
  qNorm: "",
  cat: "all",
  sub: "all",
  sort: "pop",
  priceMax: 250000,
  favOnly: false,
  nameOnly: false,
  nameTerm: "",
  nameTokens: [],
};

// infinite scroll
let pageSize = 16;
let currentPage = 1;
let currentRendered = [];
let sentinel;

// ---------- DOM refs ----------
const yearEl = $("#year");
const gridEl = $("#productGrid");
const priceRange = $("#priceRange");
const priceValue = $("#priceValue");
const searchToggle = $("#searchToggle");
const searchbar = $("#searchbar");
const searchInput = $("#searchInput");
const sortSelect = $("#sortSelect");
const catFilter = $("#categoryFilter");
const favOnly = $("#favOnly");
const cartOpenBtn = $("#cartOpenBtn");
const cartOverlay = $("#cartOverlay");
const cartCloseBtn = $("#cartCloseBtn");
const cartItems = $("#cartItems");
const recipeInput = $("#recipeInput");
const recipeList = $("#recipeList");
const recipeAddAllBtn = $("#recipeAddAllBtn");
const contactForm = $("#contactForm");
const contactMsg = $("#contactMsg");
const accountBtn = $("#accountBtn");
const accountModal = $("#accountModal");
const accountOverlay = $("#accountOverlay");
const accountCloseBtn = $("#accountCloseBtn");
const accountForm = $("#accountForm");
const accountMsg = $("#accountMsg");
const checkoutBtn = $("#checkoutBtn");

// Toggle trạng thái disabled cho nút Thanh toán theo giỏ hàng
function updateCheckoutButtonState() {
  if (!checkoutBtn) return;
  const entries = Object.entries(getCart()).filter(([, q]) => q > 0);
  const shouldDisable = entries.length === 0;
  checkoutBtn.disabled = shouldDisable;
  checkoutBtn.setAttribute('aria-disabled', shouldDisable ? 'true' : 'false');
  checkoutBtn.title = shouldDisable ? 'Giỏ hàng trống' : '';
}

// Account Drawer helpers
function openAccountDrawer() {
  if (!accountModal) return;
  accountModal.removeAttribute('hidden');
  // Bind one-off closers
  accountCloseBtn && accountCloseBtn.addEventListener('click', closeAccountDrawer, { once: true });
  accountOverlay && accountOverlay.addEventListener('click', closeAccountDrawer, { once: true });
  // Prefill profile form from current user
  (async () => {
    try {
      const u = await apiCurrentUser();
      if (!u || !accountForm) return;
      const f = accountForm;
      f.elements.name && (f.elements.name.value = u.name || '');
      f.elements.email && (f.elements.email.value = u.email || '');
      f.elements.phone && (f.elements.phone.value = u.phone || '');
      f.elements.address && (f.elements.address.value = u.address || '');
      addressPanelRefresh();
    } catch {}
  })();
  // Ensure drawer UI wired and default section
  initAccountDrawerUI();
  ensureLatLngFields();
  addressPanelRefresh();
  setAccountSection('profile');
}
function closeAccountDrawer() {
  if (!accountModal) return;
  accountModal.setAttribute('hidden','');
}

// Auth UI refs
const authBadge = document.getElementById("authBadge");
const accountMenuBtn = document.getElementById("accountMenuBtn");
const accountMenu = document.getElementById("accountMenu");
const btnLogout = document.getElementById("btnLogout");
const authModal = document.getElementById("authModal");
const authOverlay = document.getElementById("authOverlay");
const authCloseBtn = document.getElementById("authCloseBtn");
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMsg = document.getElementById("loginMsg");
const registerMsg = document.getElementById("registerMsg");

// Account Drawer UI refs
const acctNavProfile = document.getElementById('acctNavProfile');
const acctNavAddress = document.getElementById('acctNavAddress');
const acctNavOrders = document.getElementById('acctNavOrders');
const acctNavSecurity = document.getElementById('acctNavSecurity');
const accountProfilePanel = document.getElementById('accountProfilePanel');
const accountAddressPanel = document.getElementById('accountAddressPanel');
const accountOrdersPanel = document.getElementById('accountOrdersPanel');
const accountPasswordPanel = document.getElementById('accountPasswordPanel');
const acctAddrCount = document.getElementById('acctAddrCount');
const acctAddrText = document.getElementById('acctAddrText');
const acctAddrInline = document.getElementById('acctAddrInline');
const acctEditAddress = document.getElementById('acctEditAddress');
const accountOrdersBody = document.getElementById('accountOrdersBody');
const changePasswordForm = document.getElementById('changePasswordForm');
const pwMsg = document.getElementById('pwMsg');

function ensureLatLngFields(){
  if(!accountForm) return;
  if(!accountForm.elements.lat){ const inp = document.createElement('input'); inp.type='hidden'; inp.name='lat'; accountForm.appendChild(inp); }
  if(!accountForm.elements.lng){ const inp = document.createElement('input'); inp.type='hidden'; inp.name='lng'; accountForm.appendChild(inp); }
}
function addressPanelRefresh(){
  const addr = accountForm?.elements?.address?.value || '';
  if (acctAddrText) acctAddrText.textContent = addr || 'Chưa có địa chỉ mặc định.';
  if (acctAddrInline) acctAddrInline.textContent = addr ? `Địa chỉ mặc định: ${addr}` : 'Chưa có địa chỉ mặc định.';
  if (acctAddrCount) acctAddrCount.textContent = addr ? '(1)' : '(0)';
}
async function setAccountSection(section){
  [acctNavProfile, acctNavOrders, acctNavSecurity, acctNavAddress].forEach(el=>el?.classList.remove('active'));
  if(accountProfilePanel) accountProfilePanel.hidden = section !== 'profile';
  if(accountOrdersPanel) accountOrdersPanel.hidden = section !== 'orders';
  if(accountPasswordPanel) accountPasswordPanel.hidden = section !== 'password';
  if(accountAddressPanel) accountAddressPanel.hidden = section !== 'address';
  const nav = section==='profile'?acctNavProfile
            : section==='orders'?acctNavOrders
            : section==='password'?acctNavSecurity
            : acctNavAddress;
  nav?.classList.add('active');
  if(section==='orders' && accountOrdersBody){
    const mod = await import('./orders.js');
    await mod.renderOrdersInto(accountOrdersBody);
  }
  if(section==='address') addressPanelRefresh();
}
function initAccountDrawerUI(){
  if(!accountModal) return;
  if(accountModal.hasAttribute('data-bound')) return;
  acctNavProfile?.addEventListener('click', (e)=>{ e.preventDefault(); setAccountSection('profile'); });
  acctNavOrders?.addEventListener('click', (e)=>{ e.preventDefault(); setAccountSection('orders'); });
  acctNavSecurity?.addEventListener('click', (e)=>{ e.preventDefault(); setAccountSection('password'); });
  acctNavAddress?.addEventListener('click', (e)=>{ e.preventDefault(); setAccountSection('address'); });
  acctEditAddress?.addEventListener('click', async (e)=>{ e.preventDefault(); ensureLatLngFields(); const mod = await import('./checkout.js'); await mod.openAddressPicker(accountForm); addressPanelRefresh(); });
  accountForm?.addEventListener('input', (e)=>{ if(e.target?.name==='address') addressPanelRefresh(); });
  accountModal.setAttribute('data-bound','true');
}
// NEW: Orders
const ordersBtn = $("#ordersBtn");

// Mega Menu refs
const productsMenuToggle = $("#productsMenuToggle");
const productsMegaMenu = $("#productsMegaMenu");
const navItem = document.querySelector(".nav-item--dropdown");

// ---------- Helpers ----------
function buildSearchIndex(items) {
  return items.map((p) => ({ ...p, _norm: normalizeVN(p.name) }));
}
let productIndex = [];
let allProducts = [];
let productMap = {};

// ---------- Filtering + Render ----------
function applyFilters() {
  let items = productIndex.filter(
    (p) => p.stock && p.price <= filters.priceMax
  );
  if (
    (filters.nameOnly && filters.nameTerm) ||
    (filters.nameTokens && filters.nameTokens.length)
  ) {
    const tokens = (filters.nameTokens || []).map((s) => normalizeVN(s));
    const hasTerm = (txt) =>
      tokens.length
        ? tokens.some((tk) => txt.includes(tk))
        : filters.nameTerm
        ? txt.includes(normalizeVN(filters.nameTerm))
        : true;
    items = items.filter((p) => hasTerm(p._norm));
  } else {
    if (filters.cat !== "all")
      items = items.filter((p) => p.cat === filters.cat);
    if (filters.sub !== "all")
      items = items.filter((p) => (p.sub || "all") === filters.sub);
    if (filters.qNorm)
      items = items.filter((p) => p._norm.includes(filters.qNorm));
    if (filters.favOnly) items = items.filter((p) => favs.has(p.id));
  }
  if (filters.sort === "priceAsc") items.sort((a, b) => a.price - b.price);
  else if (filters.sort === "priceDesc")
    items.sort((a, b) => b.price - a.price);
  else items.sort((a, b) => b.pop - a.pop);
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
  if (favs.has(pid)) favs.delete(pid);
  else favs.add(pid);
  if (btn) btn.setAttribute("aria-pressed", favs.has(pid) ? "true" : "false");
  localStorage.setItem(LS_FAV, JSON.stringify([...favs]));
  // Phát sự kiện để các module khác (Flash Sale, Catalog khác) đồng bộ
  try {
    document.dispatchEvent(new CustomEvent('fav:changed', { detail: { pid, on: favs.has(pid) } }));
  } catch {}
}

// ---------- Product Modal ----------
function ensureProductModal() {
  /* giữ nguyên như file của bạn */ let el =
    document.getElementById("productModal");
  if (!el) {
    el = document.createElement("section");
    el.id = "productModal";
    el.className = "modal";
    el.hidden = true;
    el.innerHTML = `<div class="modal__overlay" id="productOverlay"></div><div class="modal__panel"><header class="modal__head"><h3 id="pmTitle">Chi tiết sản phẩm</h3><button class="btn btn--icon" id="pmClose">✕</button></header><div class="pm-body"><div class="pm-thumb" id="pmThumb">🛒</div><div class="pm-info"><div class="pm-name" id="pmName"></div><div class="pm-price" id="pmPrice"></div><p class="pm-desc" id="pmDesc"></p><label class="pm-qty">SL: <input id="pmQty" type="number" min="1" step="1" value="1" /></label><button class="btn btn--pri" id="pmAdd">Thêm vào giỏ</button></div></div></div>`;
    document.body.appendChild(el);
    $("#pmClose", el).addEventListener("click", closeProductModal);
    $("#productOverlay", el).addEventListener("click", closeProductModal);
    document.addEventListener("keydown", (e) => {
      if (!el.hidden && e.key === "Escape") closeProductModal();
    });
  }
  return el;
}
let currentProductId = null;
async function openProductModal(productId) {
  const modal = ensureProductModal();
  const p = await apiGetProductById(productId);
  if (!p) return;
  currentProductId = p.id;
  $("#pmName", modal).textContent = p.name;
  $("#pmPrice", modal).textContent = money(p.price) + " • " + p.unit;
  $("#pmDesc", modal).textContent =
    "Sản phẩm tươi ngon, giao nhanh trong ngày. (Mô tả demo)";
  const pmThumb = $("#pmThumb", modal);
  pmThumb.innerHTML = "";
  if (p.image) {
    pmThumb.innerHTML = `<img src="${p.image}" alt="${p.name}" style="width:160px;height:160px;object-fit:cover;border-radius:12px;" />`;
  } else {
    pmThumb.textContent = p.emoji || "🛒";
  }
  $("#pmQty", modal).value = 1;
  $("#pmAdd", modal).onclick = () => {
    const qty = Math.max(1, parseInt($("#pmQty", modal).value || "1", 10));
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
  gridEl.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (e) => {
      const isBtn = e.target.closest("[data-action]");
      if (isBtn) return;
      const pid = card.dataset.id;
      if (pid) openProductModal(pid);
    });
  });
}

// ---------- Auth helpers ----------
async function refreshCurrentUser() {
  try {
    const u = await apiCurrentUser();
    if (u) {
      user = {
        ...user,
        name: u.name || user.name,
        email: u.email || user.email,
        address: u.address || user.address,
        phone: u.phone || user.phone,
      };
      localStorage.setItem(LS_USER, JSON.stringify(user));
      if (authBadge) authBadge.textContent = u.name || u.email || u.phone || "";
      if (btnLogout) btnLogout.hidden = false;
      const logoutItem = accountMenu?.querySelector('[data-action="logout"]');
      const loginItem = accountMenu?.querySelector('[data-action="login"]');
      const regItem = accountMenu?.querySelector('[data-action="register"]');
      if (logoutItem) logoutItem.hidden = false;
      if (loginItem) loginItem.hidden = true;
      if (regItem) regItem.hidden = true;
    } else {
      if (authBadge) authBadge.textContent = "";
      if (btnLogout) btnLogout.hidden = true;
      const logoutItem = accountMenu?.querySelector('[data-action="logout"]');
      const loginItem = accountMenu?.querySelector('[data-action="login"]');
      const regItem = accountMenu?.querySelector('[data-action="register"]');
      if (logoutItem) logoutItem.hidden = true;
      if (loginItem) loginItem.hidden = false;
      if (regItem) regItem.hidden = false;
    }
  } catch {}
}
// Auth Modal helpers moved to ./auth-modal.js


// ---------- ORDERS MODAL ----------

// ---------- Mega Menu (module) ----------
// functions are imported from ./menu.js
function handleMegaMenuLinkClick(e) {
  const link = e.target.closest(".mega-menu__link");
  if (!link) return;
  const catAttr = link.getAttribute("data-category") || "all";
  const subAttr = link.getAttribute("data-sub") || "all";
  filters.nameOnly = false;
  filters.nameTerm = "";
  filters.nameTokens = [];
  filters.cat = catAttr;
  filters.sub = subAttr;
  // Đồng bộ dropdown danh mục theo lựa chọn Mega Menu (9 mục)
  if (catFilter) {
    const selectValueFor = (cat /*, sub*/ ) => {
      if (cat === 'veg') return 'veg';
      if (cat === 'fruit') return 'fruit';
      if (cat === 'meat') return 'meat';
      if (cat === 'drink') return 'drink';
      if (cat === 'dry') return 'dry';
      if (cat === 'spice') return 'spice';
      if (cat === 'household') return 'household';
      if (cat === 'sweet') return 'sweet';
      return 'all';
    };
    catFilter.value = selectValueFor(filters.cat);
  }
  if (searchInput) searchInput.value = "";
  filters.q = "";
  filters.qNorm = "";
  renderWithPagination();
  closeMegaMenu();
  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
}

// ---------- Recipes / Contact (module) ----------
// handlers are imported from ./extras.js

// ---------- Extras setup ----------
const { addRecipeToCart, onSubmitContact } = createExtras({
  getAllProducts: () => allProducts,
  addToCart,
  openCart,
});

// ---------- Listeners ----------
function setupInfiniteScroll() {
  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.id = "gridSentinel";
    sentinel.style.height = "1px";
    gridEl.after(sentinel);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting &&
        currentPage * pageSize < currentRendered.length
      )
        loadMore();
    });
  });
  io.observe(sentinel);
}

function setupListeners() {
  // Xử lý click logo: cuộn mượt nếu đang ở Front Store
  const logoEl = $(".logo");
  // Không gắn handler cho logo; để <a> tự điều hướng và reload tự nhiên.
  // Search + Filters
  // Ô tìm kiếm inline: không toggle, luôn hiển thị trong header
  const searchBtn = document.querySelector('.searchbox__btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const q = (searchInput?.value || '').trim();
      filters.q = q;
      filters.qNorm = normalizeVN(q);
      filters.nameOnly = false;
      filters.nameTerm = '';
      filters.nameTokens = [];
      renderWithPagination();
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
  const dl = ensureDatalist("searchList", searchInput);
  dl.innerHTML = allProducts.slice(0, 50)
    .map((p) => `<option value="${p.name}"></option>`)
    .join("");
  searchInput.addEventListener(
    "input",
    debounce((e) => {
      filters.q = (e.target.value || "").trim();
      filters.qNorm = normalizeVN(filters.q);
      filters.nameOnly = false;
      filters.nameTerm = "";
      filters.nameTokens = [];
      renderWithPagination();
    }, 200)
  );
  catFilter.addEventListener("change", (e) => {
    const val = e.target.value;
    // Ánh xạ 9 giá trị dropdown sang (cat, sub)
    const MAP = {
      all: { cat: 'all', sub: 'all' },
      veg: { cat: 'veg', sub: 'all' },
      fruit: { cat: 'fruit', sub: 'all' },
      meat: { cat: 'meat', sub: 'all' },
      drink: { cat: 'drink', sub: 'all' },
      dry: { cat: 'dry', sub: 'all' },
      spice: { cat: 'spice', sub: 'all' },
      household: { cat: 'household', sub: 'all' },
      sweet: { cat: 'sweet', sub: 'all' },
    };
    const m = MAP[val] || { cat: 'all', sub: 'all' };
    filters.cat = m.cat;
    filters.sub = m.sub;
    filters.nameOnly = false;
    filters.nameTerm = "";
    filters.nameTokens = [];
    renderWithPagination();
  });
  sortSelect.addEventListener("change", (e) => {
    filters.sort = e.target.value;
    renderWithPagination();
  });
  favOnly.addEventListener("change", (e) => {
    filters.favOnly = e.target.checked;
    filters.nameOnly = false;
    filters.nameTerm = "";
    filters.nameTokens = [];
    renderWithPagination();
  });
  priceRange.addEventListener("input", (e) => {
    filters.priceMax = +e.target.value;
    priceValue.textContent = `≤ ${money(filters.priceMax)}`;
    renderWithPagination();
  });

  // Account dropdown toggle
  accountMenuBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    const isHidden = accountMenu?.hasAttribute("hidden");
    if (accountMenu) accountMenu.hidden = !isHidden;
    accountMenuBtn?.setAttribute("aria-expanded", String(isHidden));
  });
  document.addEventListener("click", (e) => {
    if (!accountMenu || !accountMenuBtn) return;
    const t = e.target;
    if (accountMenu.contains(t) || accountMenuBtn.contains(t)) return;
    accountMenu.hidden = true;
    accountMenuBtn.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && accountMenu && !accountMenu.hasAttribute("hidden")) {
      accountMenu.hidden = true;
      accountMenuBtn?.setAttribute("aria-expanded", "false");
    }
  });

  // Cart Drawer
  cartOpenBtn.addEventListener("click", openCart);
  cartCloseBtn.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });
  cartOverlay.addEventListener("click", closeCart);

  // Account button: nếu chưa đăng nhập thì điều hướng sang trang Đăng nhập riêng; nếu đã đăng nhập thì mở drawer Tài khoản
  accountBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const u = await apiCurrentUser();
      if (u) {
        openAccountDrawer();
      } else {
        location.href = new URL('../client/login.html', location.href).toString();
      }
    } catch {
      location.href = new URL('../client/login.html', location.href).toString();
    }
  });

  // Checkout guard: chặn giỏ trống + ép đăng nhập trước khi mở modal
  checkoutBtn.addEventListener("click", async () => {
    const entries = Object.entries(getCart()).filter(([, q]) => q > 0);
    if (!entries.length) {
      showToast("Giỏ hàng đang trống. Vui lòng thêm sản phẩm.");
      return;
    }
    const mod = await import("./checkout.js");
    mod.openCheckoutModal();
  });

  // Orders (lazy-load)
  ordersBtn?.addEventListener("click", async () => {
    const mod = await import("./orders.js");
    mod.openOrdersModal();
  });

  // Auto-open Orders on event (lazy-load)
  document.addEventListener("orders:open", async () => {
    const mod = await import("./orders.js");
    mod.openOrdersModal();
  });


  // Auth UI: logout rồi điều hướng sang trang Đăng nhập riêng
  btnLogout?.addEventListener("click", async () => {
    await apiLogoutUser();
    await refreshCurrentUser();
    closeAccountDrawer();
    try { localStorage.setItem('vvv_return_to', '../html/index.html'); } catch {}
    location.href = new URL('../client/login.html', location.href).toString();
  });

  // Auth Modal
  bindAuthModal();
  // Tabs toggle: điều hướng sang trang riêng có background
  tabLogin?.addEventListener('click', (e) => { e.preventDefault(); location.href = new URL('../client/login.html', location.href).toString(); });
  tabRegister?.addEventListener('click', (e) => { e.preventDefault(); location.href = new URL('../client/register.html', location.href).toString(); });
  // Submit handlers for login/register
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(loginForm);
    const payload = {
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      password: String(fd.get('password') || ''),
    };
    if (loginMsg) loginMsg.textContent = 'Đang đăng nhập...';
    try {
      const res = await apiLoginUser(payload);
      if (res?.ok) {
        if (loginMsg) loginMsg.textContent = 'Đăng nhập thành công.';
        await refreshCurrentUser();
        // Xóa giỏ hàng của phiên cũ để tránh lẫn dữ liệu giữa người dùng
        clearCart();
        closeAuthModal();
        openAccountDrawer();
      } else if (res?.reason === 'user_not_found') {
        if (loginMsg) loginMsg.textContent = 'Không tìm thấy tài khoản — chuyển sang Đăng ký.';
        location.href = new URL('../client/register.html', location.href).toString();
      } else if (res?.reason === 'wrong_password') {
        if (loginMsg) loginMsg.textContent = 'Mật khẩu không đúng.';
      } else {
        if (loginMsg) loginMsg.textContent = res?.message || 'Đăng nhập thất bại.';
      }
    } catch {
      if (loginMsg) loginMsg.textContent = 'Có lỗi khi đăng nhập.';
    }
  });
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(registerForm);
    const payload = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      password: String(fd.get('password') || ''),
      address: String(fd.get('address') || ''),
    };
    if (registerMsg) registerMsg.textContent = 'Đang đăng ký...';
    try {
      const res = await apiRegisterUser(payload);
      if (res?.ok) {
        if (registerMsg) registerMsg.textContent = 'Đăng ký thành công — đã đăng nhập.';
        await refreshCurrentUser();
        // Xóa giỏ hàng cũ sau khi tạo tài khoản và đăng nhập phiên mới
        clearCart();
        closeAuthModal();
        openAccountDrawer();
      } else {
        if (registerMsg) registerMsg.textContent = res?.message || 'Đăng ký thất bại.';
      }
    } catch {
      if (registerMsg) registerMsg.textContent = 'Có lỗi khi đăng ký.';
    }
  });

  // Account profile: submit để lưu thông tin
  accountForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(accountForm);
    const payload = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      address: String(fd.get('address') || ''),
    };
    accountMsg.textContent = 'Đang lưu...';
    const res = await apiUpdateProfile(payload);
    if (res.ok) {
      accountMsg.textContent = 'Đã lưu thông tin.';
      addressPanelRefresh();
    } else {
      accountMsg.textContent = res.error ?? 'Lưu thất bại, thử lại.';
    }
  });

  // Change password: submit để đổi mật khẩu hiện tại
  changePasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(changePasswordForm);
    const cur = String(fd.get('current') || '');
    const nw = String(fd.get('new') || '');
    const cf = String(fd.get('confirm') || '');
    if (pwMsg) pwMsg.textContent = '';
    if (!cur) { if (pwMsg) pwMsg.textContent = 'Vui lòng nhập mật khẩu hiện tại.'; return; }
    if (nw.length < 6) { if (pwMsg) pwMsg.textContent = 'Mật khẩu mới tối thiểu 6 ký tự.'; return; }
    if (nw !== cf) { if (pwMsg) pwMsg.textContent = 'Xác nhận mật khẩu chưa khớp.'; return; }
    if (pwMsg) pwMsg.textContent = 'Đang đổi mật khẩu...';
    const res = await apiChangePassword({ oldPassword: cur, newPassword: nw });
    if (res?.ok) {
      if (pwMsg) pwMsg.textContent = 'Đổi mật khẩu thành công.';
      try { changePasswordForm.reset(); } catch {}
    } else {
      if (pwMsg) pwMsg.textContent = res?.message || 'Đổi mật khẩu thất bại.';
    }
  });

  // Recipes & Contact
  recipeAddAllBtn.addEventListener("click", addRecipeToCart);
  contactForm?.addEventListener("submit", onSubmitContact);

  // Mega Menu (moved wiring to module)
  bindMegaMenu(handleMegaMenuLinkClick);

  // Grid: Add/Fav
  gridEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const card = e.target.closest(".card");
    const pid = card?.dataset.id;
    const action = btn.dataset.action;
    if (!pid) return;
    if (action === "add") {
      const product = productMap[pid];
      showToast(`${product?.name || "Sản phẩm"} đã được thêm vào giỏ hàng.`);
      addToCart(pid, 1);
    }
    if (action === "fav") { 
      // Hiệu ứng rung tim
      btn.classList.add("fav-anim");
      btn.addEventListener("animationend", () => btn.classList.remove("fav-anim"), { once: true });
      // Toggle fav + phát sự kiện
      toggleFav(pid, btn);
    }
  });

  // Cart events
  cartItems.addEventListener("click", (e) => {
    const removeBtn = e.target.closest('[data-action="remove"]');
    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const cartItem = removeBtn.closest(".cart-item");
      const pid = cartItem?.dataset.id;
      if (pid) removeFromCart(pid);
    }
  });
  cartItems.addEventListener("input", (e) => {
    const qtyInput = e.target.closest('[data-action="qty"]');
    if (qtyInput) {
      const cartItem = qtyInput.closest(".cart-item");
      const pid = cartItem?.dataset.id;
      if (pid) updateCartQuantity(pid, qtyInput.value);
    }
  });
}

// ---------- Promo Slider ----------
function initPromoSlider(){
   const track = document.getElementById('promoTrack');
   const dotsWrap = document.getElementById('promoDots');
   const prevBtn = document.getElementById('promoPrev');
   const nextBtn = document.getElementById('promoNext');
   const slider = track?.parentElement;
   if (!track || !dotsWrap || !slider) return;
   const slides = track.children;
   const dots = Array.from(dotsWrap.querySelectorAll('.dot'));
   let index = 0;
   function apply(){
    const w = slider.clientWidth || (track.scrollWidth / slides.length) || 0;
    track.style.transform = `translateX(-${index * w}px)`;
    dots.forEach((d,i)=> d.classList.toggle('active', i===index));
  }
   dots.forEach((d)=>{
     d.addEventListener('click', ()=>{ index = +d.dataset.index; apply(); restartAuto(); });
   });
   prevBtn?.addEventListener('click', ()=>{ index = (index - 1 + slides.length) % slides.length; apply(); restartAuto(); });
   nextBtn?.addEventListener('click', ()=>{ index = (index + 1) % slides.length; apply(); restartAuto(); });
   let timer;
   function startAuto(){ timer = setInterval(()=>{ index = (index + 1) % slides.length; apply(); }, 4000); }
   function restartAuto(){ clearInterval(timer); startAuto(); }
   // Pause on hover
   slider.addEventListener('mouseenter', ()=> clearInterval(timer));
   slider.addEventListener('mouseleave', ()=> startAuto());
   // Keyboard navigation
   slider.setAttribute('tabindex','0');
   document.addEventListener('keydown', (e)=>{
     const tag = e.target?.tagName;
     if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
     if (e.key === 'ArrowLeft') { prevBtn?.click(); }
     else if (e.key === 'ArrowRight') { nextBtn?.click(); }
   });
   window.addEventListener('resize', apply);
   // Touch swipe
   let startX = 0;
   slider.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; });
   slider.addEventListener('touchend', (e)=>{
     const dx = e.changedTouches[0].clientX - startX;
     if (Math.abs(dx) > 30) {
       if (dx < 0) nextBtn?.click(); else prevBtn?.click();
     }
   });
   startAuto();
   apply();
 }

// ---------- Init ----------
function init() {
  yearEl.textContent = new Date().getFullYear();
  loadCart();
  updateCheckoutButtonState();
  try {
    const favArr = JSON.parse(localStorage.getItem(LS_FAV) || "[]");
    favs = new Set(favArr);
    user = JSON.parse(localStorage.getItem(LS_USER) || "{}");
    orders = JSON.parse(localStorage.getItem(LS_ORDERS) || "[]");
  } catch {
    favs = new Set();
    user = {};
    orders = [];
  }

  recipeList.innerHTML = RECIPES.map(
    (r) => `<option value="${r.name}"></option>`
  ).join("");
  setupListeners();
  priceValue.textContent = `≤ ${money(filters.priceMax)}`;

  apiListProducts().then((list) => {
    allProducts = list;
    productMap = Object.fromEntries(list.map((p) => [p.id, p]));
    productIndex = buildSearchIndex(list);
    const dl = ensureDatalist("searchList", searchInput);
    dl.innerHTML = allProducts.slice(0, 50)
      .map((p) => `<option value="${p.name}"></option>`)
      .join("");
    renderWithPagination();
  });
  renderUI();
  initPromoSlider();
  refreshCurrentUser();
  document.addEventListener('cart:changed', () => {
    renderUI();
    updateCheckoutButtonState();
  });
}
init();

// Enforce canonical origin for local dev: localhost:8080
(function relaxOrigin(){
  // No-op: do not force redirect to specific host/port.
})();

// Đồng bộ fav khi nhận sự kiện từ module khác
document.addEventListener('fav:changed', () => {
  try {
    const favArr = JSON.parse(localStorage.getItem(LS_FAV) || '[]');
    favs = new Set(favArr);
  } catch {}
  // Cập nhật trạng thái aria-pressed cho các nút ngay trên grid Catalog hiện tại
  if (gridEl) {
    gridEl.querySelectorAll('.card').forEach((card) => {
      const pid = card?.dataset?.id;
      const btn = card?.querySelector('.btn.fav');
      if (btn && pid) btn.setAttribute('aria-pressed', favs.has(pid) ? 'true' : 'false');
    });
  }
  // Đồng bộ trạng thái fav trên lưới Flash Sale nếu đang hiển thị
  const flashGridEl = document.getElementById('flashGrid');
  if (flashGridEl) {
    flashGridEl.querySelectorAll('.card').forEach((card) => {
      const pid = card?.dataset?.id;
      const btn = card?.querySelector('.btn.fav');
      if (btn && pid) btn.setAttribute('aria-pressed', favs.has(pid) ? 'true' : 'false');
    });
  }
  // Nếu đang bật lọc Yêu thích, re-render để phản ánh thay đổi
  if (filters.favOnly) renderWithPagination();
});

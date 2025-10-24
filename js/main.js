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

  // Account button: nếu chưa đăng nhập thì đi tới trang Đăng ký; nếu đã đăng nhập thì mở drawer Tài khoản
  accountBtn.addEventListener("click", async (e) => {
    try {
      const u = await apiCurrentUser();
      if (u) {
        e.preventDefault();
        openAccountDrawer();
      } else {
        // Không ngăn chặn mặc định: để thẻ <a> tự điều hướng
      }
    } catch {
      // Lỗi: coi như chưa đăng nhập, để thẻ <a> tự điều hướng
    }
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

  // Checkout guard: ép đăng nhập trước khi mở modal (lazy-load)
  checkoutBtn.addEventListener("click", async () => {
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
  // Auto-open Order Confirmation on event (lazy-load)
  document.addEventListener("order:confirmed", async (e) => {
    const mod = await import("./orders.js");
    mod.openOrderConfirmModal(e.detail?.orderId);
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
  // Tabs toggle for Auth modal
  tabLogin?.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('login'); });
  tabRegister?.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('register'); });
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
      } else {
        if (res?.reason === 'user_not_found') {
          if (loginMsg) loginMsg.textContent = 'Không tìm thấy tài khoản — chuyển sang Đăng ký.';
          openAuthModal('register');
          if (registerForm) {
            const rEmail = registerForm.querySelector('[name="email"]');
            const rPhone = registerForm.querySelector('[name="phone"]');
            const rPass = registerForm.querySelector('[name="password"]');
            rEmail && (rEmail.value = payload.email || '');
            rPhone && (rPhone.value = payload.phone || '');
            rPass && (rPass.value = payload.password || '');
            const rName = registerForm.querySelector('[name="name"]');
            rName?.focus();
          }
          if (registerMsg) registerMsg.textContent = 'Vui lòng điền thông tin để tạo tài khoản.';
        } else if (res?.reason === 'wrong_password') {
          if (loginMsg) loginMsg.textContent = 'Mật khẩu không đúng.';
        } else {
          if (loginMsg) loginMsg.textContent = res?.message || 'Đăng nhập thất bại.';
        }
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
    if (action === "fav") toggleFav(pid, btn);
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

// ---------- Init ----------
function init() {
  yearEl.textContent = new Date().getFullYear();
  loadCart();
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
  refreshCurrentUser();
  document.addEventListener('cart:changed', () => {
    renderUI();
  });
}
init();

// Enforce canonical origin for local dev: localhost:8080
(function relaxOrigin(){
  // No-op: do not force redirect to specific host/port.
})();

function openAccountDrawer() {
  const modal = document.getElementById("accountModal");
  const profilePanel = document.getElementById("accountProfilePanel");
  const addressPanel = document.getElementById("accountAddressPanel");
  const ordersPanel = document.getElementById("accountOrdersPanel");
  const navProfile = document.getElementById("acctNavProfile");
  const navAddress = document.getElementById("acctNavAddress");
  const navOrders = document.getElementById("acctNavOrders");
  const acctAddrCount = document.getElementById("acctAddrCount");
  const acctAddrText = document.getElementById("acctAddrText");
  const accountForm = document.getElementById("accountForm");
  // Prefetch module đơn hàng và cache lần render đầu
  let ordersLoaded = false;
  const ordersModPromise = import("./orders.js");

  // --- Add resizer handle & drag-to-resize ---
  const panelEl = modal?.querySelector('.drawer__panel');
  if (panelEl) {
    // restore width from previous session
    try {
      const savedW = parseInt(localStorage.getItem('vvv_account_drawer_w') || '0', 10);
      if (savedW && savedW >= 360) {
        panelEl.style.width = `${Math.min(savedW, Math.floor(window.innerWidth * 0.96))}px`;
      }
    } catch {}
    let rs = modal.querySelector('#accountResizer');
    if (!rs) {
      rs = document.createElement('div');
      rs.id = 'accountResizer';
      rs.className = 'drawer__resizer';
      panelEl.appendChild(rs);
    }
    let startX = 0;
    let startW = 0;
    let dragging = false;
    const onMove = (e) => {
      if (!dragging) return;
      const dx = startX - e.clientX; // kéo sang trái => tăng width
      const minW = 360;
      const maxW = Math.floor(window.innerWidth * 0.96);
      const newW = Math.max(minW, Math.min(maxW, startW + dx));
      panelEl.style.width = `${newW}px`;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      try {
        const w = panelEl.getBoundingClientRect().width;
        localStorage.setItem('vvv_account_drawer_w', String(Math.round(w)));
      } catch {}
    };
    rs.addEventListener('mousedown', (e) => {
      dragging = true;
      startX = e.clientX;
      startW = panelEl.getBoundingClientRect().width;
      document.body.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      e.preventDefault();
    });
  }

  function setActive(idx) {
    [navProfile, navAddress, navOrders].forEach((b, i) => b && b.classList.toggle("active", i === idx));
    [profilePanel, addressPanel, ordersPanel].forEach((p, i) => p && (p.hidden = i !== idx));
  }

  // Prefill profile/address from current session
  apiCurrentUser().then((u) => {
    try {
      if (accountForm) {
        const name = accountForm.querySelector("input[name='name']");
        const email = accountForm.querySelector("input[name='email']");
        const phone = accountForm.querySelector("input[name='phone']");
        const addr = accountForm.querySelector("textarea[name='address']");
        if (name) name.value = u?.name || "";
        if (email) email.value = u?.email || "";
        if (phone) phone.value = u?.phone || "";
        if (addr) addr.value = u?.address || "";
      }
      if (acctAddrCount) acctAddrCount.textContent = u?.address ? "(1)" : "(0)";
      if (acctAddrText) acctAddrText.textContent = u?.address || "Chưa có địa chỉ.";
    } catch {}
  });

  // Bind nav (first click only; subsequent state kept by UI)
  navProfile?.addEventListener("click", () => setActive(0));
  navAddress?.addEventListener("click", () => setActive(1));
  navOrders?.addEventListener("click", async () => {
    setActive(2);
    if (!ordersLoaded) {
      const container = document.getElementById("accountOrdersBody") || ordersPanel;
      if (container) container.textContent = "Đang tải đơn hàng...";
      const mod = await ordersModPromise;
      await mod.renderOrdersInto(container);
      ordersLoaded = true;
    }
  });
  document.getElementById("acctEditAddress")?.addEventListener("click", () => {
    setActive(0);
    try { accountForm?.querySelector("textarea[name='address']")?.focus(); } catch {}
  }, { once: true });

  document.getElementById("accountCloseBtn")?.addEventListener("click", closeAccountDrawer, { once: true });
  document.getElementById("accountOverlay")?.addEventListener("click", closeAccountDrawer, { once: true });
  document.addEventListener("keydown", escAccountOnce);

  setActive(0);
  modal.hidden = false;
}
function closeAccountDrawer() {
  const m = document.getElementById("accountModal");
  if (m) m.hidden = true;
  document.removeEventListener("keydown", escAccountOnce);
}
function escAccountOnce(e) { if (e.key === "Escape") closeAccountDrawer(); }

// Submit profile form: update local profile
const accFormEl = document.getElementById("accountForm");
const accMsgEl = document.getElementById("accountMsg");
accFormEl?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(accFormEl);
  const payload = {
    name: String(fd.get("name") || ""),
    email: String(fd.get("email") || ""),
    phone: String(fd.get("phone") || ""),
    address: String(fd.get("address") || ""),
  };
  try {
    const res = await apiUpdateProfile(payload);
    if (res?.ok) {
      if (accMsgEl) accMsgEl.textContent = "Đã lưu thông tin.";
      // update address count/text in Address tab
      const acctAddrCount = document.getElementById("acctAddrCount");
      const acctAddrText = document.getElementById("acctAddrText");
      if (acctAddrCount) acctAddrCount.textContent = payload.address ? "(1)" : "(0)";
      if (acctAddrText) acctAddrText.textContent = payload.address || "Chưa có địa chỉ.";
    } else {
      if (accMsgEl) accMsgEl.textContent = res?.message || "Có lỗi khi lưu.";
    }
  } catch {
    if (accMsgEl) accMsgEl.textContent = "Có lỗi khi lưu. Thử lại sau.";
  }
});

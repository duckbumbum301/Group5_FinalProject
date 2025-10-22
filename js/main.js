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
} from "./cart.js";
import { renderUI, renderProducts, openCart, closeCart } from "./ui.js";
import {
  apiListProducts,
  apiGetProductById,
  apiRegisterUser,
  apiLoginUser,
  apiLogoutUser,
  apiCurrentUser,
} from "./api.js";
// Lazy-load checkout/orders on demand

import { closeMegaMenu, bindMegaMenu } from "./menu.js";
import { createExtras } from "./extras.js";
import { bindAuthModal } from "./auth-modal.js";

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
  if (catFilter) catFilter.value = filters.cat;
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
  // Search + Filters
  searchToggle.addEventListener("click", () => {
    const isHidden = searchbar.hasAttribute("hidden");
    searchbar.hidden = !isHidden;
    searchToggle.setAttribute("aria-expanded", String(isHidden));
    if (isHidden) searchInput.focus();
  });
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
    filters.cat = e.target.value;
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

  // Cart Drawer
  cartOpenBtn.addEventListener("click", openCart);
  cartCloseBtn.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });
  cartOverlay.addEventListener("click", closeCart);

  // Account button: luôn mở trang Hồ sơ khi đang đăng nhập; nếu chưa đăng nhập thì chuyển Login
  accountBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const toLogin = "../client/login.html";
    const toProfile = "../client/profile.html";
    try {
      const s = JSON.parse(localStorage.getItem("vvv_session_v1") || "null");
      const hasSession = !!(s && (s.id || s.phone || s.email));
      if (!hasSession) {
        localStorage.setItem("vvv_return_to", location.href);
        accountBtn.setAttribute("href", toLogin);
        try { window.location.href = toLogin; } catch {}
        return;
      }
      // Đã đăng nhập: luôn mở Profile (không tự động logout theo lượt xem)
      accountBtn.setAttribute("href", toProfile);
      try { window.location.href = toProfile; } catch {}
      return;
    } catch {
      // Fallback to login
      accountBtn.setAttribute("href", toLogin);
      try { window.location.href = toLogin; } catch {}
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

  // Auth UI (giữ như cũ nếu bạn đang dùng)
  btnLogout?.addEventListener("click", async () => {
    await apiLogoutUser();
    await refreshCurrentUser();
  });

  // Auth Modal
  bindAuthModal();

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

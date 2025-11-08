// js/cart-page.js — Trang Giỏ hàng độc lập
import { $, money } from "./utils.js";
import {
  loadCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  addToCart,
} from "./cart.js";
import { apiGetProductById, apiListProducts } from "./api.js";
import { openCheckoutModal } from "./checkout.js";

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
}

let selectedIds = new Set();
let openSimilarPanels = new Set();
let currentPmPid = null; // sản phẩm đang mở trong modal (để refresh reviews)
let userModifiedSelection = false; // đánh dấu người dùng đã thao tác chọn/bỏ chọn

function loadOpenPanels() {
  try {
    const arr = JSON.parse(
      localStorage.getItem("vvv_cart_similar_open") || "[]"
    );
    openSimilarPanels = new Set((arr || []).map(String));
  } catch {
    openSimilarPanels = new Set();
  }
}
function saveOpenPanels() {
  try {
    localStorage.setItem(
      "vvv_cart_similar_open",
      JSON.stringify(Array.from(openSimilarPanels))
    );
  } catch {}
}

// ---- Product Detail Modal (for Cart page) ----
function ensureProductModal() {
  let el = document.getElementById("productModal");
  if (!el) {
    el = document.createElement("section");
    el.id = "productModal";
    el.className = "modal";
    el.hidden = true;
    el.innerHTML = `<div class="modal__overlay" id="productOverlay"></div><div class="modal__panel"><header class="modal__head"><h3 id="pmTitle">Chi tiết sản phẩm</h3><button class="btn btn--icon" id="pmClose">✕</button></header><div class="pm-body"><div class="pm-thumb" id="pmThumb">🛒</div><div class="pm-info"><div class="pm-name" id="pmName"></div><div class="rating pm-rating" id="pmRating" aria-label="Đánh giá"></div><div class="pm-price" id="pmPrice"></div><p class="pm-desc" id="pmDesc"></p><div class="pm-reviews" id="pmReviews" aria-live="polite"></div><label class="pm-qty">SL: <input id="pmQty" type="number" min="1" step="1" value="1" /></label><button class="btn btn--pri" id="pmAdd">Thêm vào giỏ</button></div></div></div>`;
    document.body.appendChild(el);
    document
      .getElementById("pmClose")
      ?.addEventListener("click", closeProductModal);
    document
      .getElementById("productOverlay")
      ?.addEventListener("click", closeProductModal);
    document.addEventListener("keydown", (e) => {
      if (!el.hidden && e.key === "Escape") closeProductModal();
    });
  }
  return el;
}

// Helpers (stars + reviews) giống trang chính
function sanitizeInline(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function renderStars(n) {
  const val = Math.max(0, Math.min(5, Number(n) || 0));
  return Array.from({ length: 5 }, (_, i) => (i < val ? "★" : "☆")).join("");
}
function renderPmReviews(productId) {
  const cont = document.getElementById("pmReviews");
  if (!cont) return;
  const all = (window.VVVReviews?.Local?.getAll?.() || []).filter(
    (r) => String(r.productId) === String(productId)
  );
  let data = all;
  if (!data.length) {
    const sampleComments = [
      "Giá tốt, sản phẩm đúng mô tả.",
      "Đóng gói cẩn thận, giao nhanh.",
      "Tươi ngon, rất hài lòng.",
    ];
    data = sampleComments.map((c, i) => ({ rating: 4 - (i % 2), comment: c }));
  }
  const avg = Math.round(
    data.reduce((s, r) => s + (Number(r.rating) || 0), 0) / data.length
  );
  const avgStars = renderStars(avg);

  const renderItems = (arr) =>
    arr
      .map((r) => {
        const short = sanitizeInline(
          String(r.comment || "")
            .trim()
            .slice(0, 160)
        );
        return `<li><span class="pm-reviews__stars" aria-label="${
          r.rating
        } sao">${renderStars(
          r.rating
        )}</span> <span class="pm-reviews__comment">${short}</span></li>`;
      })
      .join("");

  const initial = data.slice().reverse().slice(0, 3);
  const hasMore = data.length > 3;

  cont.innerHTML = `
    <div class="pm-reviews__header">
      <strong>Đánh giá</strong>
      <span class="pm-reviews__stars" aria-label="${avg} sao">${avgStars}</span>
      <span class="pm-reviews__count">(${data.length})</span>
    </div>
    <ul class="pm-reviews__list" id="pmReviewsList">${renderItems(initial)}</ul>
    ${
      hasMore
        ? `<button type="button" class="pm-reviews__show-more" id="pmShowMoreBtn">Xem thêm đánh giá (${
            data.length - 3
          })</button>`
        : ""
    }
  `;

  if (hasMore) {
    const btn = document.getElementById("pmShowMoreBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        const listEl = document.getElementById("pmReviewsList");
        if (listEl) listEl.innerHTML = renderItems(data.slice().reverse());
        btn.style.display = "none";
      });
    }
  }

  const pmRatingEl = document.getElementById("pmRating");
  if (pmRatingEl) pmRatingEl.textContent = avgStars;
}

async function openProductModal(productId) {
  const modal = ensureProductModal();
  const p = await apiGetProductById(productId);
  if (!p) return;
  currentPmPid = p.id;
  const { getFlashEffectivePrice } = await import("./utils.js");
  const eff = getFlashEffectivePrice ? getFlashEffectivePrice(p) : p.price;
  const nameEl = document.getElementById("pmName");
  const priceEl = document.getElementById("pmPrice");
  const descEl = document.getElementById("pmDesc");
  const thumbEl = document.getElementById("pmThumb");
  const qtyEl = document.getElementById("pmQty");
  const addBtn = document.getElementById("pmAdd");
  if (nameEl) nameEl.textContent = p.name;
  // Rating sao giống trang chính (lưu vào localStorage)
  let ratingMap = {};
  try {
    ratingMap = JSON.parse(localStorage.getItem("vvv_rating") || "{}");
  } catch {}
  if (!ratingMap[p.id]) {
    ratingMap[p.id] = Math.max(
      1,
      Math.min(5, Math.floor(Math.random() * 5) + 1)
    );
    try {
      localStorage.setItem("vvv_rating", JSON.stringify(ratingMap));
    } catch {}
  }
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < (ratingMap[p.id] || 1) ? "★" : "☆"
  ).join("");
  const pmRatingEl = document.getElementById("pmRating");
  if (pmRatingEl) pmRatingEl.textContent = stars;
  if (priceEl) priceEl.textContent = `${money(eff)}`;
  if (descEl)
    descEl.textContent =
      p.desc || "Sản phẩm tươi ngon, giao nhanh trong ngày. (Mô tả demo)";
  if (thumbEl) {
    thumbEl.innerHTML = p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:160px;height:160px;object-fit:cover;border-radius:12px;" />`
      : p.emoji || "🛒";
  }
  if (qtyEl) qtyEl.value = "1";
  if (addBtn) {
    addBtn.onclick = () => {
      const qty = Math.max(1, parseInt(qtyEl?.value || "1", 10));
      addToCart(p.id, qty);
      closeProductModal();
      // Refresh cart render to reflect added quantity
      renderCartPage();
    };
  }
  try {
    renderPmReviews(p.id);
  } catch {}
  modal.hidden = false;
}

// ========== Similar products below a cart line ==========
function ensureSimilarStyles() {
  if (document.getElementById("similarStyles")) return;
  const style = document.createElement("style");
  style.id = "similarStyles";
  style.textContent = `
    .similar-panel{margin:8px 0 16px 0; border:1px solid #f0c08a; background:#fffaf3; border-radius:12px;}
    .similar-panel__inner{padding:12px 16px 16px;}
    .similar-header{font-weight:600; color:#e67e22; margin-bottom:10px;}
    .similar-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:12px; align-items:stretch;}
    .sim-card{display:flex; flex-direction:column; gap:6px; background:#fff; border:1px solid #eee; border-radius:10px; padding:8px; cursor:pointer; height:100%;}
    .sim-thumb{width:100%; height:100px;}
    .sim-thumb img{width:100%; height:100%; object-fit:contain; border-radius:8px;}
    .sim-name{font-size:13px; font-weight:500; line-height:1.35; min-height:36px;}
    .sim-stars{font-size:14px; color:#f1b41a; line-height:1; letter-spacing:1px;}
    .sim-price{font-weight:600; color:#333; margin-top:auto;}
    .sim-muted{opacity:.6;}
  `;
  document.head.appendChild(style);
}

async function toggleSimilarBelow(pid, lineEl, mode = "toggle") {
  const existing = document.getElementById("similar-" + pid);
  if (mode === "close" || (mode === "toggle" && existing)) {
    if (existing) existing.remove();
    openSimilarPanels.delete(String(pid));
    saveOpenPanels();
    return;
  }
  const p = await apiGetProductById(pid);
  if (!p) return;
  ensureSimilarStyles();
  const { money, getFlashEffectivePrice } = await import("./utils.js");
  const all = await apiListProducts();
  let sims = all.filter(
    (sp) => sp.id !== pid && sp.cat === p.cat && sp.sub === p.sub
  );
  if (sims.length < 4) {
    const more = all.filter(
      (sp) => sp.id !== pid && sp.cat === p.cat && sp.sub !== p.sub
    );
    sims = sims.concat(more);
  }
  sims = sims.slice(0, 6);
  const gridHtml = sims
    .map((sp) => {
      const eff = getFlashEffectivePrice
        ? getFlashEffectivePrice(sp)
        : sp.price;
      const img = sp.image || "../images/brand/LogoVVV.png";
      // Average star rating: from reviews if available, fallback to local rating map
      let avg = 0;
      try {
        const reviews = (window.VVVReviews?.Local?.getAll?.() || []).filter(
          (r) => String(r.productId) === String(sp.id)
        );
        if (reviews.length)
          avg = Math.round(
            reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) /
              reviews.length
          );
      } catch {}
      if (!avg) {
        let ratingMap = {};
        try {
          ratingMap = JSON.parse(localStorage.getItem("vvv_rating") || "{}");
        } catch {}
        if (!ratingMap[sp.id]) {
          ratingMap[sp.id] = Math.max(
            1,
            Math.min(5, Math.floor(Math.random() * 5) + 1)
          );
          try {
            localStorage.setItem("vvv_rating", JSON.stringify(ratingMap));
          } catch {}
        }
        avg = ratingMap[sp.id] || 4;
      }
      const stars = renderStars(avg);
      return `
      <div class="sim-card" data-id="${sp.id}">
        <div class="sim-thumb"><img src="${img}" alt="${sanitizeInline(
        sp.name
      )}" onerror="this.onerror=null; this.src='../images/brand/LogoVVV.png';" /></div>
        <div class="sim-name">${sanitizeInline(sp.name)}</div>
        <div class="sim-stars" aria-label="${avg} sao">${stars}</div>
        <div class="sim-price">${money(eff)}</div>
      </div>
    `;
    })
    .join("");
  const panel = document.createElement("div");
  panel.id = "similar-" + pid;
  panel.className = "similar-panel";
  panel.innerHTML = `<div class="similar-panel__inner">
    <div class="similar-header">Sản phẩm tương tự</div>
    <div class="similar-grid">${gridHtml}</div>
  </div>`;
  lineEl.insertAdjacentElement("afterend", panel);
  openSimilarPanels.add(String(pid));
  saveOpenPanels();
}

function closeProductModal() {
  const el = ensureProductModal();
  el.hidden = true;
  currentPmPid = null;
}

// Khi lưu đánh giá, nếu modal đang mở cho đúng sản phẩm, refresh danh sách
document.addEventListener("vvv:review_saved", (e) => {
  try {
    const d = e.detail;
    if (!d) return;
    if (currentPmPid && String(d.productId) === String(currentPmPid)) {
      renderPmReviews(currentPmPid);
    }
  } catch {}
});

async function renderCartPage() {
  const body = $("#cartPageBody");
  const subEl = $("#cartPageSubtotal");
  const selAllEl = document.getElementById("cartSelectAll");
  if (!body || !subEl) return;

  const entries = Object.entries(getCart()).filter(([, q]) => q > 0);
  if (!entries.length) {
    body.innerHTML = `<p class="muted">Giỏ hàng đang trống.</p>`;
    subEl.textContent = money(0);
    updateBadge(0);
    selAllEl && (selAllEl.checked = false);
    return;
  }

  const ids = entries.map(([pid]) => pid);
  const products = await Promise.all(ids.map((id) => apiGetProductById(id)));
  const map = {};
  for (const p of products) if (p && p.id) map[p.id] = p;

  const { getFlashEffectivePrice } = await import("./utils.js");
  // Mặc định chọn tất cả chỉ khi người dùng chưa thao tác
  if (!userModifiedSelection && selectedIds.size === 0) {
    entries.forEach(([pid]) => selectedIds.add(String(pid)));
  }
  const lines = entries
    .map(([pid, qty]) => {
      const p = map[pid];
      if (!p) return "";
      const effPrice = getFlashEffectivePrice
        ? getFlashEffectivePrice(p)
        : p.price;
      const showOrig = Number(effPrice) !== Number(p.price);
      const effText = `${money(effPrice)}`;
      const origText = showOrig ? `${money(p.price)}` : "";
      const img = p.image || "../images/brand/LogoVVV.png";
      const isChecked = selectedIds.has(String(p.id)) ? "checked" : "";
      return `
      <div class="cart-line" data-id="${
        p.id
      }" style="display:grid; grid-template-columns: 28px 64px 180px 120px 110px 120px 110px minmax(180px, 1fr); align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #eee;">
        <div class="sel" style="text-align:center;">
          <input type="checkbox" data-action="select" ${isChecked} />
        </div>
        <div class="thumb"><img src="${img}" alt="${
        p.name
      }" style="width:64px; height:64px; object-fit:cover; border-radius:6px;" onerror="this.onerror=null; this.src='../images/brand/LogoVVV.png';" /></div>
        <div class="meta" style="display:flex; flex-direction:column; gap:6px; justify-content:flex-start; align-items:flex-start;">
          <div class="cart-name" style="display:block; font-weight:600; text-align:left; font-size:14px; line-height:1.35; max-width:180px; white-space:normal; word-break:break-word; hyphens:auto; overflow:visible;">${
            p.name
          }</div>
        </div>
        <div class="price-sale" style="text-align:right; font-weight:600; padding-left:4px; white-space:nowrap;">${effText}</div>
        <div class="price-orig" style="text-align:right; color:#555; opacity:.6; white-space:nowrap; padding-right:12px; ${
          showOrig ? "text-decoration:line-through;" : "visibility:hidden;"
        }">${origText}</div>
        <div class="qty" style="display:flex; align-items:center; gap:6px; justify-content:center;">
          <button class="btn" data-action="dec" aria-label="Giảm" style="width:28px; height:28px; border-radius:8px; background:#f2f3f5;">−</button>
          <input id="qty-${
            p.id
          }" type="number" min="1" step="1" inputmode="numeric" pattern="[0-9]*" value="${qty}" data-action="qty" style="width:48px; text-align:center;" />
          <button class="btn" data-action="inc" aria-label="Tăng" style="width:28px; height:28px; border-radius:8px; background:#f2f3f5;">+</button>
        </div>
        <div class="line-total" style="text-align:right; font-weight:600; padding-right:8px; white-space:nowrap; pointer-events:none;">${money(
          effPrice * qty
        )}</div>
        <div class="actions-col" style="text-align:right; display:flex; justify-content:flex-end; gap:6px; padding-left:8px; padding-right:0; flex-wrap:nowrap; white-space:nowrap; position:relative; z-index:1;">
          <button class="btn btn--link" data-action="remove" style="color:#c0392b; background:#fef2f2; border-radius:8px; padding:4px 10px; font-size:13px; cursor:pointer;">Xóa</button>
          <button class="btn btn--link" type="button" data-action="similar" style="color:#e67e22; background:#fff5e6; border-radius:8px; padding:4px 10px; font-size:13px; cursor:pointer;">Tìm sản phẩm tương tự</button>
        </div>
      </div>`;
    })
    .join("");
  body.innerHTML = lines;
  // Re-open any previously opened similar panels after rerender
  try {
    for (const pid of openSimilarPanels) {
      const lineEl = body.querySelector(`.cart-line[data-id="${pid}"]`);
      if (lineEl) await toggleSimilarBelow(pid, lineEl, "open");
    }
  } catch {}

  const subtotal = entries.reduce((s, [pid, q]) => {
    const p = map[pid];
    const eff = p
      ? getFlashEffectivePrice
        ? getFlashEffectivePrice(p)
        : p.price
      : 0;
    const sel = selectedIds.has(String(pid));
    return sel ? s + eff * q : s;
  }, 0);
  subEl.textContent = money(subtotal);
  updateBadge(entries.reduce((s, [, q]) => s + q, 0));
  selAllEl &&
    (selAllEl.checked = entries.every(([pid]) => selectedIds.has(String(pid))));
}

function updateBadge(count) {
  const b = document.getElementById("cartBadge");
  if (b) b.textContent = String(count);
}

function bindCartPage() {
  const body = document.getElementById("cartPageBody");
  const btnCheckout = document.getElementById("btnCheckout");
  const btnClear = document.getElementById("btnClearCart");
  const selAllEl = document.getElementById("cartSelectAll");

  body?.addEventListener("input", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.dataset.action === "qty") {
      const line = t.closest(".cart-line");
      const pid = line?.dataset?.id;
      if (pid) updateCartQuantity(pid, t.value);
    }
  });
  body?.addEventListener("click", (e) => {
    const rootEl = e.target instanceof HTMLElement ? e.target : null;
    // Clicking on a similar product card opens its detail modal
    const simCard = rootEl ? rootEl.closest(".sim-card") : null;
    if (simCard && simCard instanceof HTMLElement) {
      const sid = simCard.dataset.id;
      if (sid) {
        openProductModal(sid);
        return;
      }
    }
    const line = rootEl ? rootEl.closest(".cart-line") : null;
    const pid = line?.dataset?.id;
    if (!pid) return;
    // Open product detail when clicking image or name
    if (rootEl.closest(".thumb") || rootEl.closest(".cart-name")) {
      openProductModal(pid);
      return;
    }
    const btn = rootEl ? rootEl.closest("button[data-action]") : null;
    if (!btn) return;
    if (btn.dataset.action === "remove") {
      removeFromCart(pid);
      openSimilarPanels.delete(String(pid));
      saveOpenPanels();
    }
    if (btn.dataset.action === "dec") {
      const input = line?.querySelector('input[data-action="qty"]');
      const cur = Number(input?.value || 1);
      updateCartQuantity(pid, Math.max(1, cur - 1));
    }
    if (btn.dataset.action === "inc") {
      const input = line?.querySelector('input[data-action="qty"]');
      const cur = Number(input?.value || 1);
      updateCartQuantity(pid, cur + 1);
    }
    if (btn.dataset.action === "similar") {
      toggleSimilarBelow(pid, line, "toggle");
    }
  });
  body?.addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.dataset.action === "select") {
      userModifiedSelection = true;
      const line = t.closest(".cart-line");
      const pid = line?.dataset?.id;
      if (!pid) return;
      if (t.checked) selectedIds.add(String(pid));
      else selectedIds.delete(String(pid));
      renderCartPage();
    }
  });

  btnClear?.addEventListener("click", () => {
    clearCart();
    openSimilarPanels.clear();
    saveOpenPanels();
  });
  btnCheckout?.addEventListener("click", () => openCheckoutModal());

  document.addEventListener("cart:changed", () => {
    // Reopen panels after any cart change
    renderCartPage();
  });
  selAllEl?.addEventListener("change", () => {
    userModifiedSelection = true;
    const checked = !!selAllEl.checked;
    const ids = Object.entries(getCart())
      .filter(([, q]) => q > 0)
      .map(([pid]) => String(pid));
    selectedIds = new Set(checked ? ids : []);
    renderCartPage();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  loadCart();
  loadOpenPanels();
  setYear();
  bindCartPage();
  await renderCartPage();
});

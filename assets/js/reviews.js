// Vựa Vui Vẻ – Reviews (Đánh giá sản phẩm trong đơn hàng)
// Thuần JS, có chú thích ngắn gọn. Lưu tạm bằng localStorage.

const STORAGE_KEY = 'vvv_reviews';

// ===== Utils =====
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function sanitizeComment(input) {
  let s = String(input || '').trim();
  s = s.replace(/\s+/g, ' ');
  // loại bỏ thẻ script đơn giản
  s = s.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
  // giới hạn 500 ký tự
  s = s.slice(0, 500);
  return s;
}
function nowISO() { return new Date().toISOString(); }

// ===== Local storage layer =====
const Local = {
  getAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  },
  saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list || [])); } catch {}
  },
  get(orderId, productId) {
    return (Local.getAll() || []).find(r => r.orderId === orderId && r.productId === productId) || null;
  },
  post(review) {
    const all = Local.getAll();
    const idx = all.findIndex(r => r.orderId === review.orderId && r.productId === review.productId);
    const ts = nowISO();
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...review, updatedAt: ts };
    } else {
      all.push({ ...review, createdAt: ts, updatedAt: ts });
    }
    Local.saveAll(all);
    return Local.get(review.orderId, review.productId);
  },
  delete(orderId, productId) {
    const all = Local.getAll().filter(r => !(r.orderId === orderId && r.productId === productId));
    Local.saveAll(all);
  },
  getByOrder(orderId) { return Local.getAll().filter(r => r.orderId === orderId); }
};

// ===== Remote (stub) =====
const Remote = {
  async postReview(review) {
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(review) });
      return await res.json();
    } catch { return { ok: false }; }
  },
  async getReviewsByOrder(orderId) {
    try {
      const res = await fetch(`/api/reviews?orderId=${encodeURIComponent(orderId)}`);
      return await res.json();
    } catch { return []; }
  }
};

// ===== Modal =====
let reviewModalEl = null;
let activeContext = null; // { orderId, productId, productName }

function ensureReviewModal() {
  if (reviewModalEl) return reviewModalEl;
  const m = document.createElement('section');
  m.id = 'vvvReviewModal';
  m.className = 'vvv-modal';
  m.hidden = true;
  m.innerHTML = `
    <div class="vvv-modal__overlay" id="vvvReviewOverlay"></div>
    <div class="vvv-modal__panel" role="dialog" aria-modal="true" aria-labelledby="vvvReviewTitle">
      <header class="vvv-modal__head">
        <h3 id="vvvReviewTitle">Đánh giá sản phẩm: <span id="vvvProductName"></span></h3>
        <button class="vvv-btn vvv-btn--icon" id="vvvCloseBtn" aria-label="Đóng">✕</button>
      </header>
      <div class="vvv-modal__product" id="vvvProductInfo"></div>
      <form class="vvv-modal__body" id="vvvReviewForm">
        <div class="vvv-form-row">
          <label class="vvv-label">Chọn số sao</label>
          <div class="vvv-stars" id="vvvStars" role="radiogroup" aria-label="Chọn số sao">
            ${[1,2,3,4,5].map(n => `<button type="button" class="vvv-star" data-value="${n}" title="${n} sao" aria-label="${n} sao" aria-checked="false">☆</button>`).join('')}
          </div>
          <div class="vvv-error" id="vvvRatingError" aria-live="polite"></div>
        </div>
        <div class="vvv-form-row">
          <label for="vvvComment" class="vvv-label">Nhận xét (tối thiểu 10 ký tự)</label>
          <textarea id="vvvComment" class="vvv-textarea" rows="4" maxlength="500" placeholder="Viết cảm nhận của bạn..."></textarea>
          <div class="vvv-error" id="vvvCommentError" aria-live="polite"></div>
        </div>
        <div class="vvv-modal__actions">
          <button type="submit" class="vvv-btn vvv-btn--save">Lưu</button>
          <button type="button" class="vvv-btn vvv-btn--cancel" id="vvvCancelBtn">Hủy</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(m);
  // Basic events
  const overlay = m.querySelector('#vvvReviewOverlay');
  const closeBtn = m.querySelector('#vvvCloseBtn');
  overlay.addEventListener('click', closeReviewModal);
  closeBtn.addEventListener('click', closeReviewModal);
  document.addEventListener('keydown', (e) => {
    if (!m.hidden && e.key === 'Escape') closeReviewModal();
  });
  // Submit
  m.querySelector('#vvvReviewForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const rating = getSelectedRating();
    const commentRaw = m.querySelector('#vvvComment').value;
    const comment = sanitizeComment(commentRaw);
    let ok = true;
    const ratingErr = m.querySelector('#vvvRatingError');
    const commentErr = m.querySelector('#vvvCommentError');
    ratingErr.textContent = '';
    commentErr.textContent = '';
    if (!rating) { ratingErr.textContent = 'Vui lòng chọn số sao.'; ok = false; }
    if (!comment || comment.trim().length < 10) { commentErr.textContent = 'Nhận xét tối thiểu 10 ký tự.'; ok = false; }
    if (!ok) return;
    saveReview({ orderId: activeContext.orderId, productId: activeContext.productId, rating, comment });
    closeReviewModal();
  });
  // Cancel
  m.querySelector('#vvvCancelBtn').addEventListener('click', (e) => { e.preventDefault(); closeReviewModal(); });
  // Stars interactions
  const stars = m.querySelectorAll('.vvv-star');
  stars.forEach((btn) => {
    btn.addEventListener('mouseenter', () => paintStars(btn.dataset.value));
    btn.addEventListener('mouseleave', () => paintStars(getSelectedRating()));
    btn.addEventListener('click', () => selectStars(btn.dataset.value));
    btn.addEventListener('keydown', (e) => {
      const val = Number(btn.dataset.value);
      if (e.key === 'ArrowRight') { e.preventDefault(); selectStars(Math.min(5, val + 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectStars(Math.max(1, val - 1)); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectStars(val); }
    });
  });
  reviewModalEl = m;
  return m;
}

function paintStars(n) {
  const val = Number(n) || 0;
  const stars = reviewModalEl.querySelectorAll('.vvv-star');
  stars.forEach((b, i) => { b.textContent = (i < val) ? '★' : '☆'; });
}
function selectStars(n) {
  const val = Number(n) || 0;
  const stars = reviewModalEl.querySelectorAll('.vvv-star');
  stars.forEach((b, i) => {
    const checked = i < val;
    b.setAttribute('aria-checked', checked ? 'true' : 'false');
    b.textContent = checked ? '★' : '☆';
    if (i === val - 1) b.focus();
  });
}
function getSelectedRating() {
  const stars = reviewModalEl.querySelectorAll('.vvv-star');
  let r = 0;
  stars.forEach((b, i) => { if (b.getAttribute('aria-checked') === 'true') r = i + 1; });
  return r;
}

function openReviewModal({ orderId, productId, productName, productThumb, productPrice, productQty }) {
  const m = ensureReviewModal();
  activeContext = { orderId, productId, productName, productThumb, productPrice, productQty };
  m.querySelector('#vvvProductName').textContent = productName || productId || '';
  const info = m.querySelector('#vvvProductInfo');
  info.innerHTML = `
    ${productThumb || ''}
    <div class="vvv-p-details">
      <div class="vvv-p-name">${escapeHtml(productName || '')}</div>
      ${productPrice ? `<div class="vvv-p-meta">Giá: ${productPrice}</div>` : ''}
      ${productQty ? `<div class="vvv-p-meta">SL: ${escapeHtml(String(productQty))}</div>` : ''}
    </div>
  `;
  m.hidden = false;
  // Prefill if existing
  const prev = Local.get(orderId, productId);
  const commentEl = m.querySelector('#vvvComment');
  commentEl.value = prev?.comment || '';
  selectStars(prev?.rating || 0);
  paintStars(prev?.rating || 0);
  // Focus trap – focus first star
  const firstStar = m.querySelector('.vvv-star');
  firstStar && firstStar.focus();
}
function closeReviewModal() {
  if (!reviewModalEl) return;
  reviewModalEl.hidden = true;
  activeContext = null;
}

// ===== Public Data APIs =====
function getReview(orderId, productId) { return Local.get(orderId, productId); }
function deleteReview(orderId, productId) {
  Local.delete(orderId, productId);
  // rerender summary if present
  const item = document.querySelector(`.oc-item[data-order-id="${orderId}"][data-product-id="${productId}"]`);
  const cont = item ? item.querySelector('.vvv-review-summary') : null;
  if (cont) renderReviewSummary(cont, null, { orderId, productId });
}
function saveReview({ orderId, productId, rating, comment }) {
  const review = {
    orderId,
    productId,
    rating: Number(rating) || 0,
    comment: sanitizeComment(comment),
  };
  const saved = Local.post(review);
  // Update summary UI
  const item = document.querySelector(`.oc-item[data-order-id="${orderId}"][data-product-id="${productId}"]`);
  const cont = item ? item.querySelector('.vvv-review-summary') : null;
  if (cont) renderReviewSummary(cont, saved, { orderId, productId });
  // fire event for external observers
  document.dispatchEvent(new CustomEvent('vvv:review_saved', { detail: saved }));
  return saved;
}

// ===== Summary UI =====
function renderStarsCompact(n) {
  const val = Number(n) || 0;
  return '★★★★★'.slice(0, val) + '☆☆☆☆☆'.slice(0, 5 - val);
}
function renderReviewSummary(containerEl, review, ctx) {
  if (!containerEl) return;
  if (!review) {
    containerEl.innerHTML = `<span class="vvv-muted">Chưa có đánh giá</span>`;
    return;
  }
  const short = escapeHtml(String(review.comment || ''));
  containerEl.innerHTML = `
    <span class="vvv-stars--compact" aria-label="${review.rating} sao">${renderStarsCompact(review.rating)}</span>
    <span class="vvv-comment">${short}</span>
    <span class="vvv-actions">
      <button type="button" class="vvv-link" data-action="edit">Sửa</button>
      <button type="button" class="vvv-link" data-action="delete">Xoá</button>
    </span>`;
  containerEl.__ctx = ctx || { orderId: review.orderId, productId: review.productId };
}

// ===== Init & Bind =====
function bindSummaryActions(root) {
  root.addEventListener('click', (e) => {
    const edit = e.target.closest('.vvv-review-summary .vvv-link[data-action="edit"]');
    const del = e.target.closest('.vvv-review-summary .vvv-link[data-action="delete"]');
    if (edit) {
      const cont = edit.closest('.vvv-review-summary');
      const ctx = cont?.__ctx;
      const item = cont?.closest('.oc-item');
      const pn = item?.getAttribute('data-product-name') || '';
      const thumb = item?.querySelector('.oc-thumb')?.outerHTML || '';
      const price = item?.getAttribute('data-product-price') || '';
      const qty = item?.getAttribute('data-product-qty') || '';
      openReviewModal({ orderId: ctx.orderId, productId: ctx.productId, productName: pn, productThumb: thumb, productPrice: price, productQty: qty });
    }
    if (del) {
      const cont = del.closest('.vvv-review-summary');
      const ctx = cont?.__ctx;
      if (ctx) deleteReview(ctx.orderId, ctx.productId);
    }
  });
}

function initReviews({ rootSelector } = {}) {
  const root = typeof rootSelector === 'string' ? document.querySelector(rootSelector) : rootSelector;
  if (!root) return;
  // Gắn vào từng item sản phẩm trong modal chi tiết đơn (oc-item)
  const items = root.querySelectorAll('.oc-item[data-order-id][data-product-id]');
  items.forEach((item) => {
    if (item.__vvvBound) return;
    item.__vvvBound = true;
    const orderId = item.getAttribute('data-order-id');
    const productId = item.getAttribute('data-product-id');
    const productName = item.getAttribute('data-product-name');
    // Ensure summary container
    let summary = item.querySelector('.vvv-review-summary');
    if (!summary) {
      summary = document.createElement('div');
      summary.className = 'vvv-review-summary';
      // append beside button row if exists, else into main
      const main = item.querySelector('.oc-item__main') || item;
      main.appendChild(summary);
    }
    // Review button
    let btn = item.querySelector('.vvv-review-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn vvv-review-btn';
      btn.textContent = 'Đánh giá';
      const main = item.querySelector('.oc-item__main') || item;
      const row = document.createElement('div');
      row.className = 'vvv-review-row';
      row.appendChild(summary);
      row.appendChild(btn);
      main.appendChild(row);
    }
    btn.addEventListener('click', () => {
      const thumb = item.querySelector('.oc-thumb')?.outerHTML || '';
      const price = item.getAttribute('data-product-price') || '';
      const qty = item.getAttribute('data-product-qty') || '';
      openReviewModal({ orderId, productId, productName, productThumb: thumb, productPrice: price, productQty: qty });
    });
    // Render existing summary
    const rev = Local.get(orderId, productId);
    renderReviewSummary(summary, rev, { orderId, productId });
  });
  bindSummaryActions(root);
}

// Tự động nghe sự kiện khi modal chi tiết đơn render xong
document.addEventListener('vvv:order_details_rendered', () => {
  initReviews({ rootSelector: '#orderConfirmModal' });
});

// Gắn vào window để có thể gọi từ nơi khác nếu cần
window.initReviews = initReviews;
window.openReviewModal = openReviewModal;
window.saveReview = saveReview;
window.getReview = getReview;
window.deleteReview = deleteReview;
window.renderReviewSummary = renderReviewSummary;
window.VVVReviews = { initReviews, openReviewModal, saveReview, getReview, deleteReview, renderReviewSummary, Local, Remote };
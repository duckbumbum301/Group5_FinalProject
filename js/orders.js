// js/orders.js — Tách logic Orders thành module
import { money } from './utils.js';
import { apiListOrders, apiGetProductById, apiReturnOrder, apiCurrentUser } from './api.js';
import { addToCart } from './cart.js';
import { openCart } from './ui.js';

function ensureOrdersModal() {
  return document.getElementById('ordersModal');
}
function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN');
  } catch {
    return iso;
  }
}

// === Tracking helpers ===
function computeDerivedTracking(order) {
  const base = (order.tracking && Array.isArray(order.tracking))
    ? order.tracking.map(s => ({ ...s }))
    : [
        { code: 'placed', label: 'Đã đặt hàng', at: order.created_at },
        { code: 'preparing', label: 'Đang chuẩn bị', at: null },
        { code: 'ready', label: 'Sẵn sàng giao', at: null },
        { code: 'pickup', label: 'Shipper đã nhận', at: null },
        { code: 'delivering', label: 'Đang giao', at: null },
        { code: 'delivered', label: 'Giao thành công', at: null },
      ];
  try {
    // Nếu đơn đã hủy, không tự động điền thời gian cho các bước.
    const hasCancelled = base.some((s) => s.code === 'cancelled');
    if (!hasCancelled) {
      const created = new Date(order.created_at).getTime();
      const mins = Math.floor((Date.now() - created) / 60000);
      const offsets = [0, 1, 5, 10, 15, 25];
      base.forEach((s, i) => {
        if (mins >= offsets[i] && !s.at) {
          s.at = new Date(created + offsets[i] * 60000).toISOString();
        }
      });
    }
  } catch {}
  return base;
}
// Trạng thái giao hiện tại (label của bước đã hoàn thành cuối cùng)
function currentDeliveryLabel(order) {
  const steps = computeDerivedTracking(order);
  const done = steps.filter((s) => !!s.at);
  return done.length ? done[done.length - 1].label : 'Chờ xử lý';
}
function buildTimeline(order) {
  const steps = computeDerivedTracking(order);
  return `<div class="timeline">${steps
    .map((s) => {
      const done = !!s.at;
      const time = s.at ? fmtDate(s.at) : '';
      return `<div class="step ${done ? 'done' : ''}">\n        <div class="dot"></div>\n        <div class="label">${s.label}${time ? `<div class=\"time muted\">${time}</div>` : ''}</div>\n      </div>`;
    })
    .join('')}</div>`;
}

function filterOrdersByUser(list, user) {
  if (!user) return [];
  const email = (user.email || '').toLowerCase();
  const phone = user.phone || '';
  return (list || []).filter((o) => {
    const ue = (o.user?.email || '').toLowerCase();
    const up = o.user?.phone || '';
    return (email && ue && ue === email) || (phone && up && up === phone);
  });
}

export async function openOrdersModal() {
  const modal = ensureOrdersModal();
  const body = document.getElementById('ordersBody');
  const cur = await apiCurrentUser();
  if (!cur) {
    body.innerHTML = `<p class="muted">Bạn cần đăng nhập để xem đơn hàng.</p>`;
    modal.hidden = false;
    document.getElementById('ordersCloseBtn')?.addEventListener('click', closeOrdersModal, { once: true });
    document.getElementById('ordersOverlay')?.addEventListener('click', closeOrdersModal, { once: true });
    document.addEventListener('keydown', escOrdersOnce);
    return;
  }

  const all = await apiListOrders();
  const data = filterOrdersByUser(all, cur);

  if (!data || !data.length) {
    body.innerHTML = `<p class="muted">Bạn chưa có đơn hàng nào.</p>`;
  } else {
    const html = await Promise.all(
      data
        .slice()
        .reverse()
        .map(async (o) => {
          const entries = Object.entries(o.items || {}).filter(([, q]) => q > 0);
          const ids = entries.map(([pid]) => pid);
          const products = await Promise.all(ids.map((id) => apiGetProductById(id)));
          const map = {}; for (const p of products) if (p && p.id) map[p.id] = p;
          const itemsHtml = entries
            .map(([pid, q]) => {
              const p = map[pid];
              return p ? `• ${p.name} × ${q}` : `• ${pid} × ${q}`;
            })
            .join('<br>');
          return `
        <div class="order-card">
          <div class="order-head">
            <div><strong>Mã đơn:</strong> ${o.id}</div>
            <div class="muted">${fmtDate(o.created_at)}</div>
          </div>
          <div class="muted">Thanh toán: ${o.payment || 'COD'} · TT: ${o.payment_status || 'pending'} · Giao: ${currentDeliveryLabel(o)} · Khung giờ: ${o.slot || '-'}</div>
          <div class="order-items">${itemsHtml || '(Không có mục hàng)'}</div>
          <div style="margin-top:8px;">
            <span class="muted">Tạm tính:</span> ${money(o.subtotal || 0)} · 
            <span class="muted">Giảm:</span> ${money(o.discount || 0)} · 
            <span class="muted">Ship:</span> ${money(o.shipping_fee || 0)} · 
            <span class="order-total">Tổng: ${money(o.total || 0)}</span>
          </div>
          ${buildTimeline(o)}
        </div>`;
        })
    );
    body.innerHTML = html.join('');
  }

  document.getElementById('ordersCloseBtn')?.addEventListener('click', closeOrdersModal, { once: true });
  document.getElementById('ordersOverlay')?.addEventListener('click', closeOrdersModal, { once: true });
  document.addEventListener('keydown', escOrdersOnce);
  modal.hidden = false;
}

export function closeOrdersModal() {
  const m = ensureOrdersModal();
  if (m) m.hidden = true;
  document.removeEventListener('keydown', escOrdersOnce);
}
function escOrdersOnce(e) {
  if (e.key === 'Escape') closeOrdersModal();
}

// Auto-open Orders được xử lý ở main.js bằng lazy-load để đảm bảo module được nạp đúng lúc.

// ====== Order Confirmation Modal ======
function ensureOrderConfirmModal() {
  let m = document.getElementById('orderConfirmModal');
  if (!m) {
    m = document.createElement('section');
    m.id = 'orderConfirmModal';
    m.className = 'modal';
    m.hidden = true;
    m.innerHTML = `
      <div id="ocOverlay" class="modal__overlay"></div>
      <div class="modal__panel">
        <header class="modal__head"><h3>Chi tiết đơn hàng</h3><div style="display:flex; gap:8px; align-items:center"><button id="ocPrintBtn" class="btn btn--outline">In/PDF</button><button id="ocCloseBtn" class="btn btn--icon">✕</button></div></header>
        <div class="modal__body" id="ocBody"></div>
      </div>`;
    document.body.appendChild(m);
  }
  return m;
}

export function openOrderConfirmModal(orderId) {
  const m = ensureOrderConfirmModal();
  const body = document.getElementById('ocBody');
  body.innerHTML = '<p class="muted">Đang tải…</p>';
  (async () => {
    const list = await apiListOrders();
    const ord = (list || []).find((x) => x.id === orderId) || (list || [])[list.length - 1];
    if (!ord) { body.innerHTML = '<p class="alert">Không tìm thấy đơn hàng.</p>'; return; }
    const entries = Object.entries(ord.items || {}).filter(([, q]) => q > 0);
    const ids = entries.map(([pid]) => pid);
    const products = await Promise.all(ids.map((id) => apiGetProductById(id)));
    const map = {}; for (const p of products) if (p && p.id) map[p.id] = p;
    const itemRows = entries.map(([pid, q]) => {
      const p = map[pid] || {};
      const price = p.price || 0;
      const line = price * q;
      const name = p.name || pid;
      const unitText = p.unit ? ` / ${p.unit}` : '';
      const thumb = p.image
        ? `<img src="${p.image}" alt="${name}" class="oc-thumb">`
        : `<div class="oc-thumb">${p.emoji || '🧺'}</div>`;
      return `
        <div class="oc-item"
          data-order-id="${ord.id}" 
          data-product-id="${pid}" 
          data-product-name="${name.replace(/"/g,'&quot;')}"
          data-product-price="${money(price)}${unitText}"
          data-product-qty="${q}"
        >
          ${thumb}
          <div class="oc-item__main">
            <div class="oc-name">${name}</div>
            <div class="muted">Giá bán: ${money(price)}${unitText}</div>
            <div class="vvv-review-row">
              <div class="vvv-review-summary"></div>
              <button type="button" class="btn vvv-review-btn">Đánh giá</button>
            </div>
          </div>
          <div class="oc-item__meta">
            <div class="oc-line">${money(line)}</div>
            <div class="muted">SL: ${q}</div>
          </div>
        </div>`;
    }).join('');
    const paid = ord.payment_status === 'paid' ? (ord.total || 0) : 0;
    const remain = Math.max(0, (ord.total || 0) - paid);
    const pmText = ord.payment === 'COD' ? 'Tiền mặt khi nhận hàng' : (ord.payment || 'Khác');
    body.innerHTML = `
      <div class="order-head">
        <div><strong>Mã đơn:</strong> ${ord.id}</div>
        <div class="muted">${fmtDate(ord.created_at)}</div>
      </div>
      <div class="oc-items">${itemRows}</div>
      <div class="oc-pay">
        <h4 class="oc-section-title">Thông tin thanh toán</h4>
        <div class="oc-row"><div>Tiền hàng</div><div>${money(ord.subtotal || 0)}</div></div>
        <div class="oc-row"><div>Phí giao hàng, phụ phí</div><div>${money(ord.shipping_fee || 0)}</div></div>
        <div class="oc-row"><div>Thanh toán</div><div>${pmText}</div></div>
        <div class="oc-row oc-total"><div>Tổng đơn</div><div>${money(ord.total || 0)}</div></div>
        <div class="oc-row"><div>Đã thanh toán</div><div>${money(paid)}</div></div>
        <div class="oc-row"><div>Còn lại</div><div>${money(remain)}</div></div>
      </div>
      <div class="oc-track">${buildTimeline(ord)}</div>
    `;
    const printBtn = document.getElementById('ocPrintBtn');
    if (printBtn) printBtn.onclick = () => printOrderDetails(ord);
    // Thông báo để reviews.js gắn sự kiện
    document.dispatchEvent(new CustomEvent('vvv:order_details_rendered', { detail: { orderId: ord.id } }));
  })();
  // Bind persistent close handlers once to ensure X works after printing
  if (!m.hasAttribute('data-bound')) {
    document.getElementById('ocOverlay')?.addEventListener('click', () => closeOrderConfirmModal());
    document.getElementById('ocCloseBtn')?.addEventListener('click', () => closeOrderConfirmModal());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !m.hidden) closeOrderConfirmModal();
    });
    m.setAttribute('data-bound','true');
  }
  m.hidden = false;
}

export function closeOrderConfirmModal() {
  const m = ensureOrderConfirmModal();
  m.hidden = true;
}

// ====== Order Success Modal ======
function ensureOrderSuccessModal() {
  let m = document.getElementById('orderSuccessModal');
  if (!m) {
    m = document.createElement('section');
    m.id = 'orderSuccessModal';
    m.className = 'modal';
    m.hidden = true;
    m.innerHTML = `
      <div id="osOverlay" class="modal__overlay"></div>
      <div class="modal__panel" role="dialog" aria-modal="true">
        <div class="modal__body" style="text-align:center; padding:24px 20px;">
          <div class="os-icon" aria-hidden="true" style="width:80px; height:80px; border-radius:999px; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; background:#65a30d; box-shadow:0 6px 16px rgba(101,163,13,.35);">
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="0" fill="#fff"></circle>
              <path d="M9.5 16.2l-3.2-3.2a1 1 0 10-1.4 1.4l4 4a1 1 0 001.4 0l8-8a1 1 0 10-1.4-1.4l-7.4 7.4z" fill="#fff"/>
            </svg>
          </div>
          <div class="os-title" style="font-weight:800; font-size:20px; color:#0f172a; margin-bottom:16px;">Bạn đã đặt hàng thành công</div>
          <div class="os-actions" style="margin-top:8px;">
            <button id="osContinueBtn" class="btn btn--pri">Tiếp tục mua sắm</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(m);
  }
  return m;
}

export function openOrderSuccessModal(orderId) {
  const m = ensureOrderSuccessModal();
  // Bind close behaviors
  const goShopping = () => {
    const target = location.pathname.endsWith('/index.html') ? '#catalog' : '../html/index.html#catalog';
    location.href = new URL(target, location.href).toString();
  };
  const overlay = document.getElementById('osOverlay');
  const btn = document.getElementById('osContinueBtn');
  // Không cho đóng bằng overlay và chặn sự kiện lan xuống nền
  if (overlay) {
    overlay.onclick = (e) => { e.preventDefault(); e.stopPropagation(); };
    overlay.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
    overlay.style.pointerEvents = '';
  }
  // Chống dính click: vô hiệu hoá nút trong ~1s đầu sau khi mở
  if (btn) {
    // Đặt lại handler chắc chắn chỉ điều hướng khi cho phép
    btn.onclick = (e) => {
      if (btn.disabled) { e.preventDefault(); e.stopPropagation(); return; }
      goShopping();
    };
    // Khoá click tức thời, tránh click trước đó dội vào nút
    btn.disabled = true;
    btn.setAttribute('aria-disabled','true');
    setTimeout(() => {
      btn.disabled = false;
      btn.removeAttribute('aria-disabled');
    }, 1000);
  }
  m.hidden = false;
}

export function closeOrderSuccessModal() {
  const m = ensureOrderSuccessModal();
  m.hidden = true;
}

function printOrderDetails(ord) {
  const bodyEl = document.getElementById('ocBody');
  const inner = bodyEl ? bodyEl.innerHTML : '';
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Đơn hàng #${ord?.id || ''}</title>
        <style>
          * { box-sizing: border-box; }
          body { font: 14px/1.6 Arial, Helvetica, sans-serif; color: #111; margin: 18px; background: #fff; }
          .order-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
          .muted { color: #555; }
          .oc-items { margin-top: 8px; }
          .oc-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 1px solid #ddd; border-radius: 10px; padding: 10px; background: #fff; margin-top: 6px; }
          .oc-thumb { width: 52px; height: 52px; border-radius: 10px; border: 1px solid #ddd; object-fit: cover; display: inline-block; }
          .oc-item__main { flex: 1; }
          .oc-name { font-weight: 600; }
          .oc-item__meta { text-align: right; }
          .oc-pay { margin-top: 12px; border: 1px solid #ddd; border-radius: 12px; padding: 12px; background: #fff; }
          .oc-section-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
          .oc-row { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; }
          .oc-total { font-weight: 700; }
          .timeline { margin-top: 12px; }
          .timeline .step { display: inline-flex; align-items: flex-start; gap: 8px; border: 1px solid #ddd; border-radius: 10px; padding: 8px 10px; margin: 4px 6px 0 0; }
          .timeline .dot { width: 10px; height: 10px; border-radius: 999px; background: #16a34a; margin-top: 2px; }
          .timeline .label { font-weight: 600; }
          .timeline .time { font-size: 12px; color: #666; }
          @page { size: A4; margin: 12mm; }
        </style>
      </head>
      <body>
        ${inner}
      </body>
    </html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => { try { w.print(); } catch (e) {} w.close(); }, 500);
}


export async function renderOrdersInto(containerEl) {
  if (!containerEl) return;
  const cur = await apiCurrentUser();
  if (!cur) {
    containerEl.innerHTML = `<p class="muted">Bạn cần đăng nhập để xem đơn hàng.</p>`;
    return;
  }
  const all = await apiListOrders();
  const data = filterOrdersByUser(all, cur);
  if (!data || !data.length) {
    containerEl.innerHTML = `<p class="muted">Bạn chưa có đơn hàng nào.</p>`;
    return;
  }
  const html = await Promise.all(
    data
      .slice()
      .reverse()
      .map(async (o) => {
        const entries = Object.entries(o.items || {}).filter(([, q]) => q > 0);
        const ids = entries.map(([pid]) => pid);
        const products = await Promise.all(ids.map((id) => apiGetProductById(id)));
        const map = {}; for (const p of products) if (p && p.id) map[p.id] = p;
        const thumbsHtml = entries.slice(0,5).map(([pid]) => {
          const p = map[pid];
          if (p?.image) return `<img src="${p.image}" alt="${p.name}" class="orders-card__thumb">`;
          return `<div class="orders-card__thumb">${p?.emoji || '🧺'}</div>`;
        }).join('');
        const moreCount = Math.max(0, entries.length - 5);
        const moreHtml = moreCount ? `<div class="orders-card__thumb more">+${moreCount}</div>` : '';
        const paidText = o.payment_status === 'paid' ? `<div class="muted">Đã thanh toán: ${money(o.total || 0)}</div>` : '';
        // Xác định điều kiện cho phép trả hàng: đã giao thành công và chưa bị hủy/trả
        const steps = computeDerivedTracking(o);
        const deliveredDone = steps.some((s) => s.code === 'delivered' && s.at);
        const hasReturnedOrCancelled = steps.some((s) => s.code === 'returned' || s.code === 'cancelled');
        const returnable = deliveredDone && !hasReturnedOrCancelled;
        return `
          <div class="orders-card" data-id="${o.id}">
            <div class="orders-card__head">
              <div><strong>Đơn hàng #${o.id}</strong></div>
              <div class="orders-card__actions">
                <a href="#" data-action="detail" data-id="${o.id}">Xem chi tiết ›</a>
              </div>
            </div>
            <div class="muted">Giao lúc: ${o.slot || '-'} · Mua lúc: ${fmtDate(o.created_at)}</div>
            <div class="orders-card__thumbs">${thumbsHtml}${moreHtml}</div>
            <div class="orders-card__foot">
              <div>
                <div><span class="muted">Tổng đơn hàng:</span> ${money(o.total || 0)}</div>
                ${paidText}
              </div>
              <div class="orders-card__ops">
                <button class="btn vvv-review-order-btn" data-action="review-order" data-id="${o.id}">Đánh giá</button>
                <button class="btn btn--outline" data-action="reorder" data-id="${o.id}">Mua lại đơn</button>
                <button class="btn btn--danger" data-action="return" data-id="${o.id}" ${returnable ? '' : 'disabled title="Chỉ trả hàng sau khi giao thành công"'}>Trả hàng</button>
              </div>
            </div>
          </div>`;
      })
  );
  containerEl.innerHTML = html.join('');
  // Gắn event delegation cho các hành động
  if (!containerEl.__ordersHandlerBound) {
    containerEl.addEventListener('click', async (e) => {
      const detail = e.target.closest('[data-action="detail"]');
      if (detail) {
        e.preventDefault();
        const id = detail.getAttribute('data-id');
        openOrderConfirmModal(id);
        return;
      }
      const reorderBtn = e.target.closest('[data-action="reorder"]');
      if (reorderBtn) {
        e.preventDefault();
        const id = reorderBtn.getAttribute('data-id');
        const list = await apiListOrders();
        const ord = (list || []).find(x => x.id === id);
        if (ord) {
          for (const [pid, qty] of Object.entries(ord.items || {})) {
            if (qty > 0) addToCart(pid, qty);
          }
          openCart();
        }
        return;
      }
      const reviewOrderBtn = e.target.closest('[data-action="review-order"]');
      if (reviewOrderBtn) {
        e.preventDefault();
        const id = reviewOrderBtn.getAttribute('data-id');
        openOrderConfirmModal(id);
        return;
      }
      const returnBtn = e.target.closest('[data-action="return"]');
      if (returnBtn) {
        e.preventDefault();
        if (returnBtn.hasAttribute('disabled')) return;
        const id = returnBtn.getAttribute('data-id');
        const ok = confirm('Bạn có chắc muốn trả hàng?');
        if (!ok) return;
        await apiReturnOrder(id);
        await renderOrdersInto(containerEl);
        return;
      }
    });
    containerEl.__ordersHandlerBound = true;
  }
}
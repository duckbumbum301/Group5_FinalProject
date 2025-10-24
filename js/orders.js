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

// Auto open after checkout (if module was loaded already)
document.addEventListener('orders:open', () => {
  openOrdersModal();
});

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
        <header class="modal__head"><h3>Xác nhận đơn hàng</h3><button id="ocCloseBtn" class="btn btn--icon">✕</button></header>
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
    const ord = (list || []).find((x) => x.id === orderId);
    if (!ord) { body.innerHTML = '<p class="alert">Không tìm thấy đơn hàng.</p>'; return; }
    const entries = Object.entries(ord.items || {}).filter(([, q]) => q > 0);
    const ids = entries.map(([pid]) => pid);
    const products = await Promise.all(ids.map((id) => apiGetProductById(id)));
    const map = {}; for (const p of products) if (p && p.id) map[p.id] = p;
    const itemsHtml = entries.map(([pid, q]) => {
      const p = map[pid];
      return p ? `• ${p.name} × ${q}` : `• ${pid} × ${q}`;
    }).join('<br>');
    body.innerHTML = `
      <div class="order-confirm">
        <div><strong>Đơn hàng #${ord.id}</strong></div>
        <div class="muted">Mua lúc: ${fmtDate(ord.created_at)}</div>
        <div style="margin-top:8px;">${itemsHtml}</div>
      </div>`;
  })();
  const onClose = () => { const m2 = ensureOrderConfirmModal(); m2.hidden = true; };
  document.getElementById('ocOverlay')?.addEventListener('click', onClose, { once: true });
  document.getElementById('ocCloseBtn')?.addEventListener('click', onClose, { once: true });
  m.hidden = false;
}
export function closeOrderConfirmModal() {
  const m = ensureOrderConfirmModal();
  m.hidden = true;
}

document.addEventListener('order:confirmed', (e) => {
  const id = e?.detail?.orderId;
  openOrderConfirmModal(id);
});

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
// js/orders.js — Tách logic Orders thành module
import { money } from './utils.js';
import { apiListOrders, apiGetProductById } from './api.js';

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
    const created = new Date(order.created_at).getTime();
    const mins = Math.floor((Date.now() - created) / 60000);
    const offsets = [0, 1, 5, 10, 15, 25];
    base.forEach((s, i) => {
      if (mins >= offsets[i] && !s.at) {
        s.at = new Date(created + offsets[i] * 60000).toISOString();
      }
    });
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

export async function openOrdersModal() {
  const modal = ensureOrdersModal();
  const body = document.getElementById('ordersBody');
  const data = await apiListOrders();

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
          const map = {};
          for (const p of products) if (p && p.id) map[p.id] = p;
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
        <div id="ocBody"></div>
        <div class="co-actions">
          <button class="btn" id="ocViewOrders">Xem tất cả đơn</button>
          <button class="btn btn--pri" id="ocDone">Đóng</button>
        </div>
      </div>`;
    document.body.appendChild(m);
    document.getElementById('ocCloseBtn')?.addEventListener('click', closeOrderConfirmModal);
    document.getElementById('ocOverlay')?.addEventListener('click', closeOrderConfirmModal);
    document.addEventListener('keydown', (e) => { if (!m.hidden && e.key === 'Escape') closeOrderConfirmModal(); });
  }
  return m;
}

export function openOrderConfirmModal(orderId) {
  const m = ensureOrderConfirmModal();
  const body = document.getElementById('ocBody');
  apiListOrders().then((list) => {
    const o = (list || []).find((x) => x.id === orderId) || list[list.length - 1];
    if (!o) {
      body.innerHTML = `<p class="muted">Không tìm thấy đơn hàng.</p>`;
    } else {
      const entries = Object.entries(o.items || {}).filter(([, q]) => q > 0);
      const ids = entries.map(([pid]) => pid);
      Promise.all(ids.map((id) => apiGetProductById(id))).then((products) => {
        const map = {}; for (const p of products) if (p && p.id) map[p.id] = p;
        const itemsHtml = entries.map(([pid, q]) => {
          const p = map[pid]; return p ? `• ${p.name} × ${q}` : `• ${pid} × ${q}`;
        }).join('<br>');
        body.innerHTML = `
          <div class="order-card">
            <div class="order-head"><div><strong>Mã đơn:</strong> ${o.id}</div><div class="muted">${fmtDate(o.created_at)}</div></div>
            <div class="muted">Thanh toán: ${o.payment || 'COD'} · TT: ${o.payment_status || 'pending'} · Giao: ${currentDeliveryLabel(o)} · Khung giờ: ${o.slot || '-'}</div>
            <div class="order-items">${itemsHtml || '(Không có mục hàng)'}</div>
            <div style="margin-top:8px;">
              <span class="muted">Tạm tính:</span> ${money(o.subtotal || 0)} · 
              <span class="muted">Giảm:</span> ${money(o.discount || 0)} · 
              <span class="muted">Ship:</span> ${money(o.shipping_fee || 0)} · 
              <span class="order-total">Tổng: ${money(o.total || 0)}</span>
            </div>
            ${buildTimeline(o)}
          </div>
          <p class="muted">Cảm ơn bạn! Đơn hàng đang được xử lý.</p>
        `;
      });
    }
    document.getElementById('ocViewOrders')?.addEventListener('click', () => {
      closeOrderConfirmModal();
      openOrdersModal();
    }, { once: true });
    document.getElementById('ocDone')?.addEventListener('click', closeOrderConfirmModal, { once: true });
    m.hidden = false;
  });
}
export function closeOrderConfirmModal() {
  const m = document.getElementById('orderConfirmModal');
  if (m) m.hidden = true;
}

document.addEventListener('order:confirmed', (e) => {
  const id = e?.detail?.orderId;
  openOrderConfirmModal(id);
});


export async function renderOrdersInto(containerEl) {
  if (!containerEl) return;
  const data = await apiListOrders();
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
        const itemsHtml = entries.map(([pid, q]) => {
          const p = map[pid]; return p ? `• ${p.name} × ${q}` : `• ${pid} × ${q}`;
        }).join('<br>');
        return `
          <div class="orders-card">
            <div class="orders-card__head"><div><strong>Mã đơn:</strong> ${o.id}</div><div class="muted">${fmtDate(o.created_at)}</div></div>
            <div class="muted">Thanh toán: ${o.payment || 'COD'} · TT: ${o.payment_status || 'pending'} · Giao: ${currentDeliveryLabel(o)} · Khung giờ: ${o.slot || '-'}</div>
            <div class="orders-card__items">${itemsHtml || '(Không có mục hàng)'}</div>
            <div class="orders-card__foot">
              <div>
                <span class="muted">Tạm tính:</span> ${money(o.subtotal || 0)} · 
                <span class="muted">Giảm:</span> ${money(o.discount || 0)} · 
                <span class="muted">Ship:</span> ${money(o.shipping_fee || 0)}
              </div>
              <div class="order-total">Tổng: ${money(o.total || 0)}</div>
            </div>
            ${buildTimeline(o)}
          </div>`;
      })
  );
  containerEl.innerHTML = html.join('');
}
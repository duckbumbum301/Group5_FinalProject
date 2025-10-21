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
          <div class="muted">Thanh toán: ${o.payment || 'COD'} · Khung giờ: ${o.slot || '-'}</div>
          <div class="order-items">${itemsHtml || '(Không có mục hàng)'}</div>
          <div style="margin-top:8px;">
            <span class="muted">Tạm tính:</span> ${money(o.subtotal || 0)} · 
            <span class="muted">Giảm:</span> ${money(o.discount || 0)} · 
            <span class="muted">Ship:</span> ${money(o.shipping_fee || 0)} · 
            <span class="order-total">Tổng: ${money(o.total || 0)}</span>
          </div>
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

// Auto open after checkout
document.addEventListener('orders:open', () => {
  openOrdersModal();
});
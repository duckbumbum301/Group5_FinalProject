// js/checkout.js — Tách logic Checkout thành module
import { $, money } from './utils.js';
import { getCart, clearCart } from './cart.js';
import {
  apiListDeliverySlots,
  calcShippingFee,
  apiApplyVoucher,
  apiCreateOrder,
  apiCurrentUser,
  apiUpdateProfile,
  apiGetProductById,
} from './api.js';

const LS_USER = 'vvv_user';

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
    document.addEventListener('keydown', (e) => {
      if (!el.hidden && e.key === 'Escape') closeCheckoutModal();
    });
  }
  return el;
}

export async function openCheckoutModal() {
  const cur = await apiCurrentUser();
  if (!cur) {
    localStorage.setItem('vvv_return_to', location.href);
    location.href = '../client/login.html';
    return;
  }

  const el = ensureCheckoutModal();

  const slots = await apiListDeliverySlots();
  const sel = $('#coSlot', el);
  sel.innerHTML = slots
    .map((s) => `<option value="${s.id}">${s.date} • ${s.window}</option>`)
    .join('');

  const form = $('#coForm', el);
  form.elements.name.value = cur.name || '';
  form.elements.phone.value = cur.phone || '';
  form.elements.address.value = cur.address || '';

  const sumEl = $('#coSummary', el);
  const msgEl = $('#coVoucherMsg', el);
  let appliedVoucher = null; // {type, value}
  let subtotal = 0;
  let shipping = 0;
  let discount = 0;

  async function computeSubtotal() {
    const cart = getCart();
    const entries = Object.entries(cart).filter(([, q]) => q > 0);
    const ids = entries.map(([pid]) => pid);
    const products = await Promise.all(ids.map((id) => apiGetProductById(id)));
    const map = {};
    for (const p of products) if (p && p.id) map[p.id] = p;
    subtotal = entries.reduce((s, [pid, q]) => {
      const p = map[pid];
      return s + (p ? p.price * q : 0);
    }, 0);
  }
  async function recalc() {
    await computeSubtotal();
    shipping = calcShippingFee(form.elements.address.value, subtotal);
    discount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.type === 'ship') shipping = 0;
      if (appliedVoucher.type === 'percent')
        discount = Math.round((subtotal * appliedVoucher.value) / 100);
    }
    const total = Math.max(0, subtotal + shipping - discount);
    sumEl.textContent = `Tạm tính: ${money(subtotal)} • Giảm: ${money(discount)} • Ship: ${money(shipping)} • Tổng: ${money(total)}`;
    form.dataset.total = String(total);
    form.dataset.discount = String(discount);
  }

  await recalc();

  $('#coApplyVoucher', el).onclick = async () => {
    await computeSubtotal();
    const curShip = calcShippingFee(form.elements.address.value, subtotal);
    const code = form.elements.voucher.value;
    const res = await apiApplyVoucher(code, {
      subtotal,
      shippingFee: curShip,
    });
    if (!res.ok) {
      msgEl.textContent = res.message;
      appliedVoucher = null;
      discount = 0;
      await recalc();
      return;
    }
    msgEl.textContent = res.message;
    appliedVoucher = { type: res.type, value: res.value };
    await recalc();
  };

  form.elements.address.addEventListener('input', () => recalc());
  el._recalcFn = () => recalc();
  document.addEventListener('cart:changed', el._recalcFn);

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
    if (!name || !phone || !address) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const cur2 = await apiCurrentUser();
    if (!cur2) {
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      localStorage.setItem('vvv_return_to', location.href);
      location.href = '../client/login.html';
      return;
    }

    await recalc();
    const discountNow = parseInt(form.dataset.discount || '0', 10) || 0;
    const totalNow =
      parseInt(form.dataset.total || '0', 10) || subtotal + shipping - discountNow;

    const user = { name, phone, address };
    localStorage.setItem(LS_USER, JSON.stringify(user));
    try {
      await apiUpdateProfile({ name, address });
    } catch {}

    const newOrder = await apiCreateOrder({
      user,
      slot,
      voucher,
      payment,
      note,
      status: 'Pending',
      subtotal,
      shipping_fee: shipping,
      discount: discountNow,
      total: totalNow,
      items: { ...getCart() },
    });

    clearCart();
    closeCheckoutModal();
    document.dispatchEvent(new Event('orders:open'));
  };

  el.hidden = false;
}

export function closeCheckoutModal() {
  const el = document.getElementById('checkoutModal');
  if (!el) return;
  if (el._recalcFn) document.removeEventListener('cart:changed', el._recalcFn);
  el.hidden = true;
}
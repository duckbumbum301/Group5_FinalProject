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
      <div class="modal__panel co-panel">
        <header class="modal__head co-head">
          <h3>Thanh toán</h3>
          <button class="btn btn--icon" id="coClose" aria-label="Đóng">✕</button>
        </header>
        <form class="form co-form" id="coForm">
          <div class="co-grid co-grid--1">
            <input name="name" class="input" placeholder="Họ tên" required />
            <input name="phone" class="input" placeholder="Số điện thoại" required />
            <div class="co-field">
              <label>Địa chỉ giao hàng</label>
              <div class="addr-row">
                <textarea name="address" class="input" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành" required></textarea>
                <button type="button" class="btn btn--outline" id="btnPickOnMap">Chọn trên bản đồ</button>
              </div>
              <input type="hidden" name="lat" />
              <input type="hidden" name="lng" />
            </div>
          </div>
          <div class="co-grid co-grid--2">
            <div class="co-field">
              <label>Khung giờ giao</label>
              <select name="slot" class="input" id="coSlot"></select>
            </div>
            <div class="co-field">
              <label>Voucher</label>
              <div class="voucher-row">
                <input name="voucher" class="input" placeholder="FREESHIP / GIAM10" />
                <button type="button" class="btn btn--outline" id="coApplyVoucher">Áp dụng</button>
              </div>
              <p class="muted" id="coVoucherMsg" role="status" aria-live="polite"></p>
            </div>
          </div>
          <div class="co-grid co-grid--2">
            <div class="co-field">
              <label>Phương thức thanh toán</label>
              <select name="payment" class="input">
                <option value="COD">COD - tiền mặt</option>
                <option value="ONLINE">Online (demo)</option>
              </select>
            </div>
            <div class="co-field">
              <label>Ghi chú</label>
              <input name="note" class="input" placeholder="Ví dụ: gọi trước khi giao" />
            </div>
          </div>
          <div id="coSummary" class="co-summary"></div>
          <div class="co-actions">
            <button class="btn btn--pri btn--full">Xác nhận đặt hàng</button>
          </div>
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
    sumEl.innerHTML = `
      <div class="row"><span class="muted">Tạm tính</span><strong>${money(subtotal)}</strong></div>
      <div class="row"><span class="muted">Giảm</span><strong>${money(discount)}</strong></div>
      <div class="row"><span class="muted">Ship</span><strong>${money(shipping)}</strong></div>
      <div class="total-row"><span class="muted">Tổng</span><strong class="total">${money(total)}</strong></div>
    `;
    form.dataset.total = String(total);
    form.dataset.discount = String(discount);
  }

  await recalc();

  // gắn nút chọn trên bản đồ
  const pickBtn = $('#btnPickOnMap', el);
  if (pickBtn) {
    pickBtn.onclick = () => openAddressPicker(form);
  }

  // lưu hàm recalc vào form để AddressPicker gọi lại
  form._recalcFn = () => recalc();

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
      msgEl.className = 'muted err';
      appliedVoucher = null;
      discount = 0;
      await recalc();
      return;
    }
    msgEl.textContent = res.message;
    msgEl.className = 'muted ok';
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


function ensureAddressPicker(){
  let m = document.getElementById('addressPickerModal');
  if(!m){
    m = document.createElement('section');
    m.id = 'addressPickerModal';
    m.className = 'modal';
    m.hidden = true;
    m.innerHTML = `
      <div class="modal__overlay" id="apOverlay"></div>
      <div class="modal__panel ap-panel">
        <header class="modal__head ap-head">
          <h3>Địa chỉ nhận hàng</h3>
          <button class="btn btn--icon" id="apClose" aria-label="Đóng">✕</button>
        </header>
        <div class="ap-body">
          <div class="ap-row">
            <button id="apLocate" class="btn btn--outline">📍 Lấy vị trí hiện tại</button>
          </div>
          <div class="ap-row">
            <input id="apSearch" class="input" placeholder="Tìm nhanh: 25bis Nguyen Thi Minh Khai, Q1" />
          </div>
          <div id="apSuggests" class="ap-suggests"></div>
          <div id="apMap" class="ap-map" aria-label="Bản đồ chọn địa chỉ"></div>
          <div class="ap-foot">
            <button class="btn btn--outline" id="apAdjust">Sửa vị trí</button>
            <button class="btn btn--pri" id="apConfirm">Hoàn tất</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(m);
    document.getElementById('apClose').addEventListener('click',()=>closeAddressPicker());
    document.getElementById('apOverlay').addEventListener('click',()=>closeAddressPicker());
  }
  return m;
}

async function loadLeaflet(){
  if(window.L && typeof window.L.map === 'function') return;
  await new Promise((resolve)=>{
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.onload = resolve; link.onerror = resolve; document.head.appendChild(link);
  });
  await new Promise((resolve, reject)=>{
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = resolve; s.onerror = reject; document.body.appendChild(s);
  });
}

async function geocode(query){
  if(!query) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=vn&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Accept-Language':'vi' } });
  if(!res.ok) return [];
  return await res.json();
}
async function reverseGeocode(lat,lng){
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { 'Accept-Language':'vi' } });
  if(!res.ok) return null;
  return await res.json();
}

let apState = { map:null, marker:null, adjusting:false, lat:null, lng:null, address:'' };

export async function openAddressPicker(targetForm){
  await loadLeaflet();
  const m = ensureAddressPicker();
  const mapEl = document.getElementById('apMap');
  const sEl = document.getElementById('apSearch');
  const sugEl = document.getElementById('apSuggests');
  const btnAdjust = document.getElementById('apAdjust');
  const btnConfirm = document.getElementById('apConfirm');
  const btnLocate = document.getElementById('apLocate');

  if(!apState.map){
    apState.map = L.map(mapEl, { zoomControl:true }).setView([10.776,106.700], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(apState.map);
  }
  apState.adjusting = false;
  btnAdjust.textContent = 'Sửa vị trí';

  // init from form or geolocation
  const lat0 = parseFloat(targetForm.elements.lat.value || 'NaN');
  const lng0 = parseFloat(targetForm.elements.lng.value || 'NaN');
  const addr0 = targetForm.elements.address.value;
  if(!Number.isNaN(lat0) && !Number.isNaN(lng0)){
    apState.lat = lat0; apState.lng = lng0; apState.address = addr0;
  }

  function setMarker(lat,lng){
    apState.lat = lat; apState.lng = lng;
    if(!apState.marker){ apState.marker = L.marker([lat,lng],{draggable:false}).addTo(apState.map); }
    else{ apState.marker.setLatLng([lat,lng]); }
    apState.map.setView([lat,lng], 16);
  }

  async function setAddressFromLatLng(lat,lng){
    const info = await reverseGeocode(lat,lng).catch(()=>null);
    if(info && info.display_name){ sEl.value = info.display_name; apState.address = info.display_name; }
  }

  if(apState.lat && apState.lng){ setMarker(apState.lat, apState.lng); }
  else if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      const { latitude, longitude } = pos.coords;
      setMarker(latitude, longitude);
      await setAddressFromLatLng(latitude, longitude);
    }, ()=>{ apState.map.setView([10.776,106.700], 13); });
  } else {
    apState.map.setView([10.776,106.700], 13);
  }

  // search
  let searchTimer=null;
  sEl.oninput = ()=>{
    clearTimeout(searchTimer);
    const q = sEl.value.trim();
    searchTimer = setTimeout(async ()=>{
      const list = await geocode(q);
      sugEl.innerHTML = list.map(item=>`<button class="sug" data-lat="${item.lat}" data-lng="${item.lon}">${item.display_name}</button>`).join('') || '';
      [...sugEl.querySelectorAll('.sug')].forEach(btn=>{
        btn.onclick = ()=>{
          const lat = parseFloat(btn.dataset.lat), lng = parseFloat(btn.dataset.lng);
          setMarker(lat,lng); apState.address = btn.textContent;
        };
      });
    }, 300);
  };

  // adjust mode
  btnAdjust.onclick = ()=>{
    apState.adjusting = !apState.adjusting;
    btnAdjust.textContent = apState.adjusting ? 'Kết thúc sửa' : 'Sửa vị trí';
    if(apState.adjusting){
      apState.map.once('click', async (e)=>{
        const { lat, lng } = e.latlng; setMarker(lat,lng); await setAddressFromLatLng(lat,lng); apState.adjusting=false; btnAdjust.textContent='Sửa vị trí';
      });
    }
  };

  // locate current
  btnLocate.onclick = ()=>{
    if(!navigator.geolocation) return alert('Thiết bị không hỗ trợ lấy vị trí.');
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      const { latitude, longitude } = pos.coords; setMarker(latitude, longitude); await setAddressFromLatLng(latitude, longitude);
    }, (err)=>{ alert('Không lấy được vị trí: ' + (err?.message||'')); });
  };

  // confirm
  btnConfirm.onclick = ()=>{
    if(apState.address){ targetForm.elements.address.value = apState.address; }
    if(apState.lat && apState.lng){ targetForm.elements.lat.value = String(apState.lat); targetForm.elements.lng.value = String(apState.lng); }
    closeAddressPicker();
    if(typeof targetForm._recalcFn === 'function'){ targetForm._recalcFn(); }
  };

  m.hidden = false;
}

export function closeAddressPicker(){
  const m = document.getElementById('addressPickerModal');
  if(m) m.hidden = true;
}
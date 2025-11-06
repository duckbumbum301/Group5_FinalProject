// js/flash.js — Trang Flash Sale random theo khung giờ 6–8h và 16–18h
import { $, money } from './utils.js';
import { apiListProducts, apiGetProductById } from './api.js';
import { addToCart, removeFromCart, updateCartQuantity } from './cart.js';
import { renderProductsInto, closeCart } from './ui.js';
import { openProductModal } from './main.js';

// Toast helper (đồng bộ với main.js)
function ensureToastContainer() {
  let c = document.getElementById('toastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toastContainer';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}
function showToast(message, duration = 2500) {
  const container = ensureToastContainer();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-message">${message}</span><button class="toast-close" aria-label="Close">×</button>`;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  const remove = () => {
    t.classList.remove('show');
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  };
  const timer = setTimeout(remove, duration);
  t.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timer);
    remove();
  });
}

// Cấu hình khung giờ
const SLOTS = [
  { key: 'morning', label: '6:00–8:00', start: { h: 6, m: 0 }, end: { h: 8, m: 0 } },
  { key: 'afternoon', label: '16:00–18:00', start: { h: 16, m: 0 }, end: { h: 18, m: 0 } },
];
const LS_FAV = 'vvv_fav';
const PICK_COUNT = 12; // số sp hiển thị mỗi khung giờ

// NEW: trạng thái slot hiện tại + id ticker để đồng bộ countdown theo tab
let currentSlotKey = null;
let tickerId = null;

function toMinutes(h, m) { return h * 60 + m; }
function minutesNow() { const d = new Date(); return toMinutes(d.getHours(), d.getMinutes()); }
function todayKey(){ const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function isNowInSlot(slot) { const now = minutesNow(); const s = toMinutes(slot.start.h, slot.start.m); const e = toMinutes(slot.end.h, slot.end.m); return now >= s && now < e; }
function nextSlot(now = new Date()) {
  const mins = minutesNow();
  const sorted = SLOTS.map(s => ({ s, startM: toMinutes(s.start.h, s.start.m) })).sort((a,b)=>a.startM-b.startM);
  for (const it of sorted) if (mins < it.startM) return it.s;
  // nếu đã qua tất cả slot hôm nay => slot đầu tiên ngày mai
  return sorted[0].s;
}
function slotByKey(key) { return SLOTS.find(s=>s.key===key) || SLOTS[0]; }
function countdownText(slot){
  const now = new Date();
  const inSlot = isNowInSlot(slot);
  const target = new Date(now);
  if (inSlot) { target.setHours(slot.end.h, slot.end.m, 0, 0); }
  else { target.setHours(slot.start.h, slot.start.m, 0, 0); if (target <= now) target.setDate(target.getDate()+1); }
  const diffMs = target - now;
  const s = Math.max(0, Math.floor(diffMs/1000));
  const hh = Math.floor(s/3600), mm = Math.floor((s%3600)/60), ss = s%60;
  const action = inSlot ? 'Còn lại' : 'Bắt đầu sau';
  return `${action}: ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

function sample(list, n){
  const arr = list.slice();
  // shuffle đơn giản
  for(let i=arr.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr.slice(0, n);
}

function getSelectionFor(slotKey, products){
  const day = todayKey();
  const lsKey = `vvv_flash_${slotKey}_${day}`;
  try{
    const cached = JSON.parse(localStorage.getItem(lsKey) || '[]');
    if (Array.isArray(cached) && cached.length) {
      const map = Object.fromEntries(products.map(p=>[p.id,p]));
      return cached.map(id=>map[id]).filter(Boolean);
    }
  }catch{}
  const avail = products.filter(p=>p.stock);
  const picked = sample(avail, Math.min(PICK_COUNT, avail.length));
  localStorage.setItem(lsKey, JSON.stringify(picked.map(p=>p.id)));
  return picked;
}

// NEW: tạo map phần trăm giảm cho mỗi sản phẩm trong slot (cố định theo ngày)
function getSaleMapForSlot(slotKey, selectedProducts){
  const day = todayKey();
  const lsKey = `vvv_flash_sale_${slotKey}_${day}`;
  try{
    const cached = JSON.parse(localStorage.getItem(lsKey) || '{}');
    if (cached && Object.keys(cached).length) return cached;
  }catch{}
  const percOpts = [26, 35, 44, 15];
  const map = {};
  for (const p of selectedProducts) {
    map[p.id] = percOpts[Math.floor(Math.random() * percOpts.length)];
  }
  localStorage.setItem(lsKey, JSON.stringify(map));
  return map;
}

async function renderSlot(slotKey){
  currentSlotKey = slotKey;
  const slot = slotByKey(slotKey);
  const labelEl = $('#slotLabel');
  const timeLeftEl = $('#timeLeft');
  labelEl.textContent = slot.label;
  const all = await apiListProducts();
  const favs = getFavSet();
  const sel = getSelectionFor(slot.key, all);
  const saleMap = getSaleMapForSlot(slot.key, sel);
  const withSale = sel.map(p => ({ ...p, salePercent: saleMap[p.id] || 0 }));
  // Chỉ gắn handler lên lưới Flash Sale, tránh trùng với Catalog (#productGrid)
  const gridEl = document.getElementById('flashGrid');
  if (!gridEl) {
    // Nếu không có flashGrid trên trang hiện tại thì bỏ qua để tránh double-binding
    return;
  }
  renderProductsInto(gridEl, withSale, favs);
  // gắn sự kiện Add/Fav riêng cho trang này (đảm bảo chỉ gắn một lần)
  if (gridEl._flashHandler) gridEl.removeEventListener('click', gridEl._flashHandler);
  const onGridClick = (e) => {
    const btn = e.target.closest('[data-action]');
    const card = e.target.closest('.card');
    const pid = card?.dataset?.id;
    if (!card || !pid) return;
    // Nếu click vào khoảng trống của card (không phải nút) -> mở modal chi tiết
    if (!btn) {
      e.preventDefault();
      e.stopPropagation();
      const prod = withSale.find(p => String(p.id) === String(pid));
      const pct = prod?.salePercent || 0;
      openProductModal(pid, { salePercent: pct });
      return;
    }
    const action = btn.dataset.action;
    if (action === 'add') {
      // Ngăn mọi handler khác chạy trên cùng target
      e.preventDefault();
      e.stopImmediatePropagation();
      const inSlot = isNowInSlot(slot);
      const prod = withSale.find(p => String(p.id) === String(pid));
      if (!inSlot) {
        const basePrice = prod?.price || 0;
        const ok = window.confirm(`Hiện đang ngoài giờ Flash Sale.\nGiá mua sẽ là giá gốc: ${money(basePrice)}.\nBạn có muốn thêm sản phẩm vào giỏ hàng?`);
        if (!ok) {
          // Cancel -> đảm bảo xóa sản phẩm khỏi giỏ và đóng drawer
          updateCartQuantity(pid, 0);
          removeFromCart(pid);
          closeCart();
          return;
        }
      }
      addToCart(pid, 1);
      showToast(`${prod?.name || 'Sản phẩm'} đã được thêm vào giỏ hàng.`);
    }
    if (action === 'fav') {
      // Hiệu ứng rung tim
      btn.classList.add('fav-anim');
      btn.addEventListener('animationend', () => btn.classList.remove('fav-anim'), { once: true });
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      setFav(pid, on);
    }
  };
  gridEl._flashHandler = onGridClick;
  gridEl.addEventListener('click', onGridClick);
  document.querySelectorAll('.pill').forEach(b=>b.classList.toggle('active', b.dataset.slot===slot.key));
  timeLeftEl.textContent = countdownText(slot);
}

function getFavSet(){
  try{ return new Set(JSON.parse(localStorage.getItem(LS_FAV)||'[]')); }catch{ return new Set(); }
}

function setFav(pid, on){
  const set = getFavSet();
  if(on) set.add(pid); else set.delete(pid);
  localStorage.setItem(LS_FAV, JSON.stringify([...set]));
  // Thông báo cho các module khác (Catalog) để đồng bộ
  try {
    document.dispatchEvent(new CustomEvent('fav:changed', { detail: { pid, on } }));
  } catch {}
}

function startTicker(){
  const timeLeftEl = $('#timeLeft');
  const tick = ()=>{
    const key = currentSlotKey || (SLOTS.find(isNowInSlot)?.key || nextSlot().key);
    const slot = slotByKey(key);
    timeLeftEl.textContent = countdownText(slot);
    // khi hết giờ -> switch sang slot tiếp theo
    const inSlot = isNowInSlot(slot);
    const now = minutesNow();
    const endM = toMinutes(slot.end.h, slot.end.m);
    if(inSlot && now >= endM){
      currentSlotKey = nextSlot().key;
      renderSlot(currentSlotKey);
    }
  };
  if (tickerId) clearInterval(tickerId);
  tickerId = setInterval(tick, 1000);
}

async function init(){
  const active = SLOTS.find(isNowInSlot) || nextSlot();
  await renderSlot(active.key);
  startTicker();
  // click tabs
  $('#tabMorning').addEventListener('click', ()=>renderSlot('morning'));
  $('#tabAfternoon').addEventListener('click', ()=>renderSlot('afternoon'));
}

init();
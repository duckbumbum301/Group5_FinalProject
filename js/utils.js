// js/utils.js — Tiện ích dùng chung

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const money = n => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
export const debounce = (fn, d=300) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), d); }; };

// Bỏ dấu tiếng Việt để search xịn
export function normalizeVN(str='') {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')        // bỏ dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')  // đ/Đ
    .toLowerCase();
}

// Tạo <datalist> cho autocomplete
export function ensureDatalist(id, inputEl) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('datalist');
    el.id = id;
    document.body.appendChild(el);
  }
  inputEl?.setAttribute('list', id);
  return el;
}

// ---- Flash Sale helpers (dùng chung cho Cart/Checkout) ----
export const FLASH_SLOTS = [
  { key: 'morning', label: '6:00–8:00', start: { h: 6, m: 0 }, end: { h: 8, m: 0 } },
  { key: 'afternoon', label: '16:00–18:00', start: { h: 16, m: 0 }, end: { h: 18, m: 0 } },
];
export function toMinutes(h, m) { return h * 60 + m; }
export function minutesNow() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
export function isNowInSlot(slot) {
  const now = minutesNow();
  const s = toMinutes(slot.start.h, slot.start.m);
  const e = toMinutes(slot.end.h, slot.end.m);
  return now >= s && now < e;
}
export function getActiveFlashSlot(){
  return FLASH_SLOTS.find(isNowInSlot) || null;
}
export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function getFlashSalePercentForProduct(pid){
  const slot = getActiveFlashSlot();
  if(!slot) return 0;
  const day = todayKey();
  try{
    const selKey = `vvv_flash_${slot.key}_${day}`;
    const saleKey = `vvv_flash_sale_${slot.key}_${day}`;
    const selected = JSON.parse(localStorage.getItem(selKey) || '[]');
    const saleMap = JSON.parse(localStorage.getItem(saleKey) || '{}');
    if(Array.isArray(selected) && selected.some(id => String(id) === String(pid))){
      const pct = Number(saleMap[pid] || 0);
      return Number.isFinite(pct) ? pct : 0;
    }
  }catch{}
  return 0;
}
export function getFlashEffectivePrice(p){
  const pct = getFlashSalePercentForProduct(p?.id);
  return pct > 0 ? Math.round(p.price * (100 - pct) / 100) : p.price;
}

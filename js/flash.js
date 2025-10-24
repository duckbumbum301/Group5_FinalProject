// js/flash.js — Trang Flash Sale random theo khung giờ 6–8h và 16–18h
import { $, money } from './utils.js';
import { apiListProducts, apiGetProductById } from './api.js';
import { addToCart } from './cart.js';
import { renderProductsInto } from './ui.js';

// Cấu hình khung giờ
const SLOTS = [
  { key: 'morning', label: '6:00–8:00', start: { h: 6, m: 0 }, end: { h: 8, m: 0 } },
  { key: 'afternoon', label: '16:00–18:00', start: { h: 16, m: 0 }, end: { h: 18, m: 0 } },
];
const LS_FAV = 'vvv_fav';
const PICK_COUNT = 12; // số sp hiển thị mỗi khung giờ

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function toMinutes(h, m) { return h * 60 + m; }
function minutesNow() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
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
  const slot = slotByKey(slotKey);
  const labelEl = $('#slotLabel');
  const timeLeftEl = $('#timeLeft');
  labelEl.textContent = slot.label;
  const all = await apiListProducts();
  const favs = getFavSet();
  const sel = getSelectionFor(slot.key, all);
  const saleMap = getSaleMapForSlot(slot.key, sel);
  const withSale = sel.map(p => ({ ...p, salePercent: saleMap[p.id] || 0 }));
  const gridEl = document.getElementById('flashGrid') || document.getElementById('productGrid');
  renderProductsInto(gridEl, withSale, favs);
  // gắn sự kiện Add/Fav riêng cho trang này
  gridEl.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-action]');
    if(!btn) return;
    const card = e.target.closest('.card');
    const pid = card?.dataset?.id;
    if(!pid) return;
    if(btn.dataset.action==='add'){ addToCart(pid, 1); }
    if(btn.dataset.action==='fav'){
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      setFav(pid, on);
    }
  }, { once: true });

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
}

function startTicker(activeKey){
  const timeLeftEl = $('#timeLeft');
  const labelEl = $('#slotLabel');
  let currentKey = activeKey;
  const tick = ()=>{
    const slot = slotByKey(currentKey);
    timeLeftEl.textContent = countdownText(slot);
    // khi hết giờ -> switch sang slot tiếp theo
    const inSlot = isNowInSlot(slot);
    const now = minutesNow();
    const endM = toMinutes(slot.end.h, slot.end.m);
    if(inSlot && now >= endM){
      currentKey = nextSlot().key;
      renderSlot(currentKey);
    }
  };
  setInterval(tick, 1000);
}

async function init(){
  const active = SLOTS.find(isNowInSlot) || nextSlot();
  await renderSlot(active.key);
  startTicker(active.key);
  // click tabs
  $('#tabMorning').addEventListener('click', ()=>renderSlot('morning'));
  $('#tabAfternoon').addEventListener('click', ()=>renderSlot('afternoon'));
}

init();
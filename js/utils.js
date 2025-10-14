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

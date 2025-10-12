// js/main.js (File điều phối chính)

import { $, money, debounce } from './utils.js';
import { PRODUCTS, RECIPES } from './data.js';
import { loadCart, addToCart, removeFromCart, updateCartQuantity, getCart, clearCart } from './cart.js';
import { renderUI, renderProducts, openCart, closeCart } from './ui.js';

// Toast helper: create container once
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

  // show
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

// ---------- State ----------
const LS_USER = 'vvv_user';
const LS_ORDERS = 'vvv_orders';
const LS_FAV  = 'vvv_fav';
let user = {};    // { name, email, address }
let orders = [];  // [ {id, date, user, items, total}, ... ]
let favs = new Set(); // Set<productId>
let filters = {
  q: '',
  cat: 'all',
  sort: 'pop',
  priceMax: 250000,
  favOnly: false,
};

// ---------- DOM refs ----------
const yearEl = $('#year');
const gridEl = $('#productGrid');
const priceRange = $('#priceRange');
const priceValue = $('#priceValue');
const searchToggle = $('#searchToggle');
const searchbar = $('#searchbar');
const searchInput = $('#searchInput');
const sortSelect = $('#sortSelect');
const catFilter = $('#categoryFilter');
const favOnly = $('#favOnly');
const cartOpenBtn = $('#cartOpenBtn');
const cartOverlay = $('#cartOverlay');
const cartCloseBtn = $('#cartCloseBtn');
const cartItems = $('#cartItems');
const cartPanel = $('#cartDrawer .drawer__panel'); // <-- Ref quan trọng để sửa lỗi
const recipeInput = $('#recipeInput');
const recipeList = $('#recipeList');
const recipeAddAllBtn = $('#recipeAddAllBtn');
const contactForm = $('#contactForm');
const contactMsg = $('#contactMsg');
const accountBtn = $('#accountBtn');
const accountModal = $('#accountModal');
const accountOverlay = $('#accountOverlay');
const accountCloseBtn = $('#accountCloseBtn');
const accountForm = $('#accountForm');
const accountMsg = $('#accountMsg');
const checkoutBtn = $('#checkoutBtn');

// Mega Menu refs
const productsMenuToggle = $('#productsMenuToggle');
const productsMegaMenu = $('#productsMegaMenu');
const navItem = $('.nav-item--dropdown');

// DOM elements đã được khởi tạo

// ---------- Core Logic ----------
function applyFiltersAndRender() {
  let items = PRODUCTS.filter(p => p.stock && p.price <= filters.priceMax);
  if (filters.cat !== 'all') items = items.filter(p => p.cat === filters.cat);
  if (filters.q) items = items.filter(p => p.name.toLowerCase().includes(filters.q));
  if (filters.favOnly) items = items.filter(p => favs.has(p.id));

  if (filters.sort === 'priceAsc') items.sort((a,b) => a.price - b.price);
  else if (filters.sort === 'priceDesc') items.sort((a,b) => b.price - a.price);
  else items.sort((a,b) => b.pop - a.pop);

  renderProducts(items, favs);
}

function toggleFav(pid, btn) {
  if (favs.has(pid)) favs.delete(pid); else favs.add(pid);
  if (btn) btn.setAttribute('aria-pressed', favs.has(pid) ? 'true' : 'false');
  localStorage.setItem(LS_FAV, JSON.stringify([...favs]));
  if (filters.favOnly) applyFiltersAndRender();
}

// ---------- Account & Order Logic ----------
function openAccountModal() {
  accountForm.elements.name.value = user.name || '';
  accountForm.elements.email.value = user.email || '';
  accountForm.elements.address.value = user.address || '';
  accountModal.removeAttribute('hidden');
}

function closeAccountModal() {
  accountModal.setAttribute('hidden', '');
}

function handleSaveUser(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  user = {
    name: (fd.get('name') || '').trim(),
    email: (fd.get('email') || '').trim(),
    address: (fd.get('address') || '').trim(),
  };
  
  if (!user.name || !user.email || !user.address) {
    accountMsg.textContent = 'Vui lòng điền đủ thông tin.';
    return;
  }

  localStorage.setItem(LS_USER, JSON.stringify(user));
  accountMsg.textContent = 'Đã lưu thành công!';
  setTimeout(() => {
    closeAccountModal();
    accountMsg.textContent = '';
  }, 1000);
}

function handleCheckout() {
  const cart = getCart();
  const cartEntries = Object.entries(cart).filter(([,q]) => q > 0);

  if (cartEntries.length === 0) {
    alert('Giỏ hàng của bạn đang trống!');
    return;
  }

  if (!user.name || !user.address) {
    alert('Vui lòng cập nhật thông tin giao hàng trước khi thanh toán.');
    openAccountModal();
    return;
  }

  const subtotal = cartEntries.reduce((s, [pid, q]) => {
    const p = PRODUCTS.find(x => x.id === pid);
    return s + (p ? p.price * q : 0);
  }, 0);

  const newOrder = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    user: { ...user },
    items: { ...cart },
    total: subtotal
  };

  orders.push(newOrder);
  localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
  
  alert(`Đặt hàng thành công!\nMã đơn hàng của bạn là: ${newOrder.id}`);

  clearCart();
}

// ---------- Mega Menu Logic ----------
function openMegaMenu() {
  productsMegaMenu.removeAttribute('hidden');
  productsMegaMenu.setAttribute('aria-hidden', 'false');
  productsMenuToggle.setAttribute('aria-expanded', 'true');
  navItem.setAttribute('aria-expanded', 'true');
  
  // Focus first link for keyboard navigation
  const firstLink = productsMegaMenu.querySelector('.mega-menu__link');
  if (firstLink) firstLink.focus();
}

function closeMegaMenu() {
  productsMegaMenu.setAttribute('hidden', '');
  productsMegaMenu.setAttribute('aria-hidden', 'true');
  productsMenuToggle.setAttribute('aria-expanded', 'false');
  navItem.setAttribute('aria-expanded', 'false');
}

function toggleMegaMenu() {
  const isOpen = !productsMegaMenu.hasAttribute('hidden');
  if (isOpen) {
    closeMegaMenu();
  } else {
    openMegaMenu();
  }
}

function handleMegaMenuKeydown(e) {
  if (e.key === 'Escape') {
    closeMegaMenu();
    productsMenuToggle.focus();
  }
  
  // Handle arrow keys for navigation
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const links = Array.from(productsMegaMenu.querySelectorAll('.mega-menu__link'));
    const currentIndex = links.indexOf(document.activeElement);
    let nextIndex;
    
    if (e.key === 'ArrowDown') {
      nextIndex = currentIndex < links.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1;
    }
    
    links[nextIndex].focus();
  }
}

function handleMegaMenuLinkClick(e) {
  const link = e.target.closest('.mega-menu__link');
  if (!link) return;
  
  const category = link.dataset.category;
  if (category) {
    // Set category filter and close menu
    filters.cat = category;
    catFilter.value = category;
    applyFiltersAndRender();
    closeMegaMenu();
    
    // Scroll to catalog section
    const catalogSection = document.getElementById('catalog');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// ---------- Recipe & Contact Logic ----------
function addRecipeToCart() {
  const rName = (recipeInput.value || '').trim().toLowerCase();
  const recipe = RECIPES.find(r => r.name.toLowerCase() === rName);
  if (!recipe) { alert('Không tìm thấy công thức. Vui lòng chọn món từ gợi ý.'); return; }

  for (const item of recipe.items) {
    const product = PRODUCTS.find(p => p.name.toLowerCase().includes(item.match.toLowerCase()));
    if (product && item.qty > 0) {
      addToCart(product.id, item.qty);
    }
  }
  openCart();
}

function onSubmitContact(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = (fd.get('name') || '').trim();
  const email = (fd.get('email') || '').trim();
  const message = (fd.get('message') || '').trim();

  if (!name || !email || !message) {
    contactMsg.textContent = 'Vui lòng điền đầy đủ thông tin.';
    return;
  }
  contactMsg.textContent = 'Đã gửi! (Mô phỏng cho đồ án, không gửi ra ngoài.)';
  e.target.reset();
}

// ---------- Event Listeners Setup ----------
function setupListeners() {
  // Search & Filters
  searchToggle.addEventListener('click', () => {
    const isHidden = searchbar.hasAttribute('hidden');
    searchbar.hidden = !isHidden;
    searchToggle.setAttribute('aria-expanded', String(isHidden));
    if (isHidden) searchInput.focus();
  });

  searchInput.addEventListener('input', debounce(e => {
    filters.q = (e.target.value || '').trim().toLowerCase();
    applyFiltersAndRender();
  }, 250));

  catFilter.addEventListener('change', e => { filters.cat = e.target.value; applyFiltersAndRender(); });
  sortSelect.addEventListener('change', e => { filters.sort = e.target.value; applyFiltersAndRender(); });
  favOnly.addEventListener('change', e => { filters.favOnly = e.target.checked; applyFiltersAndRender(); });

  priceRange.addEventListener('input', e => {
    filters.priceMax = +e.target.value;
    priceValue.textContent = `≤ ${money(filters.priceMax)}`;
    applyFiltersAndRender();
  });

  // Cart Drawer
  cartOpenBtn.addEventListener('click', openCart);
  cartCloseBtn.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
  cartOverlay.addEventListener('click', closeCart);
  // Không cần ngăn chặn event bubbling vì overlay đã xử lý đóng cart

  // Account Modal
  accountBtn.addEventListener('click', openAccountModal);
  accountCloseBtn.addEventListener('click', closeAccountModal);
  accountOverlay.addEventListener('click', closeAccountModal);
  accountForm.addEventListener('submit', handleSaveUser);

  // Actions
  checkoutBtn.addEventListener('click', handleCheckout);
  recipeAddAllBtn.addEventListener('click', addRecipeToCart);
  contactForm?.addEventListener('submit', onSubmitContact);

  // Mega Menu
  productsMenuToggle.addEventListener('click', toggleMegaMenu);
  productsMenuToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMegaMenu();
    }
  });
  
  // Hover events for desktop
  let hoverTimeout;
  navItem.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
    openMegaMenu();
  });
  
  navItem.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(closeMegaMenu, 150);
  });
  
  productsMegaMenu.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
  });
  
  productsMegaMenu.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(closeMegaMenu, 150);
  });
  
  // Keyboard navigation
  productsMegaMenu.addEventListener('keydown', handleMegaMenuKeydown);
  
  // Link clicks
  productsMegaMenu.addEventListener('click', handleMegaMenuLinkClick);
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navItem.contains(e.target)) {
      closeMegaMenu();
    }
  });

  // Event Delegation for Grid and Cart
  gridEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const card = e.target.closest('.card');
    const pid = card?.dataset.id;
    const action = btn.dataset.action;
    if (!pid) return;

    if (action === 'add') {
      // Show a non-blocking toast to confirm the product was added
      const product = PRODUCTS.find(p => p.id === pid);
      const name = product ? product.name : 'Sản phẩm';
      showToast(`${name} đã được thêm vào giỏ hàng.`);
      addToCart(pid, 1);
    }
    if (action === 'fav') toggleFav(pid, btn);
  });

  // Event delegation cho cartItems
  cartItems.addEventListener('click', e => {
    const removeBtn = e.target.closest('[data-action="remove"]');
    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const cartItem = removeBtn.closest('.cart-item');
      const pid = cartItem?.dataset.id;
      if (pid) {
        removeFromCart(pid);
      }
    }
  });

  // Event delegation cho input quantity
  cartItems.addEventListener('input', e => {
    const qtyInput = e.target.closest('[data-action="qty"]');
    if (qtyInput) {
      const cartItem = qtyInput.closest('.cart-item');
      const pid = cartItem?.dataset.id;
      if (pid) updateCartQuantity(pid, qtyInput.value);
    }
  });
}

// ---------- Init Function ----------
function init() {
  yearEl.textContent = new Date().getFullYear();

  // Load state from localStorage
  loadCart();
  try {
    const favArr = JSON.parse(localStorage.getItem(LS_FAV) || '[]');
    favs = new Set(favArr);
    user = JSON.parse(localStorage.getItem(LS_USER) || '{}');
    orders = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
  } catch { 
    favs = new Set();
    user = {};
    orders = [];
  }

  // Build recipe datalist
  recipeList.innerHTML = RECIPES.map(r => `<option value="${r.name}"></option>`).join('');

  setupListeners();

  // First render
  priceValue.textContent = `≤ ${money(filters.priceMax)}`;
  applyFiltersAndRender();
  renderUI();
}

// ---------- Go! ----------
init();
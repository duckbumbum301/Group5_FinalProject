// js/menu.js — Mega Menu helpers
let _productsMegaMenu;
let _productsMenuToggle;
let _navItem;

export function openMegaMenu() {
  const productsMegaMenu = _productsMegaMenu || document.getElementById('productsMegaMenu');
  const productsMenuToggle = _productsMenuToggle || document.getElementById('productsMenuToggle');
  const navItem = _navItem || document.querySelector('.nav-item--dropdown');
  if (!productsMegaMenu || !productsMenuToggle || !navItem) return;
  productsMegaMenu.removeAttribute('hidden');
  // Hiển thị bằng CSS: aria-hidden="false"
  productsMegaMenu.setAttribute('aria-hidden', 'false');
  productsMenuToggle.setAttribute('aria-expanded', 'true');
  navItem.setAttribute('aria-expanded', 'true');
  const firstLink = productsMegaMenu.querySelector('.mega-menu__link');
  if (firstLink) firstLink.focus();
}

export function closeMegaMenu() {
  const productsMegaMenu = _productsMegaMenu || document.getElementById('productsMegaMenu');
  const productsMenuToggle = _productsMenuToggle || document.getElementById('productsMenuToggle');
  const navItem = _navItem || document.querySelector('.nav-item--dropdown');
  if (!productsMegaMenu || !productsMenuToggle || !navItem) return;
  // Trả focus về toggle trước khi ẩn để tránh cảnh báo aria-hidden
  productsMenuToggle.focus();
  productsMegaMenu.setAttribute('hidden', '');
  productsMegaMenu.setAttribute('aria-hidden', 'true');
  productsMenuToggle.setAttribute('aria-expanded', 'false');
  navItem.setAttribute('aria-expanded', 'false');
}

export function toggleMegaMenu() {
  const productsMegaMenu = _productsMegaMenu || document.getElementById('productsMegaMenu');
  if (!productsMegaMenu) return;
  const isOpen = !productsMegaMenu.hasAttribute('hidden');
  if (isOpen) closeMegaMenu();
  else openMegaMenu();
}

export function handleMegaMenuKeydown(e) {
  if (e.key === 'Escape') {
    closeMegaMenu();
    const productsMenuToggle = _productsMenuToggle || document.getElementById('productsMenuToggle');
    if (productsMenuToggle) productsMenuToggle.focus();
  }
}

export function bindMegaMenu(onLinkClick) {
  const productsMenuToggle = document.getElementById('productsMenuToggle');
  const productsMegaMenu = document.getElementById('productsMegaMenu');
  const navItem = document.querySelector('.nav-item--dropdown');
  if (!productsMenuToggle || !productsMegaMenu || !navItem) return;
  if (productsMegaMenu.hasAttribute('data-bound')) return;

  // cache refs for exported helpers
  _productsMenuToggle = productsMenuToggle;
  _productsMegaMenu = productsMegaMenu;
  _navItem = navItem;

  productsMenuToggle.addEventListener('click', toggleMegaMenu);
  productsMenuToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMegaMenu();
    }
  });

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
  productsMegaMenu.addEventListener('keydown', handleMegaMenuKeydown);
  if (typeof onLinkClick === 'function') {
    productsMegaMenu.addEventListener('click', onLinkClick);
  }

  productsMegaMenu.setAttribute('data-bound', 'true');
}
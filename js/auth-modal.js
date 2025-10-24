// js/auth-modal.js — Auth Modal helpers
function setAuthHash(mode){
  try{ const u=new URL(location.href); u.hash = `auth=${mode}`; history.replaceState(null,'',u.toString()); }
  catch{ location.hash = `auth=${mode}`; }
}
function clearAuthHash(){
  try{ const u=new URL(location.href); if((u.hash||'').startsWith('#auth=')){ u.hash=''; history.replaceState(null,'',u.toString()); } }
  catch{ /* optional: location.hash='' */ }
}
function checkAuthHash(){
  const h = location.hash || '';
  if (h.includes('auth=login')) { openAuthModal('login'); return; }
  if (h.includes('auth=register')) { openAuthModal('register'); return; }
}

export function openAuthModal(mode = 'register') {
  const authModal = document.getElementById('authModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (!authModal) return;
  // Hiển thị theo mode: chỉ một form tại một thời điểm
  if (loginForm) loginForm.hidden = mode !== 'login';
  if (registerForm) registerForm.hidden = mode !== 'register';
  authModal.hidden = false;
  // (bỏ) setAuthHash(mode) để tránh tự động mở lại khi quay về Trang chủ
  const target = mode === 'login'
    ? (loginForm?.querySelector('input[name="phone"]') || loginForm?.querySelector('input'))
    : (registerForm?.querySelector('input[name="name"]') || registerForm?.querySelector('input'));
  target?.focus();
}

export function closeAuthModal() {
  const authModal = document.getElementById('authModal');
  if (authModal) authModal.hidden = true;
  clearAuthHash();
}

export function bindAuthModal() {
  const authModal = document.getElementById('authModal');
  const accountMenu = document.getElementById('accountMenu');
  const authOverlay = document.getElementById('authOverlay');
  const authCloseBtn = document.getElementById('authCloseBtn');
  if (!authModal) return;
  if (authModal.hasAttribute('data-bound')) return;

  accountMenu?.addEventListener('click', (e) => {
    const item = e.target.closest('[data-action]');
    if (!item) return;
    const action = item.dataset.action;
    if (action === 'login') { e.preventDefault(); location.href = new URL('../client/login.html', location.href).toString(); }
    if (action === 'register') { e.preventDefault(); location.href = new URL('../client/register.html', location.href).toString(); }
  });

  // Switch-link ngay trong modal (nếu có), điều hướng sang trang riêng
  authModal.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-action]');
    if (!link) return;
    const act = link.dataset.action;
    if (act === 'switch-login') { e.preventDefault(); location.href = new URL('../client/login.html', location.href).toString(); }
    if (act === 'switch-register') { e.preventDefault(); location.href = new URL('../client/register.html', location.href).toString(); }
  });

  const onClose = (e) => { e.preventDefault?.(); closeAuthModal(); };
  authOverlay?.addEventListener('click', onClose);
  authCloseBtn?.addEventListener('click', onClose);
  authModal.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAuthModal(); });

  // (bỏ) Hash routing auto-open; chỉ giữ close để không lưu hash lại
  try { clearAuthHash(); } catch {}

  authModal.setAttribute('data-bound', 'true');
}

// Vô hiệu Hash routing để tránh tự động mở Auth Modal khi quay lại Trang chủ.
// js/auth-modal.js — Auth Modal helpers
export function openAuthModal(mode = 'login') {
  const authModal = document.getElementById('authModal');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (!authModal) return;
  const showLogin = mode === 'login';
  if (tabLogin && tabRegister) {
    tabLogin.setAttribute('aria-selected', String(showLogin));
    tabRegister.setAttribute('aria-selected', String(!showLogin));
  }
  if (loginForm && registerForm) {
    loginForm.hidden = !showLogin;
    registerForm.hidden = showLogin;
  }
  authModal.hidden = false;
}

export function closeAuthModal() {
  const authModal = document.getElementById('authModal');
  if (authModal) authModal.hidden = true;
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
    if (action === 'login') {
      e.preventDefault();
      openAuthModal('login');
    }
    if (action === 'register') {
      e.preventDefault();
      openAuthModal('register');
    }
  });

  const onClose = (e) => { e.preventDefault?.(); closeAuthModal(); };
  authOverlay?.addEventListener('click', onClose);
  authCloseBtn?.addEventListener('click', onClose);
  authModal.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAuthModal(); });

  authModal.setAttribute('data-bound', 'true');
}
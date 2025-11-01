// js/account.js — Trang Tài khoản độc lập
import { apiCurrentUser, apiUpdateProfile, apiChangePassword, apiLogoutUser } from './api.js';

function $(sel){ return document.querySelector(sel); }

async function populateAccountForm(){
  const form = $('#accountForm');
  if(!form) return;
  try {
    const u = await apiCurrentUser();
    if (!u) return;
    if (form.elements.name) form.elements.name.value = u.name || '';
    if (form.elements.email) form.elements.email.value = u.email || '';
    if (form.elements.phone) form.elements.phone.value = u.phone || '';
    if (form.elements.address) form.elements.address.value = u.address || '';
    const addrInline = $('#acctAddrInline');
    if (addrInline) addrInline.textContent = (u.address ? `Địa chỉ mặc định: ${u.address}` : 'Chưa có địa chỉ mặc định.');
  } catch {}
}

async function setAccountSection(section){
  const navs = ['profile','orders','password'];
  navs.forEach((n)=>{
    const navBtn = document.getElementById(`acctNav${n.charAt(0).toUpperCase()+n.slice(1)}`);
    navBtn?.classList.remove('active');
    const panel = document.getElementById(`account${n.charAt(0).toUpperCase()+n.slice(1)}Panel`);
    if (panel) panel.hidden = section !== n;
  });
  const activeBtn = document.getElementById(`acctNav${section.charAt(0).toUpperCase()+section.slice(1)}`);
  activeBtn?.classList.add('active');
  if (section === 'orders') {
    const body = document.getElementById('accountOrdersBody');
    if (body) {
      const mod = await import('./orders.js');
      await mod.renderOrdersInto(body);
    }
  }
}

function bindAccountPage(){
  const acctNavProfile = $('#acctNavProfile');
  const acctNavOrders = $('#acctNavOrders');
  const acctNavSecurity = $('#acctNavSecurity');
  const accountForm = $('#accountForm');
  const accountMsg = $('#accountMsg');
  const changePasswordForm = $('#changePasswordForm');
  const pwMsg = $('#pwMsg');
  const btnLogout = $('#btnLogout');

  acctNavProfile?.addEventListener('click', (e)=>{ e.preventDefault(); setAccountSection('profile'); });
  acctNavOrders?.addEventListener('click', (e)=>{ e.preventDefault(); setAccountSection('orders'); });
  acctNavSecurity?.addEventListener('click', (e)=>{ e.preventDefault(); setAccountSection('password'); });

  accountForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(accountForm);
    const payload = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      address: String(fd.get('address') || ''),
    };
    if (accountMsg) accountMsg.textContent = 'Đang lưu...';
    const res = await apiUpdateProfile(payload);
    if (res.ok) {
      if (accountMsg) accountMsg.textContent = 'Đã lưu thông tin.';
      populateAccountForm();
    } else {
      if (accountMsg) accountMsg.textContent = res.error ?? 'Lưu thất bại, thử lại.';
    }
  });

  changePasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(changePasswordForm);
    const cur = String(fd.get('current') || '');
    const nw = String(fd.get('new') || '');
    const cf = String(fd.get('confirm') || '');
    if (pwMsg) pwMsg.textContent = '';
    if (!cur) { if (pwMsg) pwMsg.textContent = 'Vui lòng nhập mật khẩu hiện tại.'; return; }
    if (nw.length < 6) { if (pwMsg) pwMsg.textContent = 'Mật khẩu mới tối thiểu 6 ký tự.'; return; }
    if (nw !== cf) { if (pwMsg) pwMsg.textContent = 'Xác nhận mật khẩu chưa khớp.'; return; }
    if (pwMsg) pwMsg.textContent = 'Đang đổi mật khẩu...';
    const res = await apiChangePassword({ oldPassword: cur, newPassword: nw });
    if (res?.ok) {
      if (pwMsg) pwMsg.textContent = 'Đổi mật khẩu thành công.';
      try { changePasswordForm.reset(); } catch {}
    } else {
      if (pwMsg) pwMsg.textContent = res?.message || 'Đổi mật khẩu thất bại.';
    }
  });

  btnLogout?.addEventListener('click', async () => {
    await apiLogoutUser();
    location.href = new URL('../client/login.html', location.href).toString();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Yêu cầu đăng nhập; nếu chưa đăng nhập thì chuyển sang trang Login
  const u = await apiCurrentUser();
  if (!u) {
    location.replace(new URL('../client/login.html', location.href).toString());
    return;
  }
  bindAccountPage();
  await populateAccountForm();
  await setAccountSection('profile');
});
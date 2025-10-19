/* ==========================================================================
   VỰA VUI VẺ — AUTH CORE (dùng chung cho mọi trang của phần client)
   - Lưu/đọc người dùng & phiên từ localStorage
   - Helpers validate SĐT, email, điều hướng
   - BỔ SUNG: tự động quay lại trang trước (vvv_return_to) sau khi đăng nhập
   ========================================================================== */

const LS_USERS = "client_users_v1";
const LS_SESSION = "client_session_v1";

/* ---------- Helpers DOM & Điều hướng ---------- */
const $ = (s, r = document) => r.querySelector(s);
function go(href) {
  location.href = href;
}

/* ---------- Chuẩn hóa & validate ---------- */
const normalizePhoneVN = (p) => (p || "").replace(/\D/g, "");
const validVNPhone = (p) => /^0\d{9}$/.test(p); // 10 số, bắt đầu 0
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e); // đơn giản

/* ---------- Storage người dùng ---------- */
function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(LS_USERS)) || [];
  } catch {
    return [];
  }
}
function saveUsers(list) {
  localStorage.setItem(LS_USERS, JSON.stringify(list));
}

/* ---------- Phiên đăng nhập ---------- */
function setSession(sess) {
  localStorage.setItem(LS_SESSION, JSON.stringify(sess));
}
function getSession() {
  try {
    return JSON.parse(localStorage.getItem(LS_SESSION));
  } catch {
    return null;
  }
}
function clearSession() {
  localStorage.removeItem(LS_SESSION);
}

/* ====== Seed 1 tài khoản mặc định (phục vụ demo) ====== */
(function seedDefaultUser() {
  const DEFAULT_USER = {
    name: "Trần Duy Thanh",
    dob: "1999-09-09",
    email: "tranduythanh@gmail.com",
    phone: "0912345678",
    password: "123456",
    createdAt: new Date().toISOString(),
  };
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem(LS_USERS)) || [];
  } catch {}
  const exists = users.some(
    (u) => u.phone === DEFAULT_USER.phone || u.email === DEFAULT_USER.email
  );
  if (!exists) {
    users.push(DEFAULT_USER);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    console.log("[SEED] Đã tạo tài khoản mặc định:", DEFAULT_USER.phone);
  }
})();

/* ====== BỔ SUNG: Tự động quay lại trang trước sau khi đăng nhập ======
   - Sau khi form đăng nhập của bạn gọi setSession(...), key LS_SESSION sẽ có giá trị.
   - Đoạn bên dưới sẽ kiểm tra: nếu có session và có 'vvv_return_to' thì redirect.
*/
(function returnToPreviousIfJustLoggedIn() {
  try {
    const sess = getSession();
    const ret = localStorage.getItem("vvv_return_to");
    if (sess && ret) {
      localStorage.removeItem("vvv_return_to");
      location.href = ret;
    }
  } catch {}
})();

/* Cũng lắng nghe thay đổi từ tab khác (hiếm khi cần) */
window.addEventListener("storage", (e) => {
  if (e.key === LS_SESSION && e.newValue) {
    try {
      const ret = localStorage.getItem("vvv_return_to");
      if (ret) {
        localStorage.removeItem("vvv_return_to");
        location.href = ret;
      }
    } catch {}
  }
});

// Export (nếu trang login dùng từ script inline)
window.vvvAuth = {
  loadUsers,
  saveUsers,
  setSession,
  getSession,
  clearSession,
  validVNPhone,
  emailOk,
  go,
};

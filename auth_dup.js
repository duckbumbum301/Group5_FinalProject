/* ==========================================================================
   VỰA VUI VẺ — AUTH CORE (dùng chung cho mọi trang)
   Chức năng:
   - Lưu/đọc người dùng & phiên từ localStorage
   - Helpers validate SĐT, email, điều hướng
   - Không phụ thuộc backend
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
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e); // đơn giản, đủ dùng demo

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
/*===========================*/
function clearSession() {
  localStorage.removeItem(LS_SESSION);
}
/*=============login tk mac dinh==============*/
(function seedDefaultUser() {
  // Bạn có thể đổi thông tin bên dưới
  const DEFAULT_USER = {
    name: "Trần Duy Thanh",
    dob: "1999-09-09",
    email: "tranduythanh@gmail.com",
    phone: "0912345678", // ← số điện thoại để đăng nhập
    password: "123456", // ← mật khẩu để đăng nhập
    createdAt: new Date().toISOString(),
  };

  // Đọc danh sách user hiện có
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem("client_users_v1")) || [];
  } catch {}

  // Nếu chưa có thì thêm (so khớp theo SĐT hoặc email)
  const exists = users.some(
    (u) => u.phone === DEFAULT_USER.phone || u.email === DEFAULT_USER.email
  );
  if (!exists) {
    users.push(DEFAULT_USER);
    localStorage.setItem("client_users_v1", JSON.stringify(users));
    console.log("[SEED] Đã tạo tài khoản mặc định:", DEFAULT_USER.phone);
  }
})();

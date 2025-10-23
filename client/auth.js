/* ==========================================================================
   VỰA VUI VẺ — AUTH CORE (dùng chung cho mọi trang của phần client)
   - Lưu/đọc người dùng & phiên từ localStorage
   - Helpers validate SĐT, email, điều hướng
   - BỔ SUNG: tự động quay lại trang trước (vvv_return_to) sau khi đăng nhập
   ========================================================================== */

const LS_USERS = "vvv_users_v1";
const LS_SESSION = "vvv_session_v1";
const OLD_LS_USERS = "client_users_v1";
const OLD_LS_SESSION = "client_session_v1";

/* ---------- Helpers DOM & Điều hướng ---------- */
const $ = (s, r = document) => r.querySelector(s);
function go(href) {
  try { location.href = new URL(href, location.href).toString(); }
  catch { location.href = href; }
}

/* ---------- Chuẩn hóa & validate ---------- */
const normalizePhoneVN = (p) => (p || "").replace(/\D/g, "");
const validVNPhone = (p) => /^0\d{9}$/.test(p); // 10 số, bắt đầu 0
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e); // đơn giản

/* ---------- Migration keys cũ -> mới (an toàn) ---------- */
(function migrateKeys() {
  try {
    const newUsersRaw = localStorage.getItem(LS_USERS);
    const oldUsersRaw = localStorage.getItem(OLD_LS_USERS);
    if (!newUsersRaw && oldUsersRaw) {
      localStorage.setItem(LS_USERS, oldUsersRaw);
    }
    const newSessRaw = localStorage.getItem(LS_SESSION);
    const oldSessRaw = localStorage.getItem(OLD_LS_SESSION);
    if (!newSessRaw && oldSessRaw) {
      localStorage.setItem(LS_SESSION, oldSessRaw);
      // không xóa ngay key cũ để tránh race condition giữa các tab
    }
  } catch {}
})();

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
  try {
    localStorage.removeItem(LS_SESSION);
    localStorage.removeItem(OLD_LS_SESSION);
    // Xóa thêm key rất cũ nếu còn
    localStorage.removeItem('vvv_session');
    // Đảm bảo luồng Account: lần đăng nhập mới phải xem profile trước khi logout
    localStorage.removeItem('vvv_has_seen_profile');
  } catch {}
}

/* ====== Seed 1 tài khoản mặc định (phục vụ demo) ====== */
(function seedDefaultUser() {
  try {
    const users = loadUsers();
    const idx = users.findIndex((u) => (u.phone || "") === "0906760495");
    if (idx === -1) {
      users.push({
        id: "client-seed-0906760495",
        name: "Tài khoản Demo",
        dob: "1990-01-01",
        email: "",
        phone: "0906760495",
        password: "123123",
        address: "",
        createdAt: new Date().toISOString(),
      });
      saveUsers(users);
      console.log("[SEED] Đã tạo tài khoản mặc định:", "0906760495");
    } else {
      users[idx] = {
        ...users[idx],
        name: users[idx].name || "Tài khoản Demo",
        password: "123123",
      };
      saveUsers(users);
      console.log("[SEED] Đã cập nhật tài khoản demo:", users[idx].phone);
    }
  } catch {}
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

/* Relax: do not enforce localhost:8080; support any dev host/port */
(function relaxOrigin(){
  // No-op to avoid redirect loops or connection refused when server runs on other ports
})();

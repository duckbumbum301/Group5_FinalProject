// app.js — Vựa Vui Vẻ Back Office (3-file SPA)
// ----------------------------------------------
// Light, self-contained app with mock auth, seeding, router, views, CSV export.
// Data volume kept moderate (~1.5k orders) for snappy UX. Stored in localStorage.

// Import API module
import * as API from "./api.js";

const LS = {
  session: "vvv_session",
  db: "vvv_db_v1",
  audit: "vvv_audit_v1",
};

// ---------- utils ----------
const fmt = {
  money: (v) =>
    (v ?? 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }),
  date: (d) => new Date(d).toLocaleDateString("vi-VN"),
  iso: (d = new Date()) => new Date(d).toISOString(),
};
const el = (sel, root = document) => root.querySelector(sel);
const els = (sel, root = document) => [...root.querySelectorAll(sel)];
function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
const toast = (msg) => {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  el("#toastRoot").appendChild(t);
  setTimeout(() => t.remove(), 2500);
};
const exportCSV = (rows, filename = "export.csv") => {
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
};
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ---------- auth ----------
const auth = {
  current() {
    try {
      return JSON.parse(localStorage.getItem(LS.session));
    } catch {
      return null;
    }
  },
  login({ email, role }) {
    const s = { email, role, ts: Date.now() };
    localStorage.setItem(LS.session, JSON.stringify(s));
    audit.log("login", s.email);
    return s;
  },
  logout() {
    const s = this.current();
    if (s) audit.log("logout", s.email);
    localStorage.removeItem(LS.session);
  },
  guard() {
    if (!this.current()) {
      showLogin(true);
      location.hash = "#/login";
    }
  },
};

// ---------- audit ----------
const audit = {
  log(action, who, meta = {}) {
    const items = this.list();
    items.unshift({
      id: crypto.randomUUID(),
      action,
      who,
      meta,
      at: fmt.iso(),
    });
    localStorage.setItem(LS.audit, JSON.stringify(items.slice(0, 500))); // keep 500
  },
  list() {
    try {
      return JSON.parse(localStorage.getItem(LS.audit)) || [];
    } catch {
      return [];
    }
  },
};

// ---------- DB (mock) ----------
const CATEGORIES = [
  "Rau củ",
  "Trái cây",
  "Thịt cá",
  "Đồ khô",
  "Đồ uống",
  "Gia vị",
  "Đồ gia dụng",
  "Đồ ngọt",
];
function loadDB() {
  try {
    return JSON.parse(localStorage.getItem(LS.db));
  } catch {
    return null;
  }
}
function saveDB(db) {
  localStorage.setItem(LS.db, JSON.stringify(db));
}
function seedDB() {
  // small but meaningful dataset
  const rnd = (arr) => arr[rand(0, arr.length - 1)];
  const products = [];
  for (let i = 1; i <= 300; i++) {
    const cat = rnd(CATEGORIES);
    const price = rand(10000, 250000);
    products.push({
      id: "P" + String(i).padStart(4, "0"),
      name: `${cat} ${i}`,
      category: cat,
      price,
      cost: Math.round(price * 0.65 + rand(-3000, 3000)),
      stock: rand(0, 200),
      status: rand(0, 1) ? "active" : "inactive",
      image: "https://dummyimage.com/80x80/223/fff&text=VVV",
    });
  }
  const customers = [];
  for (let i = 1; i <= 500; i++) {
    customers.push({
      id: "C" + i.toString().padStart(4, "0"),
      name: `Khách ${i}`,
      email: `khach${i}@mail.com`,
      tier: rnd(["Bronze", "Silver", "Gold"]),
    });
  }
  const orders = [];
  const channels = ["Web", "App"];
  const statusList = ["Pending", "Paid", "Cancelled", "Refunded"];
  const today = new Date();
  for (let i = 1; i <= 1500; i++) {
    const created = new Date(today);
    created.setDate(today.getDate() - rand(0, 364));
    const n = rand(1, 5);
    const items = [];
    let amount = 0;
    for (let j = 0; j < n; j++) {
      const p = rnd(products);
      const qty = rand(1, 4);
      items.push({ sku: p.id, name: p.name, price: p.price, qty });
      amount += p.price * qty;
    }
    const status = rnd(
      statusList
        .map((s) => s)
        .flatMap((s) =>
          s === "Pending" && rand(0, 10) < 2 ? ["Paid", "Pending"] : [s]
        )
    );
    orders.push({
      id: "O" + i.toString().padStart(5, "0"),
      customer: rnd(customers).id,
      items,
      amount,
      discount: rand(0, 1) ? rand(5000, 20000) : 0,
      tax: Math.round(amount * 0.08),
      shipping: rand(0, 1) ? 15000 : 0,
      channel: rnd(channels),
      status,
      createdAt: created.toISOString(),
      history: [{ at: created.toISOString(), status }],
    });
  }
  const users = [
    { id: "U001", email: "admin@vuavuive.vn", role: "Admin" },
    { id: "U002", email: "manager@vuavuive.vn", role: "Manager" },
    { id: "U003", email: "staff@vuavuive.vn", role: "Staff" },
  ];
  const db = { products, customers, orders, users };
  saveDB(db);
  audit.log("seed", "system", {
    orders: orders.length,
    products: products.length,
  });
  return db;
}
const DB = { get: () => loadDB() || seedDB(), set: saveDB };

// ---------- router ----------
const routes = {};
function route(path, handler) {
  routes[path] = handler;
}
function go(path) {
  location.hash = path;
}
window.addEventListener("hashchange", () => render());

function updateNavActive() {
  const hash = location.hash || "#/dashboard";
  els(".sidebar .nav-item").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === hash);
  });
}

// ---------- login screen toggle ----------
function showLogin(show) {
  el("#loginScreen").style.display = show ? "flex" : "none";
  el("#app").style.display = show ? "none" : "block";
}

// ---------- views ----------
route("#/login", () => renderLogin());
route("", () => go("#/dashboard"));
route("#/dashboard", () => renderDashboard());
route("#/orders", () => renderOrders());
route("#/products", () => renderProducts());
route("#/reports", () => renderReports());
route("#/audit", () => renderAudit());
route("#/users", () => renderUsers());

function render() {
  const hash = location.hash || "#/dashboard";
  const sess = auth.current();
  // Show/hide login
  if (!sess) {
    if (hash !== "#/login") {
      go("#/login");
    }
    showLogin(true);
    routes["#/login"] && routes["#/login"]();
    return;
  }
  showLogin(false);
  // Badge + RBAC UI
  if (sess) {
    el("#userBadge").textContent = `${sess.email} · ${sess.role}`;
  }
  els(".admin-only").forEach(
    (a) => (a.style.display = sess?.role === "Admin" ? "block" : "none")
  );
  (routes[hash] || routes["#/dashboard"])();
  updateNavActive();
}

function renderLogin() {
  showLogin(true);
  const form = document.querySelector("#loginForm");
  form.onsubmit = (e) => {
    e.preventDefault(); // chặn submit gốc để tự kiểm tra
    const data = Object.fromEntries(new FormData(form).entries());

    // kiểm tra tối thiểu (vì đã novalidate)
    if (!data.email || !data.password) {
      toast("Vui lòng nhập email và mật khẩu");
      return;
    }

    // login mock + lưu session
    auth.login({ email: data.email, role: data.role });
    toast("Đăng nhập thành công");
    showLogin(false);
    go("#/dashboard");
  };
}

function card(title, body) {
  return `<div class="card"><h2>${title}</h2>${body}</div>`;
}

async function renderDashboard() {
  auth.guard();

  // Load real products from API, keep mock data for orders
  let products = [];
  try {
    products = await API.productsAPI.getAll();
  } catch (error) {
    console.error("Error loading products:", error);
    toast("Không thể tải sản phẩm từ API");
  }

  const db = DB.get();
  db.products = products; // Replace mock products with real ones

  let days = +(localStorage.getItem("vvv_dash_days") || 30);
  const today = new Date();
  let end = new Date(today);
  let start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const fromStr = localStorage.getItem("vvv_dash_from");
  const toStr = localStorage.getItem("vvv_dash_to");
  if (fromStr && toStr) {
    const s = new Date(fromStr);
    const e = new Date(toStr);
    if (!isNaN(s) && !isNaN(e) && s <= e) {
      start = s;
      end = e;
      days = Math.max(1, Math.round((e - s) / (24 * 3600 * 1000)) + 1);
    }
  }
  // Series revenue by selected range
  const inRange = (o) => {
    const d = new Date(o.createdAt);
    return d >= start && d <= end;
  };
  const ordersInRange = db.orders.filter(inRange);
  const map = new Map();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    map.set(d.toDateString(), 0);
  }
  ordersInRange.forEach((o) => {
    const d = new Date(o.createdAt).toDateString();
    if (map.has(d))
      map.set(d, map.get(d) + (o.amount - o.discount + o.tax + o.shipping));
  });
  const labels = [...map.keys()].map((d) =>
    new Date(d).toLocaleDateString("vi-VN")
  );
  const series = [...map.values()];

  // KPIs
  const todayStr = today.toDateString();
  const month = today.getMonth();
  let revToday = 0,
    orderToday = 0,
    refundRate = 0,
    aov = 0;
  let sumMonth = 0,
    cntMonth = 0;
  db.orders.forEach((o) => {
    const amt = o.amount - o.discount + o.tax + o.shipping;
    if (new Date(o.createdAt).toDateString() === todayStr) {
      revToday += amt;
      orderToday++;
    }
    if (new Date(o.createdAt).getMonth() === month) {
      sumMonth += amt;
      cntMonth++;
    }
  });
  aov = cntMonth ? sumMonth / cntMonth : 0;
  refundRate =
    (db.orders.filter((o) => o.status === "Refunded").length /
      db.orders.length) *
    100;

  // Category share (by selected range)
  const share = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  ordersInRange.forEach((o) => {
    o.items.forEach((it) => {
      const p = db.products.find((x) => x.id === it.sku);
      if (p) share[p.category] += it.price * it.qty;
    });
  });

  el("#view").innerHTML = `
    <div class="grid kpi">
      ${card(
        "Doanh thu hôm nay",
        `<div class="kpi"><span class="val">${fmt.money(
          revToday
        )}</span><span class="badge">Hôm nay</span></div>`
      )}
      ${card(
        "Đơn hàng hôm nay",
        `<div class="kpi"><span class="val">${orderToday}</span></div>`
      )}
      ${card(
        "AOV (tháng)",
        `<div class="kpi"><span class="val">${fmt.money(aov)}</span></div>`
      )}
      ${card(
        "Tỷ lệ hoàn",
        `<div class="kpi"><span class="val">${refundRate.toFixed(
          1
        )}%</span></div>`
      )}
    </div>
    <div class="row" style="margin:8px 0 4px 0">
      <div class="seg" id="rangeSeg">
        <button data-d="7" class="${
          (localStorage.getItem("vvv_dash_from") ? false : days === 7)
            ? "active"
            : ""
        }">7 ngày</button>
        <button data-d="30" class="${
          (localStorage.getItem("vvv_dash_from") ? false : days === 30)
            ? "active"
            : ""
        }">30 ngày</button>
        <button data-d="90" class="${
          (localStorage.getItem("vvv_dash_from") ? false : days === 90)
            ? "active"
            : ""
        }">90 ngày</button>
      </div>
      <div class="right" style="display:flex; gap:6px; align-items:center">
        <input type="date" id="dFrom" value="${
          fromStr || ""
        }" autocomplete="off"/>
        <span>→</span>
        <input type="date" id="dTo" value="${toStr || ""}" autocomplete="off"/>
        <button class="btn small" id="applyRange">Áp dụng</button>
        <button class="btn small btn-outline" id="resetRange">Mặc định</button>
      </div>
    </div>
    <div class="grid cols-2" style="margin-top:8px">
      ${card(
        `Doanh thu ${days} ngày`,
        `<div class=\"skeleton skeleton-row\" style=\"height:180px\" id=\"sk1\"></div><canvas id=\"rev30\" style=\"display:none\"></canvas>`
      )}
      ${card("Cơ cấu theo danh mục", `<canvas id="shareCat"></canvas>`)}
    </div>
    ${card(
      "Top 10 sản phẩm",
      `
      <table class="table" id="topTable">
        <thead><tr><th>SKU</th><th>Tên</th><th>Danh mục</th><th>Doanh thu</th></tr></thead>
        <tbody>
          ${Array.from({ length: 6 })
            .map(
              () =>
                `<tr><td colspan="4"><div class="skeleton skeleton-row"></div></td></tr>`
            )
            .join("")}
        </tbody>
      </table>`
    )}
  `;

  // Top products (by selected range)
  const revBySku = {};
  ordersInRange.forEach((o) => {
    o.items.forEach((it) => {
      const amt = it.price * it.qty;
      revBySku[it.sku] = (revBySku[it.sku] || 0) + amt;
    });
  });
  const top = Object.entries(revBySku)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([sku, amt]) => {
      const p = db.products.find((x) => x.id === sku);
      return `<tr><td>${sku}</td><td>${p?.name || sku}</td><td>${
        p?.category || "-"
      }</td><td>${fmt.money(amt)}</td></tr>`;
    })
    .join("");
  el("#topTable tbody").innerHTML = top;

  // Charts
  if (window.Chart) {
    const cv = el("#rev30");
    new Chart(cv, {
      type: "line",
      data: {
        labels,
        datasets: [{ data: series, label: "Revenue", tension: 0.25 }],
      },
      options: { plugins: { legend: { display: false } } },
    });
    el("#sk1")?.remove();
    cv.style.display = "block";
    new Chart(el("#shareCat"), {
      type: "doughnut",
      data: {
        labels: Object.keys(share),
        datasets: [{ data: Object.values(share) }],
      },
      options: {},
    });
  }

  // range selector
  els("#rangeSeg button").forEach(
    (b) =>
      (b.onclick = () => {
        localStorage.setItem("vvv_dash_days", b.dataset.d);
        localStorage.removeItem("vvv_dash_from");
        localStorage.removeItem("vvv_dash_to");
        renderDashboard();
      })
  );
  el("#applyRange").onclick = () => {
    const f = el("#dFrom").value,
      t = el("#dTo").value;
    if (!f || !t) {
      toast("Chọn đủ từ ngày/đến ngày");
      return;
    }
    localStorage.setItem("vvv_dash_from", f);
    localStorage.setItem("vvv_dash_to", t);
    renderDashboard();
  };
  el("#resetRange").onclick = () => {
    localStorage.removeItem("vvv_dash_from");
    localStorage.removeItem("vvv_dash_to");
    renderDashboard();
  };
}

async function renderOrders() {
  auth.guard();
  const view = el("#view");
  view.innerHTML = `
    <div class="card">
      <div class="row controls">
        <input id="q" placeholder="Tìm đơn (#id, email, phone)" autocomplete="off"/>
        <input id="from" type="date" autocomplete="off" />
        <span>→</span>
        <input id="to" type="date" autocomplete="off" />
        <select id="st">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="preparing">Đang chuẩn bị</option>
          <option value="ready">Sẵn sàng</option>
          <option value="pickup">Shipper nhận</option>
          <option value="delivering">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
          <option value="returned">Đã trả</option>
        </select>
        <button class="btn right" id="btnCSV">Export CSV</button>
      </div>
      <div style="max-height:60vh; overflow:auto">
        <table class="table" id="tbl">
          <thead><tr>
            <th>Mã đơn</th><th>Khách hàng</th><th>Điện thoại</th><th>Trạng thái</th><th>Thanh toán</th><th>Ngày</th><th class="right">Tổng tiền</th><th>Thao tác</th>
          </tr></thead>
          <tbody><tr><td colspan="8" class="muted">Đang tải...</td></tr></tbody>
        </table>
      </div>
      <div class="row controls"><button class="btn" id="prev">‹</button><span id="pageInfo" class="muted"></span><button class="btn" id="next">›</button></div>
    </div>
  `;

  const uiKey = "vvv_orders_ui";
  const ui = (() => {
    try {
      return JSON.parse(localStorage.getItem(uiKey)) || {};
    } catch {
      return {};
    }
  })();
  let page = ui.page || 1,
    per = 20,
    q = ui.q || "",
    st = ui.st || "",
    from = ui.from || "",
    to = ui.to || "";

  // Hydrate controls
  el("#q").value = q;
  el("#st").value = st;
  el("#from").value = from;
  el("#to").value = to;

  // Load orders from API
  let allOrders = [];
  try {
    allOrders = await API.ordersAPI.getAll();
  } catch (error) {
    console.error("Failed to load orders:", error);
    toast("Không thể tải đơn hàng");
  }

  function filtered() {
    return allOrders
      .filter((o) => {
        // Support both old and new schema
        const user = o.user || {};
        const customerName = o.customerName || user.name || "";
        const customerPhone = o.phone || user.phone || "";
        const customerEmail = o.email || user.email || "";

        const text =
          `${o.id} ${customerName} ${customerPhone} ${customerEmail}`.toLowerCase();

        // Support both status fields
        const orderStatus = o.status || o.delivery_status || "";
        const inSt = !st || orderStatus === st;
        const inQ = !q || text.includes(q.toLowerCase());

        // Support both date fields
        const orderDate = o.createdAt || o.created_at;
        const d = new Date(orderDate).toISOString().slice(0, 10);
        const inDate = (!from || d >= from) && (!to || d <= to);
        return inQ && inSt && inDate;
      })
      .sort((a, b) => {
        const dateA = a.createdAt || a.created_at;
        const dateB = b.createdAt || b.created_at;
        return new Date(dateB) - new Date(dateA);
      });
  }

  function renderPage() {
    const list = filtered();
    const maxPage = Math.max(1, Math.ceil(list.length / per));
    page = Math.min(page, maxPage);
    localStorage.setItem(uiKey, JSON.stringify({ page, q, st, from, to }));

    const rows = list
      .slice((page - 1) * per, page * per)
      .map((o) => {
        // Support both old and new schema
        const user = o.user || {};
        const customerName = o.customerName || user.name || "N/A";
        const customerPhone = o.phone || user.phone || "N/A";
        // Normalize status to lowercase
        const orderStatus = (
          o.status ||
          o.delivery_status ||
          "pending"
        ).toLowerCase();
        const paymentStatus =
          o.payment_status || (o.paymentMethod === "cod" ? "pending" : "paid");
        const orderTotal = o.totalAmount || o.total || 0;
        const orderDate = o.createdAt || o.created_at;

        const statusLabels = {
          pending: "Chờ xử lý",
          confirmed: "Đã xác nhận",
          placed: "Đã đặt",
          preparing: "Đang chuẩn bị",
          ready: "Sẵn sàng",
          pickup: "Shipper nhận",
          delivering: "Đang giao",
          delivered: "Đã giao",
          cancelled: "Đã hủy",
          returned: "Đã trả",
        };
        const paymentLabels = {
          pending: "Chờ thanh toán",
          paid: "Đã thanh toán",
          cod: "COD",
          banking: "Chuyển khoản",
        };
        return `<tr>
        <td><a href="javascript:void(0)" data-id="${o.id}" class="lnk">${
          o.id
        }</a></td>
        <td>${customerName}</td>
        <td>${customerPhone}</td>
        <td><span class="status ${orderStatus}">${
          statusLabels[orderStatus] || orderStatus
        }</span></td>
        <td><span class="tag">${
          paymentLabels[paymentStatus] || paymentStatus
        }</span></td>
        <td>${fmt.date(orderDate)}</td>
        <td class="right">${fmt.money(orderTotal)}</td>
        <td>
          ${
            orderStatus === "pending" || orderStatus === "placed"
              ? `<button class="btn small" data-confirm="${o.id}">Xác nhận</button>`
              : ""
          }
          ${
            orderStatus === "confirmed" || orderStatus === "preparing"
              ? `<button class="btn small" data-ready="${o.id}">Sẵn sàng</button>`
              : ""
          }
          ${
            orderStatus === "ready"
              ? `<button class="btn small" data-pickup="${o.id}">Shipper nhận</button>`
              : ""
          }
          ${
            orderStatus === "pickup"
              ? `<button class="btn small" data-deliver="${o.id}">Đang giao</button>`
              : ""
          }
          ${
            orderStatus === "delivering"
              ? `<button class="btn small" data-complete="${o.id}">Hoàn tất</button>`
              : ""
          }
          ${
            ["pending", "placed", "confirmed", "preparing"].includes(
              orderStatus
            )
              ? `<button class="btn small btn-outline" data-cancel="${o.id}">Hủy</button>`
              : ""
          }
        </td>
      </tr>`;
      })
      .join("");

    el("#tbl tbody").innerHTML =
      rows || `<tr><td colspan="8" class="muted">Không có đơn hàng</td></tr>`;
    el(
      "#pageInfo"
    ).textContent = `Trang ${page}/${maxPage} • ${list.length} đơn`;

    // Row click to view detail
    els(".lnk", el("#tbl")).forEach(
      (a) => (a.onclick = () => showOrderDetail(a.dataset.id))
    );

    // Status update buttons
    const sess = auth.current();
    els("[data-confirm]").forEach(
      (b) =>
        (b.onclick = async () => {
          if (sess.role === "Staff")
            return toast("Staff không được cập nhật đơn");
          await updateOrderStatus(b.dataset.confirm, "preparing");
        })
    );
    els("[data-ready]").forEach(
      (b) =>
        (b.onclick = async () => {
          if (sess.role === "Staff")
            return toast("Staff không được cập nhật đơn");
          await updateOrderStatus(b.dataset.ready, "ready");
        })
    );
    els("[data-pickup]").forEach(
      (b) =>
        (b.onclick = async () => {
          await updateOrderStatus(b.dataset.pickup, "pickup");
        })
    );
    els("[data-deliver]").forEach(
      (b) =>
        (b.onclick = async () => {
          await updateOrderStatus(b.dataset.deliver, "delivering");
        })
    );
    els("[data-complete]").forEach(
      (b) =>
        (b.onclick = async () => {
          await updateOrderStatus(b.dataset.complete, "delivered");
        })
    );
    els("[data-cancel]").forEach(
      (b) =>
        (b.onclick = async () => {
          if (sess.role === "Staff") return toast("Staff không được hủy đơn");
          if (!confirm("Xác nhận hủy đơn?")) return;
          await updateOrderStatus(b.dataset.cancel, "cancelled");
        })
    );
  }

  async function updateOrderStatus(orderId, newStatus) {
    const sess = auth.current();
    try {
      await API.ordersAPI.updateStatus(orderId, newStatus, sess.email);
      toast("Đã cập nhật trạng thái");
      allOrders = await API.ordersAPI.getAll();
      renderPage();
    } catch (error) {
      console.error("Failed to update order:", error);
      toast("Không thể cập nhật đơn hàng");
    }
  }

  async function showOrderDetail(id) {
    try {
      const o = await API.ordersAPI.getById(id);
      if (!o) {
        toast("Không tìm thấy đơn hàng");
        return;
      }

      // Support both old and new schema
      const user = o.user || {};
      const customerName = o.customerName || user.name || "N/A";
      const customerPhone = o.phone || user.phone || "N/A";
      const customerAddress = o.address || user.address || "N/A";
      const customerEmail = o.email || user.email || "";
      const orderDate = o.createdAt || o.created_at;
      const paymentMethod = o.paymentMethod || o.payment || "COD";
      const orderNote = o.note || "";

      // Handle items - support both formats
      let items = o.items || [];
      let itemRows = "";

      if (Array.isArray(items)) {
        // Old schema: items is array of {productId, productName, quantity, price, subtotal}
        itemRows = items
          .map((item) => {
            return `<tr>
            <td>${item.productId}</td>
            <td>${item.productName || "N/A"}</td>
            <td>${item.quantity}</td>
            <td>${fmt.money(item.price)}</td>
            <td>${fmt.money(item.subtotal || item.quantity * item.price)}</td>
          </tr>`;
          })
          .join("");
      } else {
        // New schema: items is object {productId: quantity}
        const productIds = Object.keys(items);
        const products = await Promise.all(
          productIds.map(async (pid) => {
            try {
              return await API.productsAPI.getById(pid);
            } catch {
              return { id: pid, name: "Sản phẩm không tìm thấy", price: 0 };
            }
          })
        );
        const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

        itemRows = Object.entries(items)
          .map(([pid, qty]) => {
            const prod = productMap[pid];
            const price = prod?.price || 0;
            return `<tr>
            <td>${pid}</td>
            <td>${prod?.name || "N/A"}</td>
            <td>${qty}</td>
            <td>${fmt.money(price)}</td>
            <td>${fmt.money(qty * price)}</td>
          </tr>`;
          })
          .join("");
      }

      const trackingHtml = (o.tracking || [])
        .map((t) => {
          return `<div class="row">
          <span>${t.label}</span>
          <span class="muted small">${
            t.at ? fmt.date(t.at) : "Chưa thực hiện"
          }</span>
        </div>`;
        })
        .join("");

      const subtotal = o.subtotal || o.totalAmount || o.total || 0;
      const discount = o.discount || 0;
      const shippingFee = o.shipping_fee || o.shippingFee || 0;
      const total =
        o.totalAmount || o.total || subtotal + shippingFee - discount;

      el("#view").innerHTML = `
        ${card(
          "Chi tiết đơn " + id,
          `
          <div class="row"><strong>Khách hàng:</strong>&nbsp;${customerName}</div>
          ${
            customerEmail
              ? `<div class="row"><strong>Email:</strong>&nbsp;${customerEmail}</div>`
              : ""
          }
          <div class="row"><strong>Điện thoại:</strong>&nbsp;${customerPhone}</div>
          <div class="row"><strong>Địa chỉ:</strong>&nbsp;${customerAddress}</div>
          <div class="muted small">Ngày: ${fmt.date(
            orderDate
          )} • Thanh toán: ${paymentMethod}</div>
          ${
            orderNote
              ? `<div class="muted small">Ghi chú: ${orderNote}</div>`
              : ""
          }
          
          <h4 style="margin-top:16px">Sản phẩm</h4>
          <table class="table">
            <thead><tr><th>ID</th><th>Tên</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          
          <div class="row" style="justify-content:flex-end; gap:16px; margin-top:8px">
            <div>Tạm tính: <strong>${fmt.money(subtotal)}</strong></div>
            <div>Giảm giá: <strong>${fmt.money(discount)}</strong></div>
            <div>Vận chuyển: <strong>${fmt.money(shippingFee)}</strong></div>
            <div>Tổng: <strong>${fmt.money(total)}</strong></div>
          </div>

          ${
            trackingHtml
              ? `<h4 style="margin-top:16px">Trạng thái giao hàng</h4>${trackingHtml}`
              : ""
          }

          <div class="row" style="margin-top:16px; gap:8px">
            <button class="btn right" id="back">← Quay lại</button>
          </div>
        `
        )}
      `;
      el("#back").onclick = () => renderOrders();
    } catch (error) {
      console.error("Failed to load order detail:", error);
      toast("Không thể tải chi tiết đơn hàng");
    }
  }

  // Bindings
  el("#q").oninput = debounce((e) => {
    q = e.target.value.trim().toLowerCase();
    page = 1;
    renderPage();
  }, 250);
  el("#st").onchange = (e) => {
    st = e.target.value;
    page = 1;
    renderPage();
  };
  el("#from").onchange = (e) => {
    from = e.target.value;
    page = 1;
    renderPage();
  };
  el("#to").onchange = (e) => {
    to = e.target.value;
    page = 1;
    renderPage();
  };
  el("#prev").onclick = () => {
    if (page > 1) {
      page--;
      renderPage();
    }
  };
  el("#next").onclick = () => {
    const list = filtered();
    const maxPage = Math.max(1, Math.ceil(list.length / per));
    if (page < maxPage) {
      page++;
      renderPage();
    }
  };
  el("#btnCSV").onclick = () => {
    const list = filtered();
    const rows = [
      [
        "Mã đơn",
        "Khách hàng",
        "Điện thoại",
        "Trạng thái",
        "Thanh toán",
        "Ngày",
        "Tổng tiền",
      ],
      ...list.map((o) => {
        const user = o.user || {};
        return [
          o.id,
          user.name || "N/A",
          user.phone || "N/A",
          o.delivery_status,
          o.payment_status,
          fmt.date(o.created_at),
          o.total,
        ];
      }),
    ];
    exportCSV(rows, "orders.csv");
  };

  renderPage();
}

function renderProducts() {
  auth.guard();

  el("#view").innerHTML = `
    <div class="card">
      <div class="row controls">
        <input id="pq" placeholder="Tìm sản phẩm..." autocomplete="off" />
        <select id="pcat"><option value="">Tất cả danh mục</option>${CATEGORIES.map(
          (c) => `<option>${c}</option>`
        ).join("")}</select>
        <button class="btn primary right" id="newP">+ Thêm</button>
      </div>
      <div style="max-height:60vh; overflow:auto">
        <table class="table" id="ptbl">
          <thead><tr><th>SKU</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>${Array.from({ length: 10 })
            .map(
              () =>
                `<tr><td colspan="7"><div class="skeleton skeleton-row"></div></td></tr>`
            )
            .join("")}</tbody>
        </table>
      </div>
    </div>
    <div id="modal"></div>
  `;

  const uiKey = "vvv_products_ui";
  const ui = (() => {
    try {
      return JSON.parse(localStorage.getItem(uiKey)) || {};
    } catch {
      return {};
    }
  })();
  let q = ui.q || "",
    cat = ui.cat || "";
  let allProducts = [];

  el("#pq").value = q;
  el("#pcat").value = cat;

  // Load products from API
  async function loadProducts() {
    try {
      allProducts = await API.productsAPI.getAll();
      renderRows();
    } catch (error) {
      console.error("Error loading products:", error);
      toast("Lỗi khi tải sản phẩm từ API");
      el("#ptbl tbody").innerHTML =
        '<tr><td colspan="7" style="text-align:center; color:red">❌ Không thể tải dữ liệu từ API</td></tr>';
    }
  }

  function rows() {
    return allProducts.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
        (!cat || p.category === cat)
    );
  }

  function renderRows() {
    const filtered = rows();
    if (filtered.length === 0) {
      el("#ptbl tbody").innerHTML =
        '<tr><td colspan="7" style="text-align:center">Không tìm thấy sản phẩm</td></tr>';
      return;
    }
    el("#ptbl tbody").innerHTML = filtered
      .slice(0, 200)
      .map(
        (p) => `
      <tr>
        <td>${p.id}</td><td>${p.name}</td><td><span class="tag">${
          p.category
        }</span></td>
        <td>${fmt.money(p.price)}</td><td>${p.stock || 0}</td><td>${
          p.status || "active"
        }</td>
        <td class="right">
          <button class="btn small btn-outline" data-edit="${p.id}">Sửa</button>
          <button class="btn small danger" data-del="${p.id}">Xoá</button>
        </td>
      </tr>`
      )
      .join("");
    els("[data-edit]").forEach((b) => (b.onclick = () => edit(b.dataset.edit)));
    els("[data-del]").forEach((b) => (b.onclick = () => del(b.dataset.del)));
    localStorage.setItem(uiKey, JSON.stringify({ q, cat }));
  }

  async function edit(id) {
    const isNew = id === "NEW";
    const p = isNew
      ? {
          id: "P" + rand(1000, 9999),
          name: "",
          category: CATEGORIES[0],
          price: 10000,
          stock: 0,
          status: "active",
          description: "",
          image: "",
        }
      : allProducts.find((x) => x.id === id);
    el("#modal").innerHTML = `
      <div class="login-screen" style="display:flex">
        <form class="card login-card" id="pForm" style="width:min(520px,92vw)">
          <h1>${isNew ? "Thêm sản phẩm" : "Sửa sản phẩm"}</h1>
          <label>SKU</label><input name="id" value="${p.id}" ${
      isNew ? "" : "readonly"
    } required autocomplete="off"/>
          <label>Tên</label><input name="name" value="${
            p.name
          }" required autocomplete="off"/>
          <label>Danh mục</label>
          <select name="category">${CATEGORIES.map(
            (c) => `<option ${c === p.category ? "selected" : ""}>${c}</option>`
          ).join("")}</select>
          <label>Giá (VND)</label><input type="number" name="price" value="${
            p.price
          }" min="0" required autocomplete="off"/>
          <label>Tồn kho</label><input type="number" name="stock" value="${
            p.stock || 0
          }" min="0" required autocomplete="off"/>
          <label>Hình ảnh (đường dẫn)</label><input name="image" value="${
            p.image || ""
          }" placeholder="../images/VEG/leaf/rau-muong.jpg" autocomplete="off"/>
          <label>Trạng thái</label>
          <select name="status"><option ${
            (p.status || "active") === "active" ? "selected" : ""
          }>active</option><option ${
      p.status === "inactive" ? "selected" : ""
    }>inactive</option></select>
          <div class="row">
            <button class="btn primary">Lưu</button>
            <button type="button" class="btn btn-outline right" id="closeM">Đóng</button>
          </div>
        </form>
      </div>
    `;
    el("#closeM").onclick = () => (el("#modal").innerHTML = "");
    el("#pForm").onsubmit = async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      d.price = +d.price;
      d.stock = +d.stock;

      try {
        if (isNew) {
          await API.productsAPI.create(d);
          audit.log("product.create", auth.current().email, { id: d.id });
        } else {
          await API.productsAPI.update(d.id, d);
          audit.log("product.update", auth.current().email, { id: d.id });
        }
        toast("Đã lưu sản phẩm");
        el("#modal").innerHTML = "";
        await loadProducts(); // Reload
      } catch (error) {
        console.error("Error saving product:", error);
        toast("Lỗi khi lưu sản phẩm");
      }
    };
  }

  async function del(id) {
    const sess = auth.current();
    if (sess.role === "Staff") {
      toast("Staff không được xoá sản phẩm");
      return;
    }
    if (!confirm("Xác nhận xóa sản phẩm?")) return;

    try {
      await API.productsAPI.delete(id);
      audit.log("product.delete", sess.email, { id });
      toast("Đã xoá");
      await loadProducts(); // Reload
    } catch (error) {
      console.error("Error deleting product:", error);
      toast("Lỗi khi xóa sản phẩm");
    }
  }

  el("#pq").oninput = debounce((e) => {
    q = e.target.value.trim().toLowerCase();
    renderRows();
  }, 250);
  el("#pcat").onchange = (e) => {
    cat = e.target.value;
    renderRows();
  };
  el("#newP").onclick = () => edit("NEW");

  // Initial load
  loadProducts();
}

function renderReports() {
  auth.guard();
  const db = DB.get();
  // group by month
  const byMonth = {};
  db.orders.forEach((o) => {
    const m = new Date(o.createdAt).toISOString().slice(0, 7);
    const amt = o.amount - o.discount + o.tax + o.shipping;
    byMonth[m] = (byMonth[m] || 0) + amt;
  });
  const labels = Object.keys(byMonth).sort();
  const data = labels.map((k) => byMonth[k]);

  el("#view").innerHTML = `
    <div class="grid cols-2">
      ${card("Doanh thu theo tháng", `<canvas id="revM"></canvas>`)}
      ${card(
        "Export dữ liệu báo cáo",
        `
        <button id="csvRep" class="btn">Export CSV</button>
        <p class="muted small">Xuất dòng: tháng, doanh thu</p>
      `
      )}
    </div>
  `;
  if (window.Chart) {
    new Chart(el("#revM"), {
      type: "bar",
      data: { labels, datasets: [{ data, label: "Revenue" }] },
      options: { plugins: { legend: { display: false } } },
    });
  }
  el("#csvRep").onclick = () => {
    const rows = [["month", "revenue"], ...labels.map((m, i) => [m, data[i]])];
    exportCSV(rows, "revenue_by_month.csv");
  };
}

async function renderAudit() {
  auth.guard();

  // Chỉ Admin mới xem được
  const sess = auth.current();
  if (sess.role !== "Admin") {
    el("#view").innerHTML = card(
      "Audit Log",
      `<p class="muted">Chỉ Admin mới có quyền xem Audit Log.</p>`
    );
    return;
  }

  let logs = [];
  try {
    logs = await API.auditLogsAPI.getAll();
  } catch (error) {
    console.error("Failed to load audit logs:", error);
    toast("Không thể tải audit logs");
  }

  // Phân loại theo action
  const actionLabels = {
    "order.create": "Tạo đơn hàng",
    "order.update": "Cập nhật đơn",
    "order.cancel": "Hủy đơn",
    "profile.update": "Cập nhật thông tin",
    "password.change": "Đổi mật khẩu",
    "product.create": "Tạo sản phẩm",
    "product.update": "Cập nhật sản phẩm",
    "product.delete": "Xóa sản phẩm",
    "user.login": "Đăng nhập",
    "user.logout": "Đăng xuất",
  };

  const rows = logs
    .slice()
    .reverse()
    .map((a) => {
      const actionLabel = actionLabels[a.action] || a.action;
      const metadata = a.metadata || {};
      const metaStr = Object.entries(metadata)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(", ");

      return `
    <tr>
      <td>${fmt.date(a.timestamp)}</td>
      <td><span class="tag">${actionLabel}</span></td>
      <td>${a.who || a.user || "System"}</td>
      <td class="muted small" style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${
        metaStr || "—"
      }</td>
    </tr>
  `;
    })
    .join("");

  el("#view").innerHTML = card(
    "Audit Log - Lịch sử hoạt động",
    `
    <div class="row controls" style="margin-bottom: 16px;">
      <input id="auditSearch" placeholder="Tìm theo người thực hiện..." autocomplete="off" style="flex: 1;"/>
      <select id="auditFilter" class="input">
        <option value="">Tất cả hành động</option>
        <option value="order">Đơn hàng</option>
        <option value="profile">Thông tin cá nhân</option>
        <option value="password">Mật khẩu</option>
        <option value="product">Sản phẩm</option>
        <option value="user">Người dùng</option>
      </select>
      <button class="btn" id="exportAudit">Export CSV</button>
    </div>
    <div style="max-height:70vh; overflow:auto">
      <table class="table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Hành động</th>
            <th>Người thực hiện</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody id="auditTableBody">${
          rows ||
          `<tr><td colspan="4" class="muted">Chưa có audit log</td></tr>`
        }</tbody>
      </table>
    </div>
    <p class="muted small" style="margin-top: 16px;">Hiển thị ${
      logs.length
    } bản ghi</p>
  `
  );

  // Filter functionality
  el("#auditSearch")?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filter = el("#auditFilter").value;
    filterAuditLogs(logs, query, filter);
  });

  el("#auditFilter")?.addEventListener("change", (e) => {
    const query = el("#auditSearch").value.toLowerCase();
    const filter = e.target.value;
    filterAuditLogs(logs, query, filter);
  });

  el("#exportAudit")?.addEventListener("click", () => {
    const csvRows = [
      ["Thời gian", "Hành động", "Người thực hiện", "Chi tiết"],
      ...logs.map((a) => [
        fmt.date(a.timestamp),
        actionLabels[a.action] || a.action,
        a.who || a.user || "System",
        JSON.stringify(a.metadata || {}),
      ]),
    ];
    exportCSV(csvRows, "audit_log.csv");
  });

  function filterAuditLogs(allLogs, searchQuery, actionFilter) {
    const filtered = allLogs.filter((log) => {
      const matchesSearch =
        !searchQuery ||
        (log.who || log.user || "").toLowerCase().includes(searchQuery);
      const matchesFilter =
        !actionFilter || log.action.startsWith(actionFilter + ".");
      return matchesSearch && matchesFilter;
    });

    const rows = filtered
      .slice()
      .reverse()
      .map((a) => {
        const actionLabel = actionLabels[a.action] || a.action;
        const metadata = a.metadata || {};
        const metaStr = Object.entries(metadata)
          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
          .join(", ");

        return `
      <tr>
        <td>${fmt.date(a.timestamp)}</td>
        <td><span class="tag">${actionLabel}</span></td>
        <td>${a.who || a.user || "System"}</td>
        <td class="muted small" style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${
          metaStr || "—"
        }</td>
      </tr>
    `;
      })
      .join("");

    el("#auditTableBody").innerHTML =
      rows ||
      `<tr><td colspan="4" class="muted">Không tìm thấy kết quả</td></tr>`;
  }
}

function renderUsers() {
  const sess = auth.current();
  if (sess.role !== "Admin") {
    toast("Chỉ Admin truy cập Users");
    go("#/dashboard");
    return;
  }
  const db = DB.get();
  el("#view").innerHTML = card(
    "Người dùng",
    `
    <table class="table">
      <thead><tr><th>Email</th><th>Vai trò</th></tr></thead>
      <tbody>${db.users
        .map((u) => `<tr><td>${u.email}</td><td>${u.role}</td></tr>`)
        .join("")}</tbody>
    </table>
  `
  );
}

// ---------- init ----------
el("#btnLogout").onclick = () => {
  auth.logout();
  showLogin(true);
  location.hash = "#/login";
};
render();

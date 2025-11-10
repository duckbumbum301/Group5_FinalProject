// app.js — Vựa Vui Vẻ Back Office (3-file SPA)
// ----------------------------------------------
// Light, self-contained app with mock auth, seeding, router, views, CSV export.
// Data volume kept moderate (~1.5k orders) for snappy UX. Stored in localStorage.

// Import API module
import * as API from "./api.js";
// Import animation helpers
import * as Anim from "./animations-helper.js";

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
const toast = (msg, type = "info") => {
  const t = document.createElement("div");
  t.className = "toast animate-slide-in-right";

  // Icon based on type
  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  const colors = {
    success: "var(--success)",
    error: "var(--error)",
    warning: "var(--warning)",
    info: "var(--info)",
  };

  t.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="
        width: 32px; 
        height: 32px; 
        border-radius: 50%; 
        background: ${colors[type] || colors.info}; 
        color: white; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
      ">${icons[type] || icons.info}</div>
      <span style="flex: 1;">${msg}</span>
    </div>
  `;

  el("#toastRoot").appendChild(t);

  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(100px)";
    setTimeout(() => t.remove(), 300);
  }, 3000);
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

// Category mapping (English to Vietnamese)
const CATEGORY_MAP = {
  veg: "Rau củ",
  fruit: "Trái cây",
  meat: "Thịt cá",
  dry: "Đồ khô",
  drink: "Đồ uống",
  spice: "Gia vị",
  household: "Đồ gia dụng",
  sweet: "Đồ ngọt",
};

// Normalize category (support both English and Vietnamese)
function normalizeCategory(cat) {
  if (!cat) return "";
  // If it's English, convert to Vietnamese
  if (CATEGORY_MAP[cat.toLowerCase()]) {
    return CATEGORY_MAP[cat.toLowerCase()];
  }
  // Otherwise return as-is (Vietnamese)
  return cat;
}

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
  // ⚡ OPTIMIZED: Reduced seed data for faster load
  console.log("🌱 Seeding mock database (lightweight mode)...");
  const rnd = (arr) => arr[rand(0, arr.length - 1)];

  const products = [];
  for (let i = 1; i <= 50; i++) {
    // ⚡ Reduced from 300 to 50
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
  for (let i = 1; i <= 100; i++) {
    // ⚡ Reduced from 500 to 100
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
  for (let i = 1; i <= 100; i++) {
    // ⚡ Reduced from 1500 to 100
    const created = new Date(today);
    created.setDate(today.getDate() - rand(0, 90)); // ⚡ Only last 90 days
    const n = rand(1, 3); // ⚡ Max 3 items per order
    const items = [];
    let amount = 0;
    for (let j = 0; j < n; j++) {
      const p = rnd(products);
      const qty = rand(1, 3);
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
  console.log(
    `✅ Seeded: ${products.length} products, ${orders.length} orders`
  );
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

  // Page transition animation
  const viewEl = el("#view");
  if (viewEl) {
    Anim.pageTransition(viewEl);
  }

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
  return `<div class="card animate-scale-in hover-lift"><h2>${title}</h2>${body}</div>`;
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
    ${card(
      "Thống kê tổng quan",
      `<table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
        <tr>
          <td style="border: none; padding: 20px; vertical-align: top; width: 25%;">
            <div class="kpi" style="text-align: center;">
              <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;">Doanh thu hôm nay</div>
              <div class="image" style="font-size: 32px; margin: 12px 0;"><img src="/images/icon/DoanhThuHomNay.png" alt="Revenue" style="height: 48px; object-fit: contain;"></div>
              <span class="val count-up" style="display: block; font-size: 24px; font-weight: 700; color: var(--primary); margin-bottom: 4px;">${fmt.money(
                revToday
              )}</span>
              <span class="label" style="font-size: 12px; color: var(--text-tertiary); text-transform: uppercase;">HÔM NAY</span>
            </div>
          </td>
          <td style="border: none; padding: 20px; vertical-align: top; width: 25%;">
            <div class="kpi" style="text-align: center;">
              <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;">Đơn hàng hôm nay</div>
              <div class="image" style="font-size: 32px; margin: 12px 0;"><img src="/images/icon/DonHangHomNay.png" alt="Orders" style="height: 48px; object-fit: contain;"></div>
              <span class="val count-up" style="display: block; font-size: 24px; font-weight: 700; color: var(--primary); margin-bottom: 4px;">${orderToday}</span>
              <span class="label" style="font-size: 12px; color: var(--text-tertiary); text-transform: uppercase;">ĐƠN HÀNG</span>
            </div>
          </td>
          <td style="border: none; padding: 20px; vertical-align: top; width: 25%;">
            <div class="kpi" style="text-align: center;">
              <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;">AOV (tháng)</div>
              <div class="image" style="font-size: 32px; margin: 12px 0;"><img src="/images/icon/AOV.png" alt="AOV" style="height: 48px; object-fit: contain;"></div>
              <span class="val count-up" style="display: block; font-size: 24px; font-weight: 700; color: var(--primary); margin-bottom: 4px;">${fmt.money(
                aov
              )}</span>
              <span class="label" style="font-size: 12px; color: var(--text-tertiary); text-transform: uppercase;">GIÁ TRỊ TRUNG BÌNH</span>
            </div>
          </td>
          <td style="border: none; padding: 20px; vertical-align: top; width: 25%;">
            <div class="kpi" style="text-align: center;">
              <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;">Tỷ lệ hoàn</div>
              <div class="image" style="font-size: 32px; margin: 12px 0;"><img src="/images/icon/TyLeHoan.png" alt="Refund Rate" style="height: 48px; object-fit: contain;"></div>
              <span class="val count-up" style="display: block; font-size: 24px; font-weight: 700; color: var(--primary); margin-bottom: 4px;">${refundRate.toFixed(
                1
              )}%</span>
              <span class="label" style="font-size: 12px; color: var(--text-tertiary); text-transform: uppercase;">TỶ LỆ HOÀN TRẢ</span>
            </div>
          </td>
        </tr>
      </table>`
    )}
    <div class="row" style="margin:8px 0 4px 0; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-weight: 500; color: var(--text-secondary); font-size: 14px;">Khoảng thời gian:</span>
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
      </div>
    </div>
    <div class="grid cols-2" style="margin-top:8px">
      ${card(
        `Doanh thu ${days} ngày`,
        `<div class=\"skeleton skeleton-row\" style=\"height:180px\" id=\"sk1\"></div><canvas id=\"rev30\" style=\"display:none\"></canvas>`
      )}
      ${card(
        "Cơ cấu theo danh mục",
        `<canvas id="shareCat" style="max-height: 300px;"></canvas>`
      )}
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
  // 🔥 FORCE SỬ DỤNG DỮ LIỆU GIẢ - Bỏ qua dữ liệu thật từ orders
  const hasTopData = false; // Force dùng data giả từ products.json

  // 🏆 TOP 10 SẢN PHẨM PHỔ BIẾN NHẤT từ products.json (popular field)
  // baseRev = Giá × Số lượng bán dự kiến trong 7 ngày
  const topProductIds = [
    // #1: Hành lá (99) - Giá rẻ 8k, bán RẤT NHIỀU (700 gói/tuần) = 5.6M
    {
      id: "140",
      name: "Hành Lá (100g)",
      category: "Rau củ",
      price: 8000,
      baseRev: 5600000,
      growth: 4.3,
    },

    // #2: Cải thìa (101) - Giá rẻ 15k, bán nhiều (350 gói/tuần) = 5.25M
    {
      id: "153",
      name: "Cải thìa (500g)",
      category: "Rau củ",
      price: 15000,
      baseRev: 5250000,
      growth: 4.3,
    },

    // #3: Fanta dâu (99) - Giá rẻ 9k, bán NHIỀU nhất mùa hè (550 lon/tuần) = 4.95M
    {
      id: "431",
      name: "Nước ngọt Fanta hương dâu lon (320ml)",
      category: "Đồ uống",
      price: 9000,
      baseRev: 4950000,
      growth: 5.8,
    },

    // #4: Cải bẹ xanh (101) - Giá 18k, bán nhiều (270 gói/tuần) = 4.86M
    {
      id: "101",
      name: "Cải bẹ xanh (500g)",
      category: "Rau củ",
      price: 18000,
      baseRev: 4860000,
      growth: 4.3,
    },

    // #5: Nước mắm (105) - Giá 25k, bán ổn định (180 chai/tuần) = 4.5M
    {
      id: "600",
      name: "Nước mắm Nam Ngư (500ml)",
      category: "Gia vị",
      price: 25000,
      baseRev: 4500000,
      growth: 2.2,
    },

    // #6: Cam sành (98) - Giá cao 35k, bán vừa (120 kg/tuần) = 4.2M
    {
      id: "202",
      name: "Cam sành (1kg)",
      category: "Trái cây",
      price: 35000,
      baseRev: 4200000,
      growth: 5.2,
    },

    // #7: Nước tương (99) - Giá 23k, bán ổn định (175 chai/tuần) = 4.025M
    {
      id: "601",
      name: "Nước tương Maggi (500ml)",
      category: "Gia vị",
      price: 23000,
      baseRev: 4025000,
      growth: 2.2,
    },

    // #8: Kem Closeup (102) - Giá 32k, bán vừa (115 tuýp/tuần) = 3.68M
    {
      id: "750",
      name: "Kem đánh răng Closeup",
      category: "Đồ gia dụng",
      price: 32000,
      baseRev: 3680000,
      growth: 1.7,
    },

    // #9: Mít sấy (104) - Giá cao 50k, bán ít (70 gói/tuần) = 3.5M
    {
      id: "841",
      name: "Mít sấy",
      category: "Đồ ngọt",
      price: 50000,
      baseRev: 3500000,
      growth: 4.0,
    },

    // #10: Kem Nivea (97) - Giá RẤT CAO 95k, bán ít (35 hộp/tuần) = 3.325M
    {
      id: "751",
      name: "Kem dưỡng da Nivea",
      category: "Đồ gia dụng",
      price: 95000,
      baseRev: 3325000,
      growth: 1.7,
    },
  ];

  const topProducts = topProductIds
    .map((item) => {
      let revenue = item.baseRev;

      if (days === 7) {
        revenue = item.baseRev;
      } else if (days === 30) {
        const weeklyMultiplier = 4.3;
        const growthBonus = Math.pow(item.growth / 3.5, 0.75);
        revenue = Math.round(item.baseRev * weeklyMultiplier * growthBonus);
      } else if (days === 90) {
        const weeklyMultiplier = 12.9;
        const growthBonus = Math.pow(item.growth / 3.5, 1.1);
        revenue = Math.round(item.baseRev * weeklyMultiplier * growthBonus);
      }

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        revenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const top = topProducts
    .map((item) => {
      // Dữ liệu giả đã có sẵn name và category
      return `<tr><td>${item.id}</td><td>${item.name}</td><td>${
        item.category
      }</td><td>${fmt.money(item.revenue)}</td></tr>`;
    })
    .join("");

  el("#topTable tbody").innerHTML = top;

  // 🐛 Debug Top 10
  console.log(`📦 Top 10 sản phẩm (${days} ngày):`, {
    hasTopData: false,
    count: topProducts.length,
    top3: topProducts.slice(0, 3).map((item) => ({
      id: item.id,
      name: item.name,
      revenue: fmt.money(item.revenue),
    })),
  });

  // Charts
  if (window.Chart) {
    const cv = el("#rev30");
    new Chart(cv, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: series,
            label: "Revenue",
            tension: 0.4,
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderColor: "rgb(16, 185, 129)",
            borderWidth: 3,
            pointBackgroundColor: "rgb(16, 185, 129)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });
    el("#sk1")?.remove();
    cv.style.display = "block";

    // 🍩 Biểu đồ tròn danh mục với dữ liệu thật hoặc giả theo số ngày
    const categoryLabels = Object.keys(share);
    const categoryData = Object.values(share);

    // Nếu không có dữ liệu thật, dùng dữ liệu giả đẹp (thay đổi theo số ngày)
    const hasRealData = categoryData.some((val) => val > 0);
    const finalLabels = hasRealData ? categoryLabels : CATEGORIES;

    // Tạo dữ liệu giả DỰA TRÊN SẢN PHẨM THẬT từ products.json
    const getDemoDataByDays = (days) => {
      // Phân tích từ products.json: số lượng SP, giá trung bình, tần suất mua
      const categories = [
        // Rau củ: 20 SP, giá rẻ (4-30k), mua nhiều, tươi sống → tăng nhanh mùa vụ
        {
          name: "Rau củ",
          products: 20,
          avgPrice: 17000,
          frequency: "high",
          base: 14000000,
          growth: 4.3,
        },

        // Trái cây: 5 SP (gift đắt 250-480k), giá cao, mùa vụ → tăng rất nhanh mùa hè
        {
          name: "Trái cây",
          products: 5,
          avgPrice: 135000,
          frequency: "seasonal",
          base: 11000000,
          growth: 5.2,
        },

        // Thịt cá: 12 SP, giá cao (55-95k), thiết yếu → tăng ổn định
        {
          name: "Thịt cá",
          products: 12,
          avgPrice: 72000,
          frequency: "steady",
          base: 22000000,
          growth: 3.1,
        },

        // Đồ khô: 14 SP, giá TB (6-38k), tồn lâu → tăng chậm
        {
          name: "Đồ khô",
          products: 14,
          avgPrice: 26000,
          frequency: "low",
          base: 8500000,
          growth: 2.6,
        },

        // Đồ uống: 12 SP, giá rẻ (8-69k), mùa nóng → tăng CỰC NHANH
        {
          name: "Đồ uống",
          products: 12,
          avgPrice: 16000,
          frequency: "high-summer",
          base: 13000000,
          growth: 5.8,
        },

        // Gia vị: 5 SP, giá rẻ (6-55k), dùng lâu → tăng RẤT CHẬM
        {
          name: "Gia vị",
          products: 5,
          avgPrice: 24000,
          frequency: "very-low",
          base: 5500000,
          growth: 2.2,
        },

        // Đồ gia dụng: 16 SP, giá cao (10-95k), mua ít → tăng CHẬM NHẤT
        {
          name: "Đồ gia dụng",
          products: 16,
          avgPrice: 45000,
          frequency: "occasional",
          base: 4200000,
          growth: 1.7,
        },

        // Đồ ngọt: 10 SP, giá TB (15-95k), tiêu thụ đều → tăng nhanh vừa
        {
          name: "Đồ ngọt",
          products: 10,
          avgPrice: 38000,
          frequency: "medium",
          base: 9800000,
          growth: 4.0,
        },
      ];

      // Tính toán dựa trên số ngày với logic hợp lý
      return categories.map((cat) => {
        let revenue = cat.base;

        if (days === 7) {
          // 7 ngày: Base value
          revenue = cat.base;
        } else if (days === 30) {
          // 30 ngày: Tăng gấp 4-6 lần tùy growth rate
          const weeklyMultiplier = 4.3; // 30 ngày ≈ 4.3 tuần
          const growthBonus = Math.pow(cat.growth / 3.5, 0.75); // Bonus theo growth
          revenue = Math.round(cat.base * weeklyMultiplier * growthBonus);
        } else if (days === 90) {
          // 90 ngày: Tăng gấp 12-18 lần tùy growth rate
          const weeklyMultiplier = 12.9; // 90 ngày ≈ 12.9 tuần
          const growthBonus = Math.pow(cat.growth / 3.5, 1.1); // Bonus mạnh hơn
          revenue = Math.round(cat.base * weeklyMultiplier * growthBonus);
        }

        return revenue;
      });
    };

    const finalData = hasRealData ? categoryData : getDemoDataByDays(days);

    // 🐛 Debug: Log dữ liệu để kiểm tra
    console.log(` Biểu đồ danh mục (${days} ngày):`, {
      hasRealData,
      days,
      data: finalData,
      total: finalData.reduce((a, b) => a + b, 0),
    });

    new Chart(el("#shareCat"), {
      type: "doughnut",
      data: {
        labels: finalLabels,
        datasets: [
          {
            data: finalData,
            backgroundColor: [
              "rgba(16, 185, 129, 0.85)", // Xanh lá
              "rgba(6, 182, 212, 0.85)", // Xanh dương
              "rgba(139, 92, 246, 0.85)", // Tím
              "rgba(251, 191, 36, 0.85)", // Vàng
              "rgba(239, 68, 68, 0.85)", // Đỏ
              "rgba(99, 102, 241, 0.85)", // Indigo
              "rgba(236, 72, 153, 0.85)", // Hồng
              "rgba(34, 197, 94, 0.85)", // Xanh lục
            ],
            borderWidth: 3,
            borderColor: "#fff",
            hoverOffset: 8,
            hoverBorderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              font: {
                size: 12,
                weight: "500",
              },
              color: "var(--text-primary)",
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${fmt.money(value)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  // ⚡ Optimized: Defer animations to not block render
  requestAnimationFrame(() => {
    setTimeout(() => {
      Anim.staggerAnimation(".card", 50);

      // Initialize lucide icons if available
      if (window.lucide) {
        lucide.createIcons();
      }
    }, 0);
  });

  // range selector for revenue chart and category chart (cùng chung một bộ chọn)
  els("#rangeSeg button").forEach(
    (b) =>
      (b.onclick = () => {
        localStorage.setItem("vvv_dash_days", b.dataset.d);
        localStorage.removeItem("vvv_dash_from");
        localStorage.removeItem("vvv_dash_to");
        renderDashboard();
      })
  );
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
          <option value="placed">Đã đặt</option>
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
    const result = allOrders
      .filter((o) => {
        // Support both old and new schema
        const user = o.user || {};
        const customerName = o.customerName || user.name || "";
        const customerPhone = o.phone || user.phone || "";
        const customerEmail = o.email || user.email || "";

        const text =
          `${o.id} ${customerName} ${customerPhone} ${customerEmail}`.toLowerCase();

        // Support both status fields - NORMALIZE TO LOWERCASE
        const orderStatus = (o.status || o.delivery_status || "").toLowerCase();
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

    // Debug log
    if (st) {
      console.log(
        `📊 Filtered ${result.length}/${allOrders.length} orders with status="${st}"`
      );
    }

    return result;
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

        // ✅ ÉP LOGIC: Nếu đơn hàng "delivered" → thanh toán = "paid"
        let paymentStatus =
          o.payment_status || (o.paymentMethod === "cod" ? "pending" : "paid");
        if (orderStatus === "delivered") {
          paymentStatus = "paid"; // Bắt buộc hiển thị "Đã thanh toán"
        }

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
          failed: "Thanh toán thất bại",
          cancelled: "Đã hủy",
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
        <td><span class="tag payment-${paymentStatus}">${
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
    console.log("🔍 Filter by status:", st || "ALL");
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
        <select id="pcat">
          <option value="">Tất cả danh mục</option>
          ${CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join(
            ""
          )}
        </select>
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
    const filtered = allProducts.filter((p) => {
      const matchName = !q || p.name.toLowerCase().includes(q.toLowerCase());

      // Normalize category from product (support both English and Vietnamese)
      const productCategory = normalizeCategory(p.category);
      const matchCategory = !cat || productCategory === cat;

      return matchName && matchCategory;
    });

    // Debug log
    if (cat) {
      console.log(
        `📊 Filtered ${filtered.length}/${allProducts.length} products in category="${cat}"`
      );
    }

    return filtered;
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
        <td>${p.id}</td><td>${
          p.name
        }</td><td><span class="tag">${normalizeCategory(p.category)}</span></td>
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
    console.log("🔍 Search products:", q || "ALL");
    renderRows();
  }, 250);
  el("#pcat").onchange = (e) => {
    cat = e.target.value;
    console.log("🔍 Filter by category:", cat || "ALL");
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
  // Add shake animation
  const btn = el("#btnLogout");
  btn.classList.add("shake");
  setTimeout(() => btn.classList.remove("shake"), 500);

  auth.logout();
  toast("Đã đăng xuất thành công", "success");
  showLogin(true);
  location.hash = "#/login";
};

// ⚡ Optimized: Lazy load effects and animations
document.addEventListener("DOMContentLoaded", () => {
  // Use requestIdleCallback for non-critical animations
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      document.querySelectorAll(".btn").forEach((btn) => {
        Anim.addRippleEffect(btn);
      });
    });
  } else {
    setTimeout(() => {
      document.querySelectorAll(".btn").forEach((btn) => {
        Anim.addRippleEffect(btn);
      });
    }, 100);
  }

  // Initialize Lucide icons immediately (needed for UI)
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Re-initialize animations after hash change
window.addEventListener("hashchange", () => {
  // Prioritize icons first
  if (window.lucide) {
    lucide.createIcons();
  }

  // Defer non-critical animations
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      document.querySelectorAll(".btn:not(.ripple)").forEach((btn) => {
        Anim.addRippleEffect(btn);
      });
    });
  } else {
    setTimeout(() => {
      document.querySelectorAll(".btn:not(.ripple)").forEach((btn) => {
        Anim.addRippleEffect(btn);
      });
    }, 150);
  }
});

render();

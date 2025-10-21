// app.js — Vựa Vui Vẻ Back Office (3-file SPA)
// ----------------------------------------------
// Light, self-contained app with mock auth, seeding, router, views, CSV export.
// Data volume kept moderate (~1.5k orders) for snappy UX. Stored in localStorage.

const LS = {
  session: "vvv_session",
  db: "vvv_db_v1",
  audit: "vvv_audit_v1",
};

// ---------- utils ----------
const fmt = {
  money: v => (v ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }),
  date: d => new Date(d).toLocaleDateString("vi-VN"),
  iso: (d=new Date()) => new Date(d).toISOString(),
};
const el = (sel, root = document) => root.querySelector(sel);
const els = (sel, root = document) => [...root.querySelectorAll(sel)];
function debounce(fn, wait=250){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); }; }
const toast = (msg) => {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  el("#toastRoot").appendChild(t);
  setTimeout(()=>t.remove(), 2500);
};
const exportCSV = (rows, filename="export.csv") => {
  const csv = rows.map(r=>r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
};
const rand = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;

// ---------- auth ----------
const auth = {
  current(){ try {return JSON.parse(localStorage.getItem(LS.session));} catch {return null} },
  login({email, role}){ const s = { email, role, ts: Date.now() }; localStorage.setItem(LS.session, JSON.stringify(s)); audit.log("login", s.email); return s; },
  logout(){ const s=this.current(); if(s) audit.log("logout", s.email); localStorage.removeItem(LS.session); },
  guard(){ if(!this.current()){ showLogin(true); location.hash = "#/login"; } }
};

// ---------- audit ----------
const audit = {
  log(action, who, meta={}) {
    const items = this.list();
    items.unshift({ id: crypto.randomUUID(), action, who, meta, at: fmt.iso() });
    localStorage.setItem(LS.audit, JSON.stringify(items.slice(0, 500))); // keep 500
  },
  list(){ try { return JSON.parse(localStorage.getItem(LS.audit)) || []; } catch { return []; } }
};

// ---------- DB (mock) ----------
const CATEGORIES = [
  "Rau củ","Trái cây","Thịt cá","Đồ khô",
  "Đồ uống","Gia vị","Đồ gia dụng","Đồ ngọt"
];
function loadDB(){
  try{ return JSON.parse(localStorage.getItem(LS.db)); }catch{ return null }
}
function saveDB(db){ localStorage.setItem(LS.db, JSON.stringify(db)); }
function seedDB(){
  // small but meaningful dataset
  const rnd = (arr)=>arr[rand(0,arr.length-1)];
  const products = [];
  for(let i=1;i<=300;i++){
    const cat = rnd(CATEGORIES);
    const price = rand(10000, 250000);
    products.push({
      id: "P"+String(i).padStart(4, "0"),
      name: `${cat} ${i}`,
      category: cat, price,
      cost: Math.round(price*0.65 + rand(-3000,3000)),
      stock: rand(0, 200),
      status: rand(0,1)? "active":"inactive",
      image: "https://dummyimage.com/80x80/223/fff&text=VVV"
    });
  }
  const customers = [];
  for(let i=1;i<=500;i++){
    customers.push({ id:"C"+i.toString().padStart(4,"0"), name:`Khách ${i}`, email:`khach${i}@mail.com`, tier:rnd(["Bronze","Silver","Gold"]) });
  }
  const orders = [];
  const channels = ["Web","App"];
  const statusList = ["Pending","Paid","Cancelled","Refunded"];
  const today = new Date();
  for(let i=1;i<=1500;i++){
    const created = new Date(today); created.setDate(today.getDate() - rand(0, 364));
    const n = rand(1,5);
    const items = [];
    let amount = 0;
    for(let j=0;j<n;j++){
      const p = rnd(products);
      const qty = rand(1,4);
      items.push({ sku:p.id, name:p.name, price:p.price, qty });
      amount += p.price * qty;
    }
    const status = rnd(statusList.map(s => s).flatMap(s=> s==="Pending" && rand(0,10)<2 ? ["Paid","Pending"] : [s] ));
    orders.push({
      id:"O"+i.toString().padStart(5,"0"),
      customer: rnd(customers).id,
      items, amount,
      discount: rand(0,1) ? rand(5000,20000) : 0,
      tax: Math.round(amount*0.08),
      shipping: rand(0,1)? 15000:0,
      channel: rnd(channels),
      status, createdAt: created.toISOString(),
      history: [{at: created.toISOString(), status}]
    });
  }
  const users = [
    {id:"U001", email:"admin@vuavuive.vn", role:"Admin"},
    {id:"U002", email:"manager@vuavuive.vn", role:"Manager"},
    {id:"U003", email:"staff@vuavuive.vn", role:"Staff"},
  ];
  const db = { products, customers, orders, users };
  saveDB(db);
  audit.log("seed", "system", {orders:orders.length, products:products.length});
  return db;
}
const DB = { get: () => loadDB() || seedDB(), set: saveDB };

// ---------- router ----------
const routes = {};
function route(path, handler){ routes[path]=handler; }
function go(path){ location.hash = path; }
window.addEventListener("hashchange", () => render());

function updateNavActive(){
  const hash = location.hash || "#/dashboard";
  els(".sidebar .nav-item").forEach(a=>{
    a.classList.toggle("active", a.getAttribute("href")===hash);
  });
}

// ---------- login screen toggle ----------
function showLogin(show){
  el("#loginScreen").style.display = show ? "flex":"none";
  el("#app").style.display = show ? "none":"block";
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

function render(){
  const hash = location.hash || "#/dashboard";
  const sess = auth.current();
  // Show/hide login
  if(!sess){
    if(hash !== "#/login"){ go("#/login"); }
    showLogin(true);
    routes["#/login"] && routes["#/login"]();
    return;
  }
  showLogin(false);
  // Badge + RBAC UI
  if(sess){ el("#userBadge").textContent = `${sess.email} · ${sess.role}`; }
  els(".admin-only").forEach(a => a.style.display = (sess?.role==="Admin")?"block":"none");
  (routes[hash] || routes["#/dashboard"])();
  updateNavActive();
}

function renderLogin(){
  showLogin(true);
  const form = document.querySelector("#loginForm");
  form.onsubmit = (e)=>{
    e.preventDefault(); // chặn submit gốc để tự kiểm tra
    const data = Object.fromEntries(new FormData(form).entries());

    // kiểm tra tối thiểu (vì đã novalidate)
    if(!data.email || !data.password){
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


function card(title, body){
  return `<div class="card"><h2>${title}</h2>${body}</div>`;
}

function renderDashboard(){
  auth.guard();
  const db = DB.get();
  let days = +(localStorage.getItem("vvv_dash_days")||30);
  const today = new Date();
  let end = new Date(today);
  let start = new Date(end); start.setDate(start.getDate()-(days-1));
  const fromStr = localStorage.getItem("vvv_dash_from");
  const toStr = localStorage.getItem("vvv_dash_to");
  if(fromStr && toStr){
    const s = new Date(fromStr); const e = new Date(toStr);
    if(!isNaN(s) && !isNaN(e) && s<=e){ start=s; end=e; days = Math.max(1, Math.round((e - s)/(24*3600*1000))+1); }
  }
  // Series revenue by selected range
  const inRange = (o)=>{ const d=new Date(o.createdAt); return d>=start && d<=end; };
  const ordersInRange = db.orders.filter(inRange);
  const map = new Map();
  for(let i=0;i<days;i++){ const d = new Date(start); d.setDate(start.getDate()+i); map.set(d.toDateString(), 0); }
  ordersInRange.forEach(o=>{
    const d = new Date(o.createdAt).toDateString();
    if(map.has(d)) map.set(d, map.get(d) + (o.amount - o.discount + o.tax + o.shipping));
  });
  const labels = [...map.keys()].map(d=>new Date(d).toLocaleDateString("vi-VN"));
  const series = [...map.values()];

  // KPIs
  const todayStr = today.toDateString();
  const month = today.getMonth();
  let revToday=0, orderToday=0, refundRate=0, aov=0;
  let sumMonth=0, cntMonth=0;
  db.orders.forEach(o=>{
    const amt = (o.amount - o.discount + o.tax + o.shipping);
    if(new Date(o.createdAt).toDateString()===todayStr){ revToday+=amt; orderToday++; }
    if(new Date(o.createdAt).getMonth()===month){ sumMonth+=amt; cntMonth++; }
  });
  aov = cntMonth? sumMonth/cntMonth:0;
  refundRate = db.orders.filter(o=>o.status==="Refunded").length / db.orders.length * 100;

  // Category share (by selected range)
  const share = Object.fromEntries(CATEGORIES.map(c=>[c,0]));
  ordersInRange.forEach(o=>{
    o.items.forEach(it=>{
      const p = db.products.find(x=>x.id===it.sku);
      if(p) share[p.category]+= it.price*it.qty;
    });
  });

  el("#view").innerHTML = `
    <div class="grid kpi">
      ${card("Doanh thu hôm nay", `<div class="kpi"><span class="val">${fmt.money(revToday)}</span><span class="badge">Hôm nay</span></div>`)}
      ${card("Đơn hàng hôm nay", `<div class="kpi"><span class="val">${orderToday}</span></div>`)}
      ${card("AOV (tháng)", `<div class="kpi"><span class="val">${fmt.money(aov)}</span></div>`)}
      ${card("Tỷ lệ hoàn", `<div class="kpi"><span class="val">${refundRate.toFixed(1)}%</span></div>`)}
    </div>
    <div class="row" style="margin:8px 0 4px 0">
      <div class="seg" id="rangeSeg">
        <button data-d="7" class="${(localStorage.getItem("vvv_dash_from")?false:days===7)?"active":""}">7 ngày</button>
        <button data-d="30" class="${(localStorage.getItem("vvv_dash_from")?false:days===30)?"active":""}">30 ngày</button>
        <button data-d="90" class="${(localStorage.getItem("vvv_dash_from")?false:days===90)?"active":""}">90 ngày</button>
      </div>
      <div class="right" style="display:flex; gap:6px; align-items:center">
        <input type="date" id="dFrom" value="${fromStr||""}" autocomplete="off"/>
        <span>→</span>
        <input type="date" id="dTo" value="${toStr||""}" autocomplete="off"/>
        <button class="btn small" id="applyRange">Áp dụng</button>
        <button class="btn small btn-outline" id="resetRange">Mặc định</button>
      </div>
    </div>
    <div class="grid cols-2" style="margin-top:8px">
      ${card(`Doanh thu ${days} ngày`, `<div class=\"skeleton skeleton-row\" style=\"height:180px\" id=\"sk1\"></div><canvas id=\"rev30\" style=\"display:none\"></canvas>`)}
      ${card("Cơ cấu theo danh mục", `<canvas id="shareCat"></canvas>`)}
    </div>
    ${card("Top 10 sản phẩm", `
      <table class="table" id="topTable">
        <thead><tr><th>SKU</th><th>Tên</th><th>Danh mục</th><th>Doanh thu</th></tr></thead>
        <tbody>
          ${Array.from({length:6}).map(()=>`<tr><td colspan="4"><div class="skeleton skeleton-row"></div></td></tr>`).join("")}
        </tbody>
      </table>`)}
  `;

  // Top products (by selected range)
  const revBySku = {};
  ordersInRange.forEach(o=>{
    o.items.forEach(it=>{
      const amt = it.price*it.qty;
      revBySku[it.sku]=(revBySku[it.sku]||0)+amt;
    });
  });
  const top = Object.entries(revBySku).sort((a,b)=>b[1]-a[1]).slice(0,10)
    .map(([sku,amt])=>{
      const p=db.products.find(x=>x.id===sku);
      return `<tr><td>${sku}</td><td>${p?.name||sku}</td><td>${p?.category||"-"}</td><td>${fmt.money(amt)}</td></tr>`;
    }).join("");
  el("#topTable tbody").innerHTML = top;

  // Charts
  if(window.Chart){
    const cv = el("#rev30");
    new Chart(cv, {type:"line", data:{labels, datasets:[{data:series, label:"Revenue", tension:.25}]}, options:{plugins:{legend:{display:false}}}});
    el("#sk1")?.remove(); cv.style.display="block";
    new Chart(el("#shareCat"), {type:"doughnut", data:{labels:Object.keys(share), datasets:[{data:Object.values(share)}]}, options:{}});
  }

  // range selector
  els("#rangeSeg button").forEach(b=>b.onclick=()=>{ localStorage.setItem("vvv_dash_days", b.dataset.d); localStorage.removeItem("vvv_dash_from"); localStorage.removeItem("vvv_dash_to"); renderDashboard(); });
  el("#applyRange").onclick = ()=>{
    const f=el("#dFrom").value, t=el("#dTo").value; if(!f||!t){ toast("Chọn đủ từ ngày/đến ngày"); return; }
    localStorage.setItem("vvv_dash_from", f); localStorage.setItem("vvv_dash_to", t); renderDashboard();
  };
  el("#resetRange").onclick = ()=>{ localStorage.removeItem("vvv_dash_from"); localStorage.removeItem("vvv_dash_to"); renderDashboard(); };
}

function renderOrders(){
  auth.guard();
  const db = DB.get();
  const view = el("#view");
  view.innerHTML = `
    <div class="card">
      <div class="row controls">
        <input id="q" placeholder="Tìm đơn (#id, email)" autocomplete="off"/>
        <input id="from" type="date" autocomplete="off" />
        <span>→</span>
        <input id="to" type="date" autocomplete="off" />
        <select id="st">
          <option value="">Tất cả trạng thái</option>
          <option>Pending</option><option>Paid</option><option>Cancelled</option><option>Refunded</option>
        </select>
        <select id="ch"><option value="">Tất cả kênh</option><option>Web</option><option>App</option></select>
        <button class="btn right" id="btnCSV">Export CSV</button>
      </div>
      <div style="max-height:60vh; overflow:auto">
        <table class="table" id="tbl">
          <thead><tr>
            <th>Mã</th><th>Khách</th><th>Kênh</th><th>Trạng thái</th><th>Ngày</th><th class="right">Tổng tiền</th>
          </tr></thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="row controls"><button class="btn" id="prev">‹</button><span id="pageInfo" class="muted"></span><button class="btn" id="next">›</button></div>
    </div>
  `;

  const uiKey = "vvv_orders_ui";
  const ui = (()=>{ try{return JSON.parse(localStorage.getItem(uiKey))||{};}catch{return{}} })();
  let page = ui.page||1, per=20, q=ui.q||"", st=ui.st||"", ch=ui.ch||"", from=ui.from||"", to=ui.to||"", sortBy=ui.sortBy||"createdAt", sortDir=ui.sortDir||"desc";
  // hydrate controls
  el("#q").value = q; el("#st").value = st; el("#ch").value = ch; el("#from").value = from; el("#to").value = to;
  const customersById = Object.fromEntries(db.customers.map(c=>[c.id,c]));
  function filtered(){
    const list = db.orders.filter(o=>{
      const cust = customersById[o.customer];
      const text = `${o.id} ${cust?.email||""} ${cust?.name||""}`.toLowerCase();
      const inSt = (!st || o.status===st);
      const inCh = (!ch || o.channel===ch);
      const inQ = (!q || text.includes(q));
      const d = new Date(o.createdAt).toISOString().slice(0,10);
      const inDate = (!from || d>=from) && (!to || d<=to);
      return inQ && inSt && inCh && inDate;
    });
    return list.sort((a,b)=>{
      const va = sortBy==="createdAt"? a.createdAt : a.id; // simple
      const vb = sortBy==="createdAt"? b.createdAt : b.id;
      return sortDir==="asc" ? (va>vb?1:-1) : (va<vb?1:-1);
    });
  }
  function renderPage(){
    const list = filtered();
    const maxPage = Math.max(1, Math.ceil(list.length/per));
    page = Math.min(page, maxPage);
    localStorage.setItem(uiKey, JSON.stringify({page,q,st,ch,from,to,sortBy,sortDir}));
    const rows = list.slice((page-1)*per, page*per).map(o=>{
      const amt = (o.amount - o.discount + o.tax + o.shipping);
      const cust = customersById[o.customer];
      return `<tr>
        <td><a href="javascript:void(0)" data-id="${o.id}" class="lnk">${o.id}</a></td>
        <td>${cust?.name||o.customer}</td>
        <td><span class="tag">${o.channel}</span></td>
        <td><span class="status ${o.status.toLowerCase()}">${o.status}</span></td>
        <td>${fmt.date(o.createdAt)}</td>
        <td class="right">${fmt.money(amt)}</td>
      </tr>`;
    }).join("");
    el("#tbl tbody").innerHTML = rows || `<tr><td colspan="6" class="muted">Không có dữ liệu</td></tr>`;
    el("#pageInfo").textContent = `Trang ${page}/${maxPage} • ${list.length} đơn`;
    // row click
    els(".lnk", el("#tbl")).forEach(a=>a.onclick=()=>showOrderDetail(a.dataset.id));
  }
  function showOrderDetail(id){
    const o = db.orders.find(x=>x.id===id);
    const cust = customersById[o.customer];
    const amt = (o.amount - o.discount + o.tax + o.shipping);
    el("#view").innerHTML = `
      ${card("Chi tiết đơn " + id, `
        <div class="row"><strong>Khách:</strong>&nbsp;${cust?.name||o.customer} &lt;${cust?.email||""}&gt;
          <span class="right status ${o.status.toLowerCase()}">${o.status}</span>
        </div>
        <div class="muted small">Ngày: ${fmt.date(o.createdAt)} • Kênh: ${o.channel}</div>
        <table class="table" style="margin-top:10px">
          <thead><tr><th>SKU</th><th>Tên</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
          <tbody>${o.items.map(it=>`<tr><td>${it.sku}</td><td>${it.name}</td><td>${it.qty}</td><td>${fmt.money(it.price)}</td><td>${fmt.money(it.qty*it.price)}</td></tr>`).join("")}</tbody>
        </table>
        <div class="row" style="justify-content:flex-end; gap:16px; margin-top:8px">
          <div>Tạm tính: <strong>${fmt.money(o.amount)}</strong></div>
          <div>Giảm giá: <strong>${fmt.money(o.discount)}</strong></div>
          <div>Thuế: <strong>${fmt.money(o.tax)}</strong></div>
          <div>Vận chuyển: <strong>${fmt.money(o.shipping)}</strong></div>
          <div>Tổng: <strong>${fmt.money(amt)}</strong></div>
        </div>
        <div class="row" style="margin-top:10px; gap:8px">
          ${["Pending","Paid","Cancelled","Refunded"].map(s => `<button class="btn small ${s===o.status?"":"btn-outline"}" data-st="${s}">${s}</button>`).join("")}
          <button class="btn small right" id="back">← Quay lại</button>
        </div>
      `)}
    `;
    els("[data-st]").forEach(b=>b.onclick=()=>{
      const sess=auth.current();
      if(sess.role==="Staff"){ toast("Staff không được đổi trạng thái"); return; }
      o.status=b.dataset.st; o.history.push({at:fmt.iso(),status:o.status});
      DB.set(db); audit.log("order.status", sess.email, {id:o.id, to:o.status}); toast("Đã cập nhật trạng thái");
      showOrderDetail(id);
    });
    el("#back").onclick=()=>renderOrders();
  }

  // bindings
  el("#q").oninput = debounce(e=>{ q=e.target.value.trim().toLowerCase(); page=1; renderPage(); }, 250);
  el("#st").onchange = e=>{ st=e.target.value; page=1; renderPage(); };
  el("#ch").onchange = e=>{ ch=e.target.value; page=1; renderPage(); };
  el("#from").onchange = e=>{ from=e.target.value; page=1; renderPage(); };
  el("#to").onchange = e=>{ to=e.target.value; page=1; renderPage(); };
  el("#prev").onclick=()=>{ if(page>1){page--; renderPage();} };
  el("#next").onclick=()=>{ page++; renderPage(); };
  el("#btnCSV").onclick=()=>{
    const rows = [["id","customer","channel","status","date","amount"]];
    filtered().forEach(o=>{
      rows.push([o.id, customersById[o.customer]?.email||"", o.channel, o.status, fmt.date(o.createdAt), (o.amount - o.discount + o.tax + o.shipping)]);
    });
    exportCSV(rows, "orders.csv");
  };
  renderPage();
}

function renderProducts(){
  auth.guard();
  const db = DB.get();
  el("#view").innerHTML = `
    <div class="card">
      <div class="row controls">
        <input id="pq" placeholder="Tìm sản phẩm..." autocomplete="off" />
        <select id="pcat"><option value="">Tất cả danh mục</option>${CATEGORIES.map(c=>`<option>${c}</option>`).join("")}</select>
        <button class="btn primary right" id="newP">+ Thêm</button>
      </div>
      <div style="max-height:60vh; overflow:auto">
        <table class="table" id="ptbl">
          <thead><tr><th>SKU</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>${Array.from({length:10}).map(()=>`<tr><td colspan="7"><div class="skeleton skeleton-row"></div></td></tr>`).join("")}</tbody>
        </table>
      </div>
    </div>
    <div id="modal"></div>
  `;
  const uiKey = "vvv_products_ui";
  const ui = (()=>{ try{return JSON.parse(localStorage.getItem(uiKey))||{};}catch{return{}} })();
  let q=ui.q||"", cat=ui.cat||"";
  el("#pq").value = q; el("#pcat").value = cat;
  function rows(){
    return db.products.filter(p=>(!q||p.name.toLowerCase().includes(q)) && (!cat || p.category===cat));
  }
  function renderRows(){
    el("#ptbl tbody").innerHTML = rows().slice(0,200).map(p=>`
      <tr>
        <td>${p.id}</td><td>${p.name}</td><td><span class="tag">${p.category}</span></td>
        <td>${fmt.money(p.price)}</td><td>${p.stock}</td><td>${p.status}</td>
        <td class="right">
          <button class="btn small btn-outline" data-edit="${p.id}">Sửa</button>
          <button class="btn small danger" data-del="${p.id}">Xoá</button>
        </td>
      </tr>`).join("");
    els("[data-edit]").forEach(b=>b.onclick=()=>edit(b.dataset.edit));
    els("[data-del]").forEach(b=>b.onclick=()=>del(b.dataset.del));
    localStorage.setItem(uiKey, JSON.stringify({q,cat}));
  }
  function edit(id){
    const isNew = id==="NEW";
    const p = isNew ? {id:"P"+rand(1000,9999), name:"", category:CATEGORIES[0], price:10000, stock:0, status:"active"} :
                      db.products.find(x=>x.id===id);
    el("#modal").innerHTML = `
      <div class="login-screen" style="display:flex">
        <form class="card login-card" id="pForm" style="width:min(520px,92vw)">
          <h1>${isNew?"Thêm sản phẩm":"Sửa sản phẩm"}</h1>
          <label>SKU</label><input name="id" value="${p.id}" ${isNew?"":"readonly"} required autocomplete="off"/>
          <label>Tên</label><input name="name" value="${p.name}" required autocomplete="off"/>
          <label>Danh mục</label>
          <select name="category">${CATEGORIES.map(c=>`<option ${c===p.category?"selected":""}>${c}</option>`).join("")}</select>
          <label>Giá (VND)</label><input type="number" name="price" value="${p.price}" min="0" required autocomplete="off"/>
          <label>Tồn kho</label><input type="number" name="stock" value="${p.stock}" min="0" required autocomplete="off"/>
          <label>Trạng thái</label>
          <select name="status"><option ${p.status==="active"?"selected":""}>active</option><option ${p.status==="inactive"?"selected":""}>inactive</option></select>
          <div class="row">
            <button class="btn primary">Lưu</button>
            <button type="button" class="btn btn-outline right" id="closeM">Đóng</button>
          </div>
        </form>
      </div>
    `;
    el("#closeM").onclick=()=>el("#modal").innerHTML="";
    el("#pForm").onsubmit=(e)=>{
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      d.price = +d.price; d.stock = +d.stock;
      const idx = db.products.findIndex(x=>x.id===d.id);
      if(idx<0) db.products.unshift(d); else db.products[idx]=d;
      DB.set(db); audit.log(isNew?"product.create":"product.update", auth.current().email, {id:d.id});
      toast("Đã lưu sản phẩm");
      el("#modal").innerHTML=""; renderRows();
    };
  }
  function del(id){
    const sess=auth.current();
    if(sess.role==="Staff"){ toast("Staff không được xoá sản phẩm"); return; }
    const idx = db.products.findIndex(x=>x.id===id);
    if(idx>=0){ db.products.splice(idx,1); DB.set(db); audit.log("product.delete", sess.email, {id}); toast("Đã xoá"); renderRows(); }
  }
  el("#pq").oninput=debounce(e=>{ q=e.target.value.trim().toLowerCase(); renderRows(); }, 250);
  el("#pcat").onchange=e=>{ cat=e.target.value; renderRows(); };
  el("#newP").onclick=()=>edit("NEW");
  renderRows();
}

function renderReports(){
  auth.guard();
  const db = DB.get();
  // group by month
  const byMonth = {};
  db.orders.forEach(o=>{
    const m = new Date(o.createdAt).toISOString().slice(0,7);
    const amt = (o.amount - o.discount + o.tax + o.shipping);
    byMonth[m]=(byMonth[m]||0)+amt;
  });
  const labels = Object.keys(byMonth).sort();
  const data = labels.map(k=>byMonth[k]);

  el("#view").innerHTML = `
    <div class="grid cols-2">
      ${card("Doanh thu theo tháng", `<canvas id="revM"></canvas>`)}
      ${card("Export dữ liệu báo cáo", `
        <button id="csvRep" class="btn">Export CSV</button>
        <p class="muted small">Xuất dòng: tháng, doanh thu</p>
      `)}
    </div>
  `;
  if(window.Chart){
    new Chart(el("#revM"), {type:"bar", data:{labels, datasets:[{data, label:"Revenue"}]}, options:{plugins:{legend:{display:false}}}});
  }
  el("#csvRep").onclick=()=>{
    const rows = [["month","revenue"], ...labels.map((m,i)=>[m, data[i]])];
    exportCSV(rows, "revenue_by_month.csv");
  };
}

function renderAudit(){
  auth.guard();
  const rows = audit.list().map(a=>`
    <tr><td>${fmt.date(a.at)}</td><td>${a.action}</td><td>${a.who||"-"}</td><td>${JSON.stringify(a.meta||{})}</td></tr>
  `).join("");
  el("#view").innerHTML = card("Audit Log", `
    <div style="max-height:70vh; overflow:auto">
      <table class="table"><thead><tr><th>Thời gian</th><th>Hành động</th><th>Ai</th><th>Meta</th></tr></thead>
      <tbody>${rows||`<tr><td colspan="4" class="muted">Trống</td></tr>`}</tbody></table>
    </div>
  `);
}

function renderUsers(){
  const sess=auth.current();
  if(sess.role!=="Admin"){ toast("Chỉ Admin truy cập Users"); go("#/dashboard"); return; }
  const db = DB.get();
  el("#view").innerHTML = card("Người dùng", `
    <table class="table">
      <thead><tr><th>Email</th><th>Vai trò</th></tr></thead>
      <tbody>${db.users.map(u=>`<tr><td>${u.email}</td><td>${u.role}</td></tr>`).join("")}</tbody>
    </table>
  `);
}

// ---------- init ----------
el("#btnLogout").onclick = ()=>{ auth.logout(); showLogin(true); location.hash="#/login"; };
render();

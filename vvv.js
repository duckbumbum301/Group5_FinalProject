/* Vựa Vui Vẻ — Expanded JS (no backend) */

// ========= Utilities =========
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const money = n => n.toLocaleString('vi-VN', { style:'currency', currency:'VND', maximumFractionDigits:0 });
const debounce = (fn, d=300) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), d); }; };
const uid = () => Math.random().toString(36).slice(2,10).toUpperCase();

// ========= i18n (minimal) =========
const I18N = {
  vi: {
    "nav.home":"Trang chủ","nav.products":"Sản phẩm","nav.recipes":"Công thức","nav.orders":"Đơn hàng","nav.account":"Tài khoản",
    "order.detail":"Chi tiết đơn hàng","order.status":"Trạng thái:","order.pending":"Chờ xử lý","order.confirmed":"Đã xác nhận","order.delivered":"Đã giao","order.cancelled":"Đã hủy",
    "btn.search":"Tìm kiếm","btn.cart":"Giỏ hàng","btn.loadmore":"Hiển thị thêm",
    "hero.title":"Đi chợ online, \n tươi — nhanh — vui","hero.desc":"Giao nhanh trong ngày, hàng tươi mỗi sáng. Công thức gợi ý và “thêm tất cả vào giỏ”.",
    "promo.free":"Miễn phí giao ≥ 299k","promo.veg":"Giảm 15% Rau & Củ","promo.fresh":"Tươi mới mỗi ngày",
    "section.products":"Sản phẩm","section.recipes":"Trợ lý công thức","section.orders":"Đơn hàng","section.account":"Tài khoản",
    "filter.fav":"Chỉ xem Yêu thích","filter.perpage":"Hiển thị:","filter.category":"Danh mục:","filter.sort":"Sắp xếp:","filter.maxprice":"Giá tối đa:",
    "category.all":"Tất cả","category.veg":"Rau củ","category.fruit":"Trái cây","category.meat":"Thịt & cá","category.dry":"Đồ khô","category.drink":"Đồ uống",
    "sort.pop":"Phổ biến","sort.asc":"Giá ↑","sort.desc":"Giá ↓","sort.name":"Tên A→Z",
    "tag.organic":"Hữu cơ","tag.best":"Bán chạy",
    "recipe.servings":"Khẩu phần:","recipe.addall":"Thêm tất cả vào giỏ","recipe.hint":"Chọn món trong gợi ý để đúng công thức dữ liệu mẫu.",
    "product.nutrition":"Dinh dưỡng","product.related":"Gợi ý liên quan","product.qty":"SL:","product.add":"Thêm vào giỏ",
    "cart.title":"Giỏ hàng","cart.apply":"Áp dụng","cart.subtotal":"Tạm tính","cart.shipping":"Phí giao","cart.total":"Tổng cộng","cart.checkout":"Thanh toán",
    "checkout.title":"Thanh toán","checkout.step1":"1. Địa chỉ giao hàng","checkout.step2":"2. Xác nhận & thanh toán","checkout.step3":"3. Hoàn tất",
    "account.slot":"Chọn khung giờ giao","account.save":"Lưu thông tin"
  },
  en: {
    "nav.home":"Home","nav.products":"Products","nav.recipes":"Recipes","nav.orders":"Orders","nav.account":"Account",
    "btn.search":"Search","btn.cart":"Cart","btn.loadmore":"Load more",
    "hero.title":"Shop fresh online,\n fast & joyful","hero.desc":"Same-day delivery. Fresh every morning. Recipe suggestions with add-all-to-cart.",
    "promo.free":"Free ship ≥ 299k","promo.veg":"-15% Veggies","promo.fresh":"Fresh daily",
    "section.products":"Products","section.recipes":"Recipe Assistant","section.orders":"Orders","section.account":"Account",
    "filter.fav":"Favorites only","filter.perpage":"Per page:","filter.category":"Category:","filter.sort":"Sort:","filter.maxprice":"Max price:",
    "category.all":"All","category.veg":"Vegetables","category.fruit":"Fruits","category.meat":"Fresh Meat","category.seafood":"Seafood","category.frozen":"Frozen Foods","category.spice":"Seasonings","category.dry":"Dry goods","category.drink":"Drinks",
    "sort.pop":"Popular","sort.asc":"Price ↑","sort.desc":"Price ↓","sort.name":"Name A→Z",
    "tag.organic":"Organic","tag.best":"Bestseller",
    "recipe.servings":"Servings:","recipe.addall":"Add all to cart","recipe.hint":"Pick a suggested recipe to match sample data.",
    "product.nutrition":"Nutrition","product.related":"Related items","product.qty":"Qty:","product.add":"Add to cart",
    "cart.title":"Cart","cart.apply":"Apply","cart.subtotal":"Subtotal","cart.shipping":"Shipping","cart.total":"Grand total","cart.checkout":"Checkout",
    "checkout.title":"Checkout","checkout.step1":"1. Shipping Address","checkout.step2":"2. Review & Pay","checkout.step3":"3. Done",
    "account.slot":"Select delivery slot","account.save":"Save"
  }
};

// ========= Data =========
const PRODUCTS = [
  // Rau củ
  {id:'p1',  name:'Bí đỏ (500g)',       cat:'veg',   price:25000,  unit:'gói',  stock:true,  pop:80, emoji:'🎃', tags:['organic'], nutrition:'Giàu beta-carotene, chất xơ.'},
  {id:'p2',  name:'Rau muống (400g)',   cat:'veg',   price:18000,  unit:'bó',   stock:true,  pop:86, emoji:'🥬', tags:['bestseller'], nutrition:'Vitamin A, C; chất xơ.'},
  {id:'p3',  name:'Cải thìa (400g)',    cat:'veg',   price:22000,  unit:'bó',   stock:true,  pop:60, emoji:'🥗', tags:['organic'], nutrition:'Canxi, vitamin K.'},
  {id:'p4',  name:'Cà rốt (500g)',      cat:'veg',   price:21000,  unit:'gói',  stock:true,  pop:55, emoji:'🥕', tags:['bestseller'], nutrition:'Beta-carotene, chất xơ.'},
  {id:'p5',  name:'Hành lá (100g)',     cat:'veg',   price:8000,   unit:'bó',   stock:true,  pop:74, emoji:'🧅', tags:[], nutrition:'Vitamin K, hợp chất lưu huỳnh.'},
  
  // Trái cây
  {id:'p6',  name:'Táo Fuji (1kg)',     cat:'fruit', price:65000,  unit:'kg',   stock:true,  pop:92, emoji:'🍎', tags:['bestseller'], nutrition:'Chất xơ, vitamin C.'},
  {id:'p7',  name:'Chuối (1kg)',        cat:'fruit', price:38000,  unit:'kg',   stock:true,  pop:70, emoji:'🍌', tags:[], nutrition:'Kali, năng lượng tự nhiên.'},
  {id:'p8',  name:'Cam sành (1kg)',     cat:'fruit', price:52000,  unit:'kg',   stock:true,  pop:68, emoji:'🍊', tags:['organic'], nutrition:'Vitamin C, chất chống oxy hóa.'},
  
  // Thịt tươi
  {id:'p9',  name:'Thịt heo ba rọi (300g)', cat:'meat', price:76000, unit:'khay', stock:true, pop:88, emoji:'🥓', tags:[], nutrition:'Protein, chất béo.'},
  {id:'p10', name:'Phi lê gà (300g)',   cat:'meat',  price:52000,  unit:'khay', stock:true,  pop:64, emoji:'🍗', tags:['bestseller'], nutrition:'Protein nạc.'},
  {id:'p11', name:'Thịt bò xay (300g)', cat:'meat',  price:85000,  unit:'khay', stock:true,  pop:75, emoji:'🥩', tags:[], nutrition:'Protein, sắt, kẽm.'},
  {id:'p12', name:'Ức gà (400g)',       cat:'meat',  price:48000,  unit:'khay', stock:true,  pop:70, emoji:'🍗', tags:['organic'], nutrition:'Protein nạc, ít béo.'},
  
  // Hải sản
  {id:'p13', name:'Cá basa phi lê (400g)', cat:'seafood', price:54000, unit:'khay', stock:true, pop:73, emoji:'🐟', tags:[], nutrition:'Omega-3, protein.'},
  {id:'p14', name:'Tôm sú (300g)',      cat:'seafood', price:120000, unit:'khay', stock:true, pop:82, emoji:'🦐', tags:['bestseller'], nutrition:'Protein, canxi.'},
  {id:'p15', name:'Mực tươi (300g)',    cat:'seafood', price:95000,  unit:'khay', stock:true, pop:78, emoji:'🦑', tags:[], nutrition:'Protein, khoáng chất.'},
  
  // Đồ đông lạnh
  {id:'p16', name:'Viên bò viên (500g)', cat:'frozen', price:65000, unit:'gói', stock:true, pop:65, emoji:'🔵', tags:[], nutrition:'Protein.'},
  {id:'p17', name:'Cá viên (500g)',     cat:'frozen', price:55000, unit:'gói', stock:true, pop:60, emoji:'🔵', tags:[], nutrition:'Protein cá.'},
  {id:'p18', name:'Tôm viên (500g)',    cat:'frozen', price:75000, unit:'gói', stock:true, pop:62, emoji:'🔵', tags:[], nutrition:'Protein hải sản.'},
  
  // Gia vị & Nêm nếm
  {id:'p19', name:'Nước mắm 500ml',     cat:'spice',  price:32000,  unit:'chai', stock:true, pop:84, emoji:'🧂', tags:[], nutrition:'Đạm cá lên men.'},
  {id:'p20', name:'Dầu ăn 1L',          cat:'spice',  price:52000,  unit:'chai', stock:true, pop:76, emoji:'🛢️', tags:[], nutrition:'Lipid; dùng vừa đủ.'},
  {id:'p21', name:'Hạt nêm 500g',       cat:'spice',  price:42000,  unit:'gói',  stock:true, pop:80, emoji:'🧂', tags:['bestseller'], nutrition:'Gia vị tổng hợp.'},
  {id:'p22', name:'Bột ngọt 500g',      cat:'spice',  price:35000,  unit:'gói',  stock:true, pop:75, emoji:'🧂', tags:[], nutrition:'Bột gia vị.'},
  
  // Đồ khô
  {id:'p23', name:'Gạo ST25 (5kg)',     cat:'dry',   price:180000, unit:'túi',  stock:true,  pop:95, emoji:'🍚', tags:['bestseller'], nutrition:'Carb phức, ít tạp chất.'},
  {id:'p24', name:'Mì gói (thùng 30)',  cat:'dry',   price:120000, unit:'thùng', stock:true, pop:88, emoji:'🍜', tags:[], nutrition:'Tiện lợi.'},
  
  // Đồ uống
  {id:'p25', name:'Sữa tươi 1L',        cat:'drink', price:34000,  unit:'hộp',  stock:true,  pop:71, emoji:'🥛', tags:[], nutrition:'Canxi, protein.'},
  {id:'p26', name:'Nước khoáng 500ml',  cat:'drink', price:6000,   unit:'chai', stock:true,  pop:50, emoji:'💧', tags:['bestseller'], nutrition:'Khoáng chất, nước.'},
];

const RECIPES = [
  { name:'Canh bí đỏ', servings:2, items:[
    {match:'Bí đỏ', qty:1}, {match:'Thịt heo ba rọi', qty:1}, {match:'Hành lá', qty:1}, {match:'Nước mắm', qty:1},
  ]},
  { name:'Canh chua cá', servings:2, items:[
    {match:'Cá basa', qty:1}, {match:'Cà rốt', qty:1}, {match:'Hành lá', qty:1}, {match:'Nước mắm', qty:1},
  ]},
  { name:'Rau muống xào', servings:2, items:[
    {match:'Rau muống', qty:1}, {match:'Dầu ăn', qty:1}, {match:'Nước mắm', qty:1},
  ]},
];

// ========= State =========
const LS_CART   = 'vvv_cart';
const LS_FAV    = 'vvv_fav';
const LS_LANG   = 'vvv_lang';
const LS_THEME  = 'vvv_theme';
const LS_COUPON = 'vvv_coupon';
const LS_ACCT   = 'vvv_account';
const LS_ORDERS = 'vvv_orders';

let cart = {};              // { productId: qty }
let favs = new Set();       // Set<productId>
let lang = 'vi';
let theme = 'light';
let coupon = '';
let account = null;
let orders = [];
let visibleCount = 12;

let filters = {
  q: '', cat:'all', sort:'pop', priceMax:250000, favOnly:false,
  tagOrganic:false, tagBestseller:false
};

// ========= DOM Refs =========
const yearEl = $('#year');
const gridEl = $('#productGrid');
const priceRange = $('#priceRange');
const priceValue = $('#priceValue');
const searchToggle = $('#searchToggle');
const orderModal = $('#orderModal');
const orderDetail = $('#orderDetail');
const orderActions = $('#orderActions');
const orderModalClose = $('#orderModalClose');
const searchbar = $('#searchbar');
const searchInput = $('#searchInput');
const sortSelect = $('#sortSelect');
const catFilter = $('#categoryFilter');
const favOnly = $('#favOnly');
const perPage = $('#perPage');
const tagOrganic = $('#tagOrganic');
const tagBestseller = $('#tagBestseller');
const loadMoreBtn = $('#loadMoreBtn');

const langToggle = $('#langToggle');
const themeToggle = $('#themeToggle');

const cartOpenBtn = $('#cartOpenBtn');
const cartBadge = $('#cartBadge');
const cartDrawer = $('#cartDrawer');
const cartOverlay = $('#cartOverlay');
const cartCloseBtn = $('#cartCloseBtn');
const cartItems = $('#cartItems');
const cartSubtotal = $('#cartSubtotal');
const cartShip = $('#cartShip');
const cartGrand = $('#cartGrand');
const applyCouponBtn = $('#applyCouponBtn');
const couponInput = $('#couponInput');
const checkoutBtn = $('#checkoutBtn');

const recipeInput = $('#recipeInput');
const recipeList = $('#recipeList');
const servings = $('#servings');
const recipeAddAllBtn = $('#recipeAddAllBtn');

const ordersList = $('#ordersList');

const accountForm = $('#accountForm');
const accountMsg = $('#accountMsg');

const pm = $('#productModal');
const pmPanel = $('#productModalPanel');
const pmClose = $('#pmClose');
const pmTitle = $('#pmTitle');
const pmThumb = $('#pmThumb');
const pmPrice = $('#pmPrice');
const pmTags = $('#pmTags');
const pmNutri = $('#pmNutri');
const pmRelated = $('#pmRelated');
const pmQty = $('#pmQty');
const pmAddBtn = $('#pmAddBtn');

const checkoutDlg = $('#checkout');
const checkoutClose = $('#checkoutClose');
const coStage = $('#coStage');

const toastBox = $('#toast');

// ========= Category Management =========
function showProductsByCategory(category) {
  $('.category-grid').style.display = 'none';
  $('.products-section').style.display = 'block';
  
  filters.cat = category;
  visibleCount = +perPage.value;
  render();
}

function backToCategories() {
  $('.category-grid').style.display = 'grid';
  $('.products-section').style.display = 'none';
}

// ========= Init =========
function init(){
  yearEl.textContent = new Date().getFullYear();

  try {
    cart = JSON.parse(localStorage.getItem(LS_CART) || '{}');
    favs = new Set(JSON.parse(localStorage.getItem(LS_FAV) || '[]'));
    lang = localStorage.getItem(LS_LANG) || 'vi';
    theme = localStorage.getItem(LS_THEME) || 'light';
    coupon = localStorage.getItem(LS_COUPON) || '';
    account = JSON.parse(localStorage.getItem(LS_ACCT) || 'null');
    orders = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
  } catch {}

  if (theme === 'dark') document.documentElement.classList.add('dark');

  // Datalist recipes
  recipeList.innerHTML = RECIPES.map(r=>`<option value="${r.name}"></option>`).join('');

  // Listeners
  // Category navigation
  $$('.subcategory-list a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const category = e.target.getAttribute('data-category');
      showProductsByCategory(category);
    });
  });
  
  $('#backToCategories').addEventListener('click', backToCategories);
  
  searchToggle.addEventListener('click', toggleSearchbar);
  searchInput.addEventListener('input', debounce(e => { filters.q = (e.target.value||'').trim().toLowerCase(); render(); }, 250));

  catFilter.addEventListener('change', e => { filters.cat = e.target.value; resetVisible(); render(); });
  sortSelect.addEventListener('change', e => { filters.sort = e.target.value; render(); });
  priceRange.addEventListener('input', e => { filters.priceMax = +e.target.value; priceValue.textContent = `≤ ${money(filters.priceMax)}`; render(); });
  favOnly.addEventListener('change', e => { filters.favOnly = e.target.checked; resetVisible(); render(); });

  perPage.addEventListener('change', e => { visibleCount = +e.target.value; render(); });
  tagOrganic.addEventListener('change', e => { filters.tagOrganic = e.target.checked; resetVisible(); render(); });
  tagBestseller.addEventListener('change', e => { filters.tagBestseller = e.target.checked; resetVisible(); render(); });

  loadMoreBtn.addEventListener('click', ()=>{ visibleCount += +perPage.value; render(); });

  langToggle.addEventListener('click', toggleLang);
  themeToggle.addEventListener('click', toggleTheme);

  cartOpenBtn.addEventListener('click', openCart);
  cartCloseBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape'){ if (pm.open) pm.close(); closeCart(); } });

  gridEl.addEventListener('click', onGridClick);

  cartItems.addEventListener('click', onCartClick);
  cartItems.addEventListener('input', onCartQtyInput);
  applyCouponBtn.addEventListener('click', applyCoupon);
  checkoutBtn.addEventListener('click', openCheckout);

  pmAddBtn.addEventListener('click', e => { e.preventDefault(); addToCart(pm.dataset.id, +pmQty.value||1); toast('Đã thêm vào giỏ.'); });
  pmPanel.addEventListener('click', e => {
    const rel = e.target.closest('[data-related]');
    if(rel){ const pid = rel.getAttribute('data-related'); openProduct(pid); }
  });

  recipeAddAllBtn.addEventListener('click', addRecipeToCart);

  accountForm.addEventListener('submit', onSaveAccount);
  
  // Order detail handlers
  ordersList.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="viewOrder"]');
    if (btn) {
      const orderId = btn.getAttribute('data-order-id');
      openOrderDetail(orderId);
    }
  });

  checkoutClose.addEventListener('click', ()=> checkoutDlg.close());

  // First paint
  priceValue.textContent = `≤ ${money(filters.priceMax)}`;
  render();
  renderOrders();
  hydrateAccountForm();
  couponInput.value = coupon;
  applyI18n();
}

function resetVisible(){ visibleCount = +perPage.value; }

// ========= Rendering =========
function applyI18n(){
  const dict = I18N[lang] || I18N.vi;
  $$('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    if (dict[k]) el.textContent = dict[k];
  });
  // hero title supports line break with \n
  const heroTitle = $$('[data-i18n="hero.title"]')[0];
  if (heroTitle) heroTitle.innerHTML = (dict["hero.title"]||'').replace('\n','<br>');
}

function render(){
  let items = PRODUCTS.filter(p => p.stock && p.price <= filters.priceMax);
  if (filters.cat !== 'all') items = items.filter(p => p.cat === filters.cat);
  if (filters.q) items = items.filter(p => p.name.toLowerCase().includes(filters.q));
  if (filters.favOnly) items = items.filter(p => favs.has(p.id));
  if (filters.tagOrganic) items = items.filter(p => p.tags?.includes('organic'));
  if (filters.tagBestseller) items = items.filter(p => p.tags?.includes('bestseller'));

  // sort
  if (filters.sort === 'priceAsc') items.sort((a,b)=>a.price-b.price);
  else if (filters.sort === 'priceDesc') items.sort((a,b)=>b.price-a.price);
  else if (filters.sort === 'nameAsc') items.sort((a,b)=>a.name.localeCompare(b.name,'vi'));
  else items.sort((a,b)=>b.pop-a.pop);

  const total = items.length;
  const slice = items.slice(0, visibleCount);
  gridEl.innerHTML = slice.map(cardHTML).join('') || `<p class="muted">Không tìm thấy sản phẩm phù hợp.</p>`;
  $('#loadMoreBtn').style.display = (visibleCount < total) ? 'inline-flex' : 'none';

  renderCart();
}

function cardHTML(p){
  const catClass = ({veg:'thumb--veg',fruit:'thumb--fruit',meat:'thumb--meat',dry:'thumb--dry',drink:'thumb--drink'})[p.cat] || 'thumb--veg';
  const favPressed = favs.has(p.id) ? 'true':'false';
  const chips = (p.tags||[]).map(t=>`<span class="chip">${t==='organic'?'Hữu cơ':'Bán chạy'}</span>`).join('');
  return `
  <article class="card" data-id="${p.id}">
    <button class="thumb ${catClass}" data-action="detail" aria-label="${p.name}">${p.emoji||'🛒'}</button>
    <div class="name">${p.name}</div>
    <div class="pm-tags">${chips}</div>
    <div class="meta">
      <span class="price">${money(p.price)}</span>
      <div class="kit">
        <button class="btn fav" aria-pressed="${favPressed}" data-action="fav">❤️</button>
        <button class="btn" data-action="detail">Chi tiết</button>
        <button class="btn btn--pri" data-action="add">Thêm</button>
      </div>
    </div>
  </article>`;
}

function renderCart(){
  const entries = Object.entries(cart).filter(([,q])=>q>0);
  const lines = entries.map(([pid, qty])=>{
    const p = PRODUCTS.find(x=>x.id===pid);
    if(!p) return '';
    return `
      <div class="cart-item" data-id="${p.id}">
        <div>
          <strong>${p.name}</strong>
          <div class="muted">${money(p.price)} • ${p.unit}</div>
        </div>
        <div class="qty">
          <label for="qty-${p.id}" class="muted">SL:</label>
          <input id="qty-${p.id}" type="number" min="1" step="1" value="${qty}" data-action="qty">
        </div>
        <button class="btn btn--icon" data-action="remove">Xóa</button>
      </div>
    `;
  }).join('');
  cartItems.innerHTML = lines || `<p class="muted">Giỏ hàng đang trống.</p>`;

  const subtotal = entries.reduce((s,[pid,q])=>{
    const p = PRODUCTS.find(x=>x.id===pid);
    return s + (p ? p.price*q : 0);
  },0);

  const discount = calcDiscount(subtotal);
  const after = Math.max(subtotal - discount, 0);
  const shipping = calcShipping(after);

  cartSubtotal.textContent = money(subtotal);
  cartShip.textContent = money(shipping);
  cartGrand.textContent = money(after + shipping);

  const count = entries.reduce((s,[,q])=>s+q,0);
  cartBadge.textContent = count;

  // persist
  localStorage.setItem(LS_CART, JSON.stringify(cart));
  localStorage.setItem(LS_FAV, JSON.stringify([...favs]));
}

function calcDiscount(subtotal){
  if (!coupon) return 0;
  if (coupon === 'VUI10') return Math.floor(subtotal * 0.10);
  return 0;
}

function calcShipping(amount){
  const FREE_THRES = 299000;
  if (coupon === 'FREESHIP') return 0;
  return amount >= FREE_THRES ? 0 : 20000;
}

function renderOrders(){
  if (!orders?.length){
    ordersList.innerHTML = `<p class="muted">Chưa có đơn hàng.</p>`;
    return;
  }
  ordersList.innerHTML = orders.map(o=>{
    const items = o.items.map(i=>`<li>${i.name} × ${i.qty}</li>`).join('');
    const status = o.status || 'pending';
  const statusText = ({
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy'
  })[status] || 'Chờ xử lý';

  return `
      <div class="order">
        <div>
          <strong>Đơn #${o.id}</strong> • ${new Date(o.ts).toLocaleString('vi-VN')}
          <span class="status status--${status}">${statusText}</span>
        </div>
        <div class="muted">Người nhận: ${o.account?.name} • ${o.account?.phone} • ${o.account?.address} (${o.account?.slot})</div>
        <ul>${items}</ul>
        <div class="order-actions">
          <div><strong>Tổng:</strong> ${money(o.total)}</div>
          <button class="btn" data-order-id="${o.id}" data-action="viewOrder">Xem chi tiết</button>
        </div>
      </div>
    `;
  }).join('');
}

function hydrateAccountForm(){
  if (!account) return;
  for (const el of accountForm.elements){
    if (el.name && account[el.name] !== undefined) el.value = account[el.name];
  }
}

// ========= Events =========
function toggleSearchbar(){
  const isHidden = searchbar.hasAttribute('hidden');
  if (isHidden){ searchbar.removeAttribute('hidden'); searchToggle.setAttribute('aria-expanded','true'); searchInput.focus(); }
  else { searchbar.setAttribute('hidden',''); searchToggle.setAttribute('aria-expanded','false'); }
}

function onGridClick(e){
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const card = e.target.closest('.card');
  const pid = card?.getAttribute('data-id');
  const action = btn.getAttribute('data-action');

  if (action === 'add') addToCart(pid, 1);
  if (action === 'fav') toggleFav(pid, btn);
  if (action === 'detail') openProduct(pid);
}

function onCartClick(e){
  const btn = e.target.closest('[data-action="remove"]');
  if (!btn) return;
  const wrap = e.target.closest('.cart-item');
  const pid = wrap?.getAttribute('data-id');
  if (pid){ delete cart[pid]; render(); }
}

function onCartQtyInput(e){
  const input = e.target.closest('[data-action="qty"]');
  if (!input) return;
  const wrap = e.target.closest('.cart-item');
  const pid = wrap?.getAttribute('data-id');
  let val = parseInt(input.value,10);
  if (Number.isNaN(val) || val < 1) val = 1;
  cart[pid] = val;
  renderCart();
}

function addToCart(pid, qty=1){
  cart[pid] = (cart[pid] || 0) + qty;
  renderCart();
  toast('Đã thêm vào giỏ.');
}

function toggleFav(pid, btn){
  if (favs.has(pid)) favs.delete(pid); else favs.add(pid);
  if (btn) btn.setAttribute('aria-pressed', favs.has(pid) ? 'true':'false');
  localStorage.setItem(LS_FAV, JSON.stringify([...favs]));
  if (filters.favOnly) render();
}

function applyCoupon(){
  coupon = (couponInput.value||'').trim().toUpperCase();
  if (coupon && !['VUI10','FREESHIP'].includes(coupon)){
    toast('Mã không hợp lệ. Dùng VUI10 hoặc FREESHIP.');
    coupon = '';
  } else {
    toast(coupon ? `Đã áp dụng mã ${coupon}.` : 'Đã gỡ mã.');
  }
  localStorage.setItem(LS_COUPON, coupon);
  renderCart();
}

function addRecipeToCart(){
  const r = findRecipeByName(recipeInput.value);
  if (!r){ alert('Không tìm thấy công thức trong dữ liệu mẫu.'); return; }
  const mul = Math.max(parseInt(servings.value,10)||1,1) / (r.servings||1);
  let added = 0;
  for (const it of r.items){
    const p = PRODUCTS.find(x=>x.name.toLowerCase().includes(it.match.toLowerCase()));
    const q = Math.max(1, Math.round((it.qty||1)*mul));
    if (p && q>0){ addToCart(p.id, q); added += q; }
  }
  openCart();
  if (added) toast(`Đã thêm ${added} mục từ công thức.`);
}

function findRecipeByName(name){
  const key = (name||'').trim().toLowerCase();
  return RECIPES.find(r => r.name.toLowerCase() === key);
}

function onSaveAccount(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());
  if (!data.name || !data.phone || !data.address || !data.slot){
    accountMsg.textContent = 'Vui lòng điền đầy đủ thông tin.';
    return;
  }
  account = data;
  localStorage.setItem(LS_ACCT, JSON.stringify(account));
  accountMsg.textContent = 'Đã lưu thông tin.';
  toast('Lưu thông tin tài khoản thành công.');
}

function openCart(){ cartDrawer.removeAttribute('hidden'); }
function closeCart(){ cartDrawer.setAttribute('hidden',''); }

// Product Modal
function openProduct(pid){
  const p = PRODUCTS.find(x=>x.id===pid);
  if (!p) return;
  pm.dataset.id = p.id;
  pmTitle.textContent = p.name;
  pmThumb.textContent = p.emoji || '🛒';
  pmPrice.textContent = money(p.price);
  pmTags.innerHTML = (p.tags||[]).map(t=>`<span class="chip">${t==='organic'?'Hữu cơ':'Bán chạy'}</span>`).join('');
  pmNutri.textContent = p.nutrition || '';
  pmQty.value = 1;
  // related
  const related = PRODUCTS.filter(x=>x.cat===p.cat && x.id!==p.id).slice(0,4);
  pmRelated.innerHTML = related.map(r=>`
    <button class="card" data-related="${r.id}">
      <div class="thumb ${catClassOf(r)}" aria-hidden="true">${r.emoji||'🛒'}</div>
      <div class="name">${r.name}</div>
      <div class="price">${money(r.price)}</div>
    </button>
  `).join('');
  if (!pm.open) pm.showModal();
}
function catClassOf(p){
  return ({veg:'thumb--veg',fruit:'thumb--fruit',meat:'thumb--meat',dry:'thumb--dry',drink:'thumb--drink'})[p.cat] || 'thumb--veg';
}

// Checkout
function openCheckout(){
  if (!Object.values(cart).some(q=>q>0)){ toast('Giỏ hàng trống.'); return; }
  if (!account){ toast('Vui lòng lưu thông tin tài khoản trước.'); location.hash='#account'; return; }
  closeCart();
  renderCheckoutStage1();
  if (!checkoutDlg.open) checkoutDlg.showModal();
}
function renderCheckoutStage1(){
  markStep(1);
  coStage.innerHTML = `
    <div class="account">
      <div><strong>Người nhận:</strong> ${account.name}</div>
      <div><strong>Điện thoại:</strong> ${account.phone}</div>
      <div><strong>Địa chỉ:</strong> ${account.address}</div>
      <div><strong>Khung giờ:</strong> ${account.slot}</div>
      <button class="btn btn--pri" id="coNext1">Tiếp tục</button>
    </div>
  `;
  $('#coNext1').addEventListener('click', renderCheckoutStage2);
}
function renderCheckoutStage2(){
  markStep(2);
  const items = Object.entries(cart).filter(([,q])=>q>0).map(([pid,q])=>{
    const p = PRODUCTS.find(x=>x.id===pid); return `<li>${p?.name||pid} × ${q} — ${money((p?.price||0)*q)}</li>`;
  }).join('');
  const subtotal = Object.entries(cart).reduce((s,[pid,q])=>{ const p = PRODUCTS.find(x=>x.id===pid); return s + (p ? p.price*q : 0); },0);
  const discount = calcDiscount(subtotal);
  const after = Math.max(subtotal - discount, 0);
  const shipping = calcShipping(after);
  const total = after + shipping;

  coStage.innerHTML = `
    <div>
      <ul>${items}</ul>
      <p><strong>Tạm tính:</strong> ${money(subtotal)}</p>
      <p><strong>Giảm giá:</strong> -${money(discount)} ${coupon?`(<code>${coupon}</code>)`:''}</p>
      <p><strong>Phí giao:</strong> ${money(shipping)}</p>
      <p style="font-size:18px"><strong>Tổng cộng:</strong> ${money(total)}</p>
      <button class="btn" id="coBack1">Quay lại</button>
      <button class="btn btn--pri" id="coPay">Xác nhận đặt hàng</button>
    </div>
  `;
  $('#coBack1').addEventListener('click', renderCheckoutStage1);
  $('#coPay').addEventListener('click', ()=> finalizeOrder(total));
}
function finalizeOrder(total){
  markStep(3);
  const id = uid();
  // build items
  const items = Object.entries(cart).filter(([,q])=>q>0).map(([pid,q])=>{
    const p = PRODUCTS.find(x=>x.id===pid); return {id:pid, name:p?.name||pid, qty:q, price:p?.price||0};
  });
  const order = { id, ts:Date.now(), account, items, total, coupon };
  orders.unshift(order);
  localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
  // clear cart
  cart = {};
  localStorage.setItem(LS_CART, JSON.stringify(cart));
  renderCart();
  renderOrders();

  coStage.innerHTML = `
    <div>
      <p>Đặt hàng thành công! Mã đơn <strong>#${id}</strong>.</p>
      <p>Chúng tôi sẽ giao trong khung giờ: <strong>${account.slot}</strong>.</p>
      <button class="btn btn--pri" id="coDone">Xong</button>
    </div>
  `;
  $('#coDone').addEventListener('click', ()=> checkoutDlg.close());
}

// Steps UI
function markStep(n){
  $$('.steps li').forEach(li=>{
    li.classList.toggle('active', +li.getAttribute('data-step') === n);
  });
}

// Lang & Theme
function toggleLang(){
  lang = (lang === 'vi') ? 'en' : 'vi';
  localStorage.setItem(LS_LANG, lang);
  applyI18n();
  toast(lang==='vi'?'Đã chuyển tiếng Việt.':'Switched to English.');
}
function toggleTheme(){
  theme = (theme === 'light') ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', theme==='dark');
  localStorage.setItem(LS_THEME, theme);
}

// Toast
function toast(msg, ms=2200){
  const el = document.createElement('div');
  el.className = 't';
  el.textContent = msg;
  toastBox.appendChild(el);
  setTimeout(()=> el.remove(), ms);
}

// Order Status Management
function updateOrderStatus(orderId, newStatus) {
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return;

  orders[orderIndex] = {
    ...orders[orderIndex],
    status: newStatus,
    statusUpdateTime: Date.now()
  };

  localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
  renderOrders();
  openOrderDetail(orderId);
  toast('Đã cập nhật trạng thái đơn hàng.');
}

// Order Detail Modal
function openOrderDetail(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const status = order.status || 'pending';
  const statusText = ({
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy'
  })[status] || 'Chờ xử lý';

  const items = order.items.map(i => {
    const total = i.price * i.qty;
    return `
      <div class="order-item">
        <div>
          <strong>${i.name}</strong>
          <div class="muted">${money(i.price)} × ${i.qty}</div>
        </div>
        <div>${money(total)}</div>
      </div>
    `;
  }).join('');

  const subtotal = order.items.reduce((s, i) => s + (i.price * i.qty), 0);
  const shipping = calcShipping(subtotal);
  const discount = order.coupon ? calcDiscount(subtotal) : 0;

  orderDetail.innerHTML = `
    <div class="order-detail">
      <div class="order-info">
        <div><strong>Mã đơn:</strong> #${order.id}</div>
        <div><strong>Ngày đặt:</strong> ${new Date(order.ts).toLocaleString('vi-VN')}</div>
        <div><strong data-i18n="order.status">Trạng thái:</strong> <span class="status status--${status}">${statusText}</span></div>
        ${order.statusUpdateTime ? `<div class="muted">Cập nhật: ${new Date(order.statusUpdateTime).toLocaleString('vi-VN')}</div>` : ''}
      </div>
      
      <div class="shipping-info">
        <h4>Thông tin giao hàng:</h4>
        <div><strong>Người nhận:</strong> ${order.account.name}</div>
        <div><strong>Điện thoại:</strong> ${order.account.phone}</div>
        <div><strong>Địa chỉ:</strong> ${order.account.address}</div>
        <div><strong>Khung giờ:</strong> ${order.account.slot}</div>
      </div>

      <div class="items-list">
        <h4>Danh sách sản phẩm:</h4>
        ${items}
      </div>

      <div class="order-summary">
        <div class="total-row"><span>Tạm tính:</span> <span>${money(subtotal)}</span></div>
        <div class="total-row"><span>Phí giao hàng:</span> <span>${money(shipping)}</span></div>
        ${discount ? `<div class="total-row"><span>Giảm giá (${order.coupon}):</span> <span>-${money(discount)}</span></div>` : ''}
        <div class="total-row total-row--grand"><span>Tổng cộng:</span> <span>${money(order.total)}</span></div>
      </div>
    </div>
  `;

  // Render action buttons based on current status
  const actionButtons = [];
  
  if (status === 'pending') {
    actionButtons.push(
      `<button class="btn btn--pri" onclick="updateOrderStatus('${order.id}', 'confirmed')">Xác nhận đơn</button>`,
      `<button class="btn" onclick="updateOrderStatus('${order.id}', 'cancelled')">Hủy đơn</button>`
    );
  } else if (status === 'confirmed') {
    actionButtons.push(
      `<button class="btn btn--pri" onclick="updateOrderStatus('${order.id}', 'delivered')">Xác nhận đã nhận hàng</button>`,
      `<button class="btn" onclick="updateOrderStatus('${order.id}', 'cancelled')">Hủy đơn</button>`
    );
  }

  orderActions.innerHTML = actionButtons.length ? `
    <div class="order-actions-menu">
      ${actionButtons.join('')}
    </div>
  ` : '';

  orderModal.showModal();
}

// ========= Start =========
init();

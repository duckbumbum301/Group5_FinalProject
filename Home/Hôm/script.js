/* ===== Helpers ===== */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => r.querySelectorAll(s);

/* ===== Mobile menu ===== */
function toggleMenu(){
  const el = $('#mainnav');
  if (el) el.classList.toggle('show');
}


/* ===== HERO slides + pagination (gạch-gạch) ===== */
const slides = [
  {
    from:'#0c85a4', to:'#31d0cc',
    img:'../Home/images/BANNER_MUANGAY.png'
  },
  {
    from:'#1b3fb9', to:'#0b7dff',
    img:'../Home/images/BANNER_2.png'   // ✅ thêm ảnh thực tế
  },
  {
    from:'#0a5a8f', to:'#00b8a9',
    img:'../Home/images/BANNER_HEALING.png'
  },
  {
    from:'#4338ca', to:'#6366f1',
    img:'../Home/images/BANNER_SALE50.png'
  },
  {
    from:'#0a7a43', to:'#17b26a',
    img:'../Home/images/BANNER_NEWCOLLECTION.png'
  }
];

let hIndex = 0;
const hero      = $('.hero');
const heroImgs  = $$('.hero-left img'); // ✅ chọn tất cả slide ảnh
const pagiWrap  = $('#hero-pagi');
const pagi      = pagiWrap ? pagiWrap.querySelectorAll('span') : [];

function applySlide(i){
  if (!hero || heroImgs.length === 0) return;
  hIndex = (i + slides.length) % slides.length;
  const s = slides[hIndex];

  // đổi nền gradient
  hero.style.background = `linear-gradient(180deg, ${s.from}, ${s.to})`;

  // ẩn tất cả ảnh và hiển thị ảnh hiện tại
  heroImgs.forEach((img, idx) => {
    img.classList.toggle('active', idx === hIndex);
    img.style.opacity = idx === hIndex ? '1' : '0';
  });

  // cập nhật pagination
  if (pagi.length){
    pagi.forEach((el, idx)=> el.classList.toggle('active', idx === hIndex));
  }
}

function heroPrev(){ applySlide(hIndex - 1); }
function heroNext(){ applySlide(hIndex + 1); }

if (pagi.length){
  pagi.forEach((el, idx)=> el.addEventListener('click', ()=> applySlide(idx)));
}

applySlide(0);

/* ===== Shop slider (auto trượt + progress + nút trái/phải) ===== */
const scroller = $('#scroll');
const bar      = $('#bar');

let dir = 1;                 
let speed = 40;              
let rafId = null;
let lastTs = 0;
let paused = false;          

function getMaxScroll(){
  if (!scroller) return 0;
  return Math.max(0, scroller.scrollWidth - scroller.clientWidth);
}

function setBarByScroll(){
  if (!scroller || !bar) return;
  const max = getMaxScroll();
  const pct = max ? scroller.scrollLeft / max : 0;
  bar.style.width = (10 + pct*90) + '%';
}

function autoTick(ts){
  if (paused || !scroller){ rafId = requestAnimationFrame(autoTick); lastTs = ts; return; }
  if (!lastTs) lastTs = ts;
  const dt = (ts - lastTs) / 1000; 
  lastTs = ts;

  const max = getMaxScroll();
  if (max <= 0){
    setBarByScroll();
    rafId = requestAnimationFrame(autoTick);
    return;
  }

  scroller.scrollLeft += dir * speed * dt;

  const atEnd   = scroller.scrollLeft >= (max - 1);
  const atStart = scroller.scrollLeft <= 0;

  if (atEnd)  { scroller.scrollLeft = max; dir = -1; }
  if (atStart){ scroller.scrollLeft = 0;   dir = 1;  }

  setBarByScroll();
rafId = requestAnimationFrame(autoTick);
}

function startAuto(){ if (!rafId) rafId = requestAnimationFrame(autoTick); }
function stopAuto(){ if (rafId){ cancelAnimationFrame(rafId); rafId = null; } }

document.addEventListener('visibilitychange', ()=>{
  paused = document.hidden;
  if (paused) stopAuto(); else startAuto();
});

if (scroller){
  scroller.addEventListener('mouseenter', ()=> paused = true);
  scroller.addEventListener('mouseleave', ()=> paused = false);
  scroller.addEventListener('focusin',    ()=> paused = true);
  scroller.addEventListener('focusout',   ()=> paused = false);

  let dragging = false;
  scroller.addEventListener('pointerdown', ()=> { dragging = true; paused = true; });
  scroller.addEventListener('pointerup',   ()=> { dragging = false; paused = false; });
  scroller.addEventListener('pointercancel',()=> { dragging = false; paused = false; });

  scroller.addEventListener('wheel', (e)=>{
    if(Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if(e.deltaY !== 0){
      e.preventDefault();
      scroller.scrollBy({left: e.deltaY, behavior:'smooth'});
      setBarByScroll();
    }
  }, {passive:false});

  scroller.addEventListener('scroll', setBarByScroll, {passive:true});
  window.addEventListener('resize', setBarByScroll, {passive:true});
  setBarByScroll();
  startAuto();
}

/* Expose nếu muốn gọi inline từ HTML (nav trái/phải) */
function scrollByX(px){
  if (!scroller) return;
  const prevLeft = scroller.scrollLeft;
  try {
    scroller.scrollBy({ left: px, behavior: 'smooth' });
  } catch (e) {
    // fallback nếu scrollBy không khả dụng
    scroller.scrollLeft = Math.min(getMaxScroll(), Math.max(0, prevLeft + px));
  }
  // nếu sau một nhịp mà không dịch chuyển, ép dịch chuyển trực tiếp
  setTimeout(() => {
    if (Math.abs(scroller.scrollLeft - prevLeft) < 1) {
      scroller.scrollLeft = Math.min(getMaxScroll(), Math.max(0, prevLeft + px));
    }
    setBarByScroll();
  }, 180);
}
window.scrollByX = scrollByX;

// Gắn listener trực tiếp để không phụ thuộc vào DOMContentLoaded
(() => {
  try {
    const leftBtn = document.querySelector('#shop .nav.left');
    const rightBtn = document.querySelector('#shop .nav.right');

    if (leftBtn) {
      leftBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        scrollByX(-360);
      });
    }
    if (rightBtn) {
      rightBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        scrollByX(360);
      });
    }
  } catch (err) {
    console.warn('Shop nav attach error:', err);
  }
})();

/* ===== Hover pill ===== */
const pill     = $('#hover-pill');
const pillName = $('#pill-name');
const pillLine = $('#pill-line');

if (pill){
  $$('.pcard').forEach(card=>{
    card.addEventListener('mouseenter', ()=>{
      if (pillName) pillName.textContent = card.dataset.name || 'Sản phẩm';
      if (pillLine) pillLine.textContent = card.dataset.line || '';
      pill.classList.add('show');
    });
    card.addEventListener('mouseleave', ()=> pill.classList.remove('show'));
    card.addEventListener('touchstart', ()=>{
      if (pillName) pillName.textContent = card.dataset.name || 'Sản phẩm';
      if (pillLine) pillLine.textContent = card.dataset.line || '';
      pill.classList.add('show');
      setTimeout(()=> pill.classList.remove('show'), 1200);
    }, {passive:true});
  });
}

/* ===== Đồng bộ biến chiều cao + header scrolled ===== */
(()=>{
  const root   = document.documentElement;
  const header = $('.header');
  const topbar = $('.topbar');

  function syncVars(){
    const tb = topbar ? topbar.offsetHeight : 0;
    const hd = header ? header.offsetHeight : 0;
    root.style.setProperty('--topbar-h', tb + 'px');
    root.style.setProperty('--header-h', hd + 'px');
  }
  function onScroll(){
    if (!header) return;
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
window.addEventListener('load',  ()=> { syncVars(); onScroll(); });
  window.addEventListener('resize', syncVars, {passive:true});
  window.addEventListener('scroll', onScroll, {passive:true});
})();
/* ===== Account button ===== */
(() => {
  const accountBtn = document.getElementById('accountBtn');
  if (accountBtn) {
    accountBtn.addEventListener('click', () => {
      // Chuyển đến trang tài khoản
      window.location.href = '../../html/account.html';
    });
  }
})();
function handleScrollHeader() {
  const header = document.querySelector(".header");
  if (!header) return;
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

// chạy khi load và khi cuộn
window.addEventListener("scroll", handleScrollHeader);
window.addEventListener("load", handleScrollHeader);
/* ===== Header Home: ẩn nền khi ở đầu trang ===== */
(() => {
  const header = document.querySelector("header.header");
  if (!header) return;

  const toggleHeader = () => {
    if (window.scrollY > 40) {
      header.classList.add("header--solid");
    } else {
      header.classList.remove("header--solid");
    }
  };

})();

 (() => {
  window.addEventListener("load", () => {
    const logoImg = document.querySelector("header.header .logo__img");
    if (!logoImg) return;

    // Đổi logo riêng cho trang Home
    logoImg.src = "../../images/brand/logo.png.png";
    logoImg.alt = "Vựa Vui Vẻ - Home";

    // Giữ scale + translate cố định, không animation
    logoImg.style.transform = "scale(1.86) translateY(8px)";
    logoImg.style.transformOrigin = "left center"; 
    logoImg.style.transition = "none"; // ❌ bỏ animation
  });
})();


window.addEventListener('load', () => {
  document.body.classList.add('ready');
});
// ===== Pop-up vào trang (độc lập, không ảnh hưởng các phần khác) =====
(() => {
  const popup = document.getElementById('entry-popup');
  if (!popup) return;

  const closeBtn = popup.querySelector('.popup-close');
  const modal = popup.querySelector('.popup-modal');

  // Hiển thị popup
  function openPopup() {
    popup.classList.add('show');
    document.documentElement.style.overflow = 'hidden';
  }

  // Ẩn popup
  function closePopup() {
    popup.classList.remove('show');
    document.documentElement.style.overflow = '';
  }

  // Mở popup sau khi trang tải xong (delay nhẹ để mượt)
  window.addEventListener('load', () => {
    setTimeout(openPopup, 500);
  });

  // Đóng khi bấm nút X
  if (closeBtn) closeBtn.addEventListener('click', closePopup);

  // Đóng khi click ra ngoài modal
  popup.addEventListener('click', (e) => {
    if (!modal.contains(e.target)) closePopup();
  });

  // Đóng khi nhấn ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });
})();

(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const logoImg = document.querySelector("header.header .logo__img");
    if (!logoImg) return;
    // Đặt src đúng & ưu tiên tải
    logoImg.src = "../../images/brand/LogoVVV.png";
    logoImg.setAttribute("fetchpriority","high");
    logoImg.decoding = "async";
    // KHÔNG apply transform ở JS nữa
  });
})();s
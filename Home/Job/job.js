// ========== 🌿 VỰA VUI VẺ — ABOUT PAGE SCRIPT ==========

// ===== Toggle mobile menu =====
function toggleMenu() {
  const nav = document.getElementById("mainnav");
  const expanded = nav.classList.contains("show");
  nav.classList.toggle("show", !expanded);

  const btn = document.querySelector(".burger");
  if (btn) btn.setAttribute("aria-expanded", !expanded);
}

// ===== Header scroll shrink effect =====
(() => {
  const header = document.querySelector(".header");
  let lastScrollY = 0;

  function onScroll() {
    const currentY = window.scrollY;

    // Khi cuộn xuống > 40px → thu nhỏ
    if (currentY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScrollY = currentY;
  }

  window.addEventListener("scroll", onScroll);
  window.addEventListener("load", onScroll);
})();

// ===== Fade-in on scroll (section animation) =====
(() => {
  const sections = document.querySelectorAll("section, footer");
  if (!("IntersectionObserver" in window)) {
    sections.forEach(s => s.classList.add("visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(s => io.observe(s));
})();

// ===== ISO Accordion =====
(() => {
  const items = document.querySelectorAll(".iso-item");

  items.forEach((btn) => {
    const panel = btn.nextElementSibling;
    if (!panel) return;

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";

      // Đóng tất cả trước
      document.querySelectorAll(".iso-item").forEach(i => {
        i.setAttribute("aria-expanded", "false");
        const p = i.nextElementSibling;
        if (p) p.style.height = "0px";
      });

      // Mở panel hiện tại nếu chưa mở
      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        panel.style.height = panel.scrollHeight + "px";
      } else {
        btn.setAttribute("aria-expanded", "false");
        panel.style.height = "0px";
      }
    });
  });
})();

// ===== Footer year auto update =====
(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
/* ====== Header shrink on scroll ====== */
(() => {
  const header = document.getElementById('siteHeader');
  if(!header) return;

  const onScroll = () => {
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('load', onScroll);
})();

/* ====== TECH progress 4 gạch ====== */
(() => {
  const rail = document.querySelector('.tech-grid');
  const prog = document.getElementById('techProgress');
  if(!rail || !prog) return;

  // Tạo tối đa 4 gạch dựa trên độ dài scroller
  const pages = Math.max(1, Math.min(4, Math.ceil(rail.scrollWidth / rail.clientWidth)));
  prog.innerHTML = '';
  const dots = [];
  for (let i=0;i<pages;i++){
    const span = document.createElement('span');
    if (i===0) span.classList.add('is-active');
    prog.appendChild(span);
    dots.push(span);
  }

  // Sync gạch theo vị trí scroll
  function sync(){
    const total = Math.max(1, rail.scrollWidth - rail.clientWidth);
    const ratio = total ? (rail.scrollLeft / total) : 0;
    const idx = Math.round(ratio * (pages - 1));
    dots.forEach((d,i)=> d.classList.toggle('is-active', i===idx));
  }
  rail.addEventListener('scroll', () => requestAnimationFrame(sync), { passive:true });

  // Click gạch để nhảy
  dots.forEach((d,i)=>{
    d.style.cursor = 'pointer';
    d.addEventListener('click', () => {
      const total = Math.max(1, rail.scrollWidth - rail.clientWidth);
      const left = (pages === 1) ? 0 : (i * total / (pages - 1));
      rail.scrollTo({ left, behavior:'smooth' });
    });
  });

  // Nhấn phím ← → để lướt
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const step = rail.clientWidth * 0.9;
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    rail.scrollBy({ left: dir * step, behavior: 'smooth' });
  });

  // lần đầu
  sync();
  window.addEventListener('resize', sync);
})();
// ---- reveal on scroll cho các khối có [data-anim] ----
(() => {
  const items = document.querySelectorAll('[data-anim]');
  if (!('IntersectionObserver' in window) || !items.length) {
    items.forEach(el => el.classList.add('show-anim'));
    return;
  }
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show-anim');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.2});
  items.forEach(el => io.observe(el));
})();
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
/* ===== Impact count-up ===== */
(() => {
  const vals = document.querySelectorAll('.impact-val');
  if (!vals.length) return;

  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  const count = (el) => {
    const to = Number(el.dataset.to || 0);
    const suffix = el.dataset.suffix || '';
    const dur = 1200; // ms
    const start = performance.now();

    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const v = Math.round(easeOutCubic(p) * to);
      el.textContent = v.toLocaleString('vi-VN') + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (e.isIntersecting) {
        count(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  vals.forEach(el => {
    el.textContent = '0' + (el.dataset.suffix || '');
    io.observe(el);
  });
})();
function flipCard(card) {
  card.classList.toggle("flipped");
}
function handleScrollHeader() {
  const header = document.querySelector(".header");
  if (!header) return;
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

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

// chạy khi load và khi cuộn
window.addEventListener("scroll", handleScrollHeader);
window.addEventListener("load", handleScrollHeader);
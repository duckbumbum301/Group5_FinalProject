/************* NAV: smooth scroll + indicator + active on scroll *************/
(function initTabs() {
  const tabs = document.querySelectorAll('#tabs .tab');
  const indicator = document.querySelector('#tabs .indicator');

  if (!tabs.length || !indicator) return;

  function moveIndicator(el) {
    const r = el.getBoundingClientRect();
    const rp = el.parentElement.getBoundingClientRect();
    const left = r.left - rp.left;
    indicator.style.left = `${left}px`;
    indicator.style.width = `${r.width}px`;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      const href = tab.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          tabs.forEach(t => t.classList.remove('is-active'));
          tab.classList.add('is-active');
          moveIndicator(tab);
          history.replaceState(null, '', href);
        }
      }
    });
  });

  const sections = document.querySelectorAll('section[data-section]');
  const io = new IntersectionObserver(entries => {
    const topVisible = entries
      .filter(en => en.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!topVisible) return;
    const id = `#${topVisible.target.id}`;
    const active = [...tabs].find(t => t.getAttribute('href') === id) || tabs[0];
    tabs.forEach(t => t.classList.remove('is-active'));
    active.classList.add('is-active');
    moveIndicator(active);
  }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

  sections.forEach(s => io.observe(s));

  const initActive = document.querySelector('#tabs .tab.is-active') || tabs[0];
  moveIndicator(initActive);
  window.addEventListener('resize', () =>
    moveIndicator(document.querySelector('#tabs .tab.is-active') || tabs[0])
  );
})();

/************* RSS CONFIG (mỗi section = 1 RSS Dân Trí) *************/
/*
  - depda      → Sức khỏe      → suc-khoe.rss
  - dinhduong  → Công nghệ     → cong-nghe.rss
  - chuyengia  → Giáo dục      → giao-duc.rss
  - congnghe   → Du lịch       → du-lich.rss
  - monngon    → Đời sống      → doi-song.rss
*/

const SECTIONS = {
  depda: {
    label: 'DÂN TRÍ',
    rss: 'https://dantri.com.vn/rss/suc-khoe.rss',
    more: 'https://dantri.com.vn/suc-khoe.htm',
    layout: 'lead'
  },
  dinhduong: {
    label: 'DÂN TRÍ',
    rss: 'https://dantri.com.vn/rss/cong-nghe.rss',
    more: 'https://dantri.com.vn/cong-nghe.htm',
    layout: 'mini'
  },
  chuyengia: {
    label: 'DÂN TRÍ',
    rss: 'https://dantri.com.vn/rss/giao-duc.rss',
    more: 'https://dantri.com.vn/giao-duc.htm',
    layout: 'mini'
  },
  congnghe: {
    label: 'DÂN TRÍ',
    rss: 'https://dantri.com.vn/rss/du-lich.rss',
    more: 'https://dantri.com.vn/du-lich.htm',
    layout: 'mini'
  },
  monngon: {
    label: 'DÂN TRÍ',
    rss: 'https://dantri.com.vn/rss/doi-song.rss',
    more: 'https://dantri.com.vn/doi-song.htm',
    layout: 'mini'
  }
};

/* Fetch helpers: cache + timeout + proxy fallbacks for faster loads */
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCache(url) {
  try {
    const raw = sessionStorage.getItem(`rss:${url}`);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.ts || !obj.data) return null;
    if (Date.now() - obj.ts > CACHE_TTL) return null;
    return obj.data;
  } catch (_) {
    return null;
  }
}

function setCache(url, data) {
  try {
    sessionStorage.setItem(`rss:${url}`,(JSON.stringify({ ts: Date.now(), data })));
  } catch (_) {}
}

function withTimeout(promise, ms, controller) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        controller?.abort?.();
        reject(new Error('timeout'));
      }, ms);
    })
  ]);
}

async function fetchRSS(url) {
  const cached = getCache(url);
  if (cached) return cached;

  // ưu tiên proxy nội bộ để vượt CORS ổn định nhất, sau đó mới đến public proxies
  const localProxy = (u) => `http://localhost:3000/proxy/rss?url=${encodeURIComponent(u)}`;
  // Jina proxy (r.jina.ai) rất ổn định cho bypass CORS, trả về nội dung thô
  const jinaProxy = (u) => `https://r.jina.ai/http://${u.replace(/^https?:\/\//, '')}`;
  const isomorphic = (u) => `https://cors.isomorphic-git.org/${u}`;
  const allOriginsRaw = (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;
  const allOriginsJson = (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`;
  const thingProxy = (u) => `https://thingproxy.freeboard.io/fetch/${u}`;

  const proxiesPrimary = [
    // Thử các proxy ổn định trước
    isomorphic,
    jinaProxy,
    localProxy,
    allOriginsRaw,
    thingProxy,
    allOriginsJson,
  ];
  // lượt thử thứ hai đảo thứ tự để tăng xác suất thành công
  const proxiesSecondary = [
    allOriginsRaw,
    thingProxy,
    localProxy,
    jinaProxy,
    isomorphic,
    allOriginsJson,
  ];

  async function tryList(list) {
    for (const to of list) {
      try {
        const controller = new AbortController();
        const res = await withTimeout(
          fetch(to(url), { signal: controller.signal }),
          10000,
          controller
        );
        if (!res || !res.ok) throw new Error('bad response');
        let text;
        // Một số proxy (allorigins/get) trả JSON với field `contents`
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const j = await res.json();
          text = j?.contents || '';
        } else {
          text = await res.text();
        }
        if (!text || !(/<item[\s>]/i.test(text) || /<entry[\s>]/i.test(text))) {
          // Nếu nội dung không giống RSS, thử proxy kế tiếp
          throw new Error('not rss');
        }
        setCache(url, text);
        return text;
      } catch (_) {
        // thử proxy kế tiếp
      }
    }
    return null;
  }

  let xml = await tryList(proxiesPrimary);
  if (xml) return xml;
  xml = await tryList(proxiesSecondary);
  if (xml) return xml;
  // Thử lại với phiên bản http (một số nguồn chặn https qua proxy)
  const altUrl = url.replace(/^https:/, 'http:');
  xml = await tryList(proxiesPrimary.map((fn) => (u) => fn(altUrl)));
  if (xml) return xml;
  xml = await tryList(proxiesSecondary.map((fn) => (u) => fn(altUrl)));
  if (xml) return xml;
  throw new Error('Fetch RSS failed');
}

function parseRSS(xmlStr) {
  const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');
  return [...doc.querySelectorAll('item')].map(it => {
    const title = it.querySelector('title')?.textContent?.trim() ?? '';
    const link = it.querySelector('link')?.textContent?.trim() ?? '#';
    const pubDate = it.querySelector('pubDate')?.textContent ?? '';
    const desc = it.querySelector('description')?.textContent ?? '';
    const content = it.querySelector('content\\:encoded')?.textContent ?? desc;

    let img =
      it.querySelector('media\\:content, media\\:thumbnail')?.getAttribute('url') ||
      it.querySelector('enclosure')?.getAttribute('url') ||
      '';

    if (!img) {
      const m = (content || '').match(/<img[^>]+src=["']([^"']+)["']/i);
      if (m) img = m[1];
    }
    return { title, link, pubDate, img };
  });
}

const fmtDate = d => {
  const t = new Date(d);
  return isNaN(t)
    ? ''
    : t.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
};

const skel = (n, small = false) =>
  Array.from({ length: n })
    .map(
      () => `
    <article class="card ${small ? 'card--sm' : ''}">
      <div class="thumb skeleton"></div>
      <div class="pad">
        <div class="cat">Đang tải…</div>
        <div class="title skeleton" style="height:1.2rem;border-radius:6px"></div>
        <div class="meta skeleton" style="height:.9rem;margin-top:8px;border-radius:6px"></div>
      </div>
    </article>`
    )
    .join('');

function render(items, mount, small, label) {
  mount.innerHTML = items
    .map(
      x => `
    <a class="card ${small ? 'card--sm' : ''}" href="${x.link}" target="_blank" rel="noopener">
      <div class="thumb">${x.img ? `<img loading="lazy" decoding="async" referrerpolicy="no-referrer" data-src="${x.img}" alt="">` : ''}</div>
      <div class="pad">
        <div class="cat">${label || ''}</div>
        <div class="title">${x.title || 'Không có tiêu đề'}</div>
        <div class="meta">${fmtDate(x.pubDate)}</div>
      </div>
    </a>`
    )
    .join('');

  // progressive lazy-load: only assign src when near viewport
  const imgs = mount.querySelectorAll('img[data-src]');
  if (imgs.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const img = en.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        io.unobserve(img);
      });
    }, { rootMargin: '200px 0px', threshold: 0.01 });
    imgs.forEach(img => io.observe(img));
  }
}

async function loadSection(key) {
  const conf = SECTIONS[key];
  const mount = document.querySelector(`[data-mount="${key}"]`);
  if (!conf || !mount) return;

  const isLead = conf.layout === 'lead';
  const target = 4; // luôn lấy 4 bài

  mount.innerHTML = skel(target, !isLead);

  const moreBtn = document.getElementById(`more-${key}`);
  if (moreBtn && conf.more) {
    moreBtn.href = conf.more;
  }

  try {
    const xml = await fetchRSS(conf.rss);
    const items = parseRSS(xml).slice(0, target);
    if (items.length) {
      render(items, mount, !isLead, conf.label);
    } else {
      throw 0;
    }
  } catch (e) {
    mount.innerHTML =
      `<div style="grid-column:1/-1;padding:16px;background:#fff3f0;border:1px solid #ffd2c9;border-radius:12px">Không tải được dữ liệu.</div>`;
  }
}

/* Hiệu ứng chuyển động toàn trang khi di chuột */
document.addEventListener('mousemove', e => {
  const xRatio = e.clientX / window.innerWidth - 0.5;
  const yRatio = e.clientY / window.innerHeight - 0.5;
  const maxTilt = 18; // px
  document.documentElement.style.setProperty('--tilt-x', `${-yRatio * maxTilt}px`);
  document.documentElement.style.setProperty('--tilt-y', `${xRatio * maxTilt}px`);
});

/* boot + lazy-load RSS cho nhanh */
document.addEventListener('DOMContentLoaded', () => {
  const keys = ['depda', 'dinhduong', 'chuyengia', 'congnghe', 'monngon'];
  const loaded = new Set();

  // Load nhanh mục đầu tiên (Sức khỏe)
  loadSection(keys[0]);
  loaded.add(keys[0]);

  // Các mục còn lại chỉ fetch khi gần tới viewport
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      if (keys.includes(id) && !loaded.has(id)) {
        loadSection(id);
        loaded.add(id);
      }
    });
  }, { rootMargin: '200px 0px 200px 0px', threshold: 0.1 });

  keys.slice(1).forEach(k => {
    const sec = document.getElementById(k);
    if (sec) io.observe(sec);
  });
});

// js/header.js — Inject a consistent site header across pages
import { bindMegaMenu } from './menu.js';
import { getCart } from './cart.js';

function sumCartQty() {
  try {
    const entries = Object.entries(getCart()).filter(([, q]) => q > 0);
    return entries.reduce((s, [, q]) => s + q, 0);
  } catch { return 0; }
}

function buildHeaderHTML() {
  const iconSearch = `
    <svg class="searchbox__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`;

  // Use absolute link so it works from any page
  const homeHref = '/html/index.html';
  const catalogHref = '/html/index.html#catalog';

  return `
    <div class="container header__row">
      <a href="${homeHref}" class="logo" aria-label="Trang chủ Vựa Vui Vẻ"><img src="../images/brand/LogoVVV1.jpg" alt="Vựa Vui Vẻ" class="logo__img" /></a>
      <nav class="nav" aria-label="Điều hướng chính">
        <div class="nav-item nav-item--dropdown">
          <button
            class="nav-link nav-link--dropdown"
            id="productsMenuToggle"
            aria-expanded="false"
            aria-haspopup="true"
            aria-controls="productsMegaMenu"
          >
            Sản phẩm
            <svg
              class="nav-arrow"
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <div
            id="productsMegaMenu"
            class="mega-menu"
            role="menu"
            aria-labelledby="productsMenuToggle"
            hidden
          >
            <div class="mega-menu__content">
              <!-- Rau củ -->
              <div class="mega-menu__column">
                <h3 class="mega-menu__title">Rau Củ</h3>
                <ul class="mega-menu__list">
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="veg"
                      data-sub="leaf"
                      >Rau lá</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="veg"
                      data-sub="root"
                      >Củ & rễ</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="veg"
                      data-sub="fruit"
                      >Quả rau</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="veg"
                      data-sub="cabbage"
                      >Họ cải</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="veg"
                      data-sub="mushroom"
                      >Nấm</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="veg"
                      data-sub="herb"
                      >Rau thơm & gia vị</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="veg"
                      data-sub="processed"
                      >Đã sơ chế</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="veg"
                      data-sub="organic"
                      >Hữu cơ</a
                    >
                  </li>
                </ul>
              </div>

              <!-- Trái cây -->
              <div class="mega-menu__column">
                <h3 class="mega-menu__title">Trái Cây</h3>
                <ul class="mega-menu__list">
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="fruit"
                      data-sub="mixed"
                      >Trái cây các loại</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="fruit"
                      data-sub="gift"
                      >Giỏ quà</a
                    >
                  </li>
                </ul>
              </div>

              <!-- Thịt cá -->
              <div class="mega-menu__column">
                <h3 class="mega-menu__title">Thịt Cá</h3>
                <ul class="mega-menu__list">
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="meat"
                      data-sub="redmeat"
                      >Thịt đỏ</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="meat"
                      data-sub="pork"
                      >Thịt heo</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="meat"
                      data-sub="poultry"
                      >Gia cầm</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="meat"
                      data-sub="fish"
                      >Cá tươi</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="meat"
                      data-sub="seafood"
                      >Hải sản</a
                    >
                  </li>
                </ul>
              </div>

              <!-- Bia, nước giải khát -->
              <div class="mega-menu__column">
                <h3 class="mega-menu__title">Nước Giải Khát</h3>
                <ul class="mega-menu__list">
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="drink"
                      data-sub="can"
                      >Nước đóng chai</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="drink"
                      data-sub="juice"
                      >Nước ép & sinh tố</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="drink"
                      data-sub="milk"
                      >Sữa & chế phẩm sữa</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="drink"
                      data-sub="tea"
                      >Trà & thảo mộc</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="drink"
                      data-sub="coffee"
                      >Cà phê</a
                    >
                  </li>
                </ul>
              </div>

              <!-- Gạo, bột, đồ khô -->
              <div class="mega-menu__column">
                <h3 class="mega-menu__title">Đồ Khô</h3>
                <ul class="mega-menu__list">
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="dry"
                      data-sub="rice"
                      >Gạo & ngũ cốc</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="dry"
                      data-sub="noodle"
                      >Mì/Bún/Phở khô</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="dry"
                      data-sub="beans"
                      >Đậu & hạt</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="dry"
                      data-sub="flour"
                      >Bột, bột trộn</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="dry"
                      data-sub="canned"
                      >Đồ hộp</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="dry"
                      data-sub="seaweed"
                      >Rong biển & nấm khô</a
                    >
                  </li>
                </ul>
              </div>

              <!-- Gia vị -->
              <div class="mega-menu__column">
                <h3 class="mega-menu__title">Gia Vị</h3>
                <ul class="mega-menu__list">
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="spice"
                      data-sub="oil"
                      >Dầu ăn</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="spice"
                      data-sub="sauce"
                      >Nước chấm</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="spice"
                      data-sub="powder"
                      >Bột nêm & gia vị</a
                    >
                  </li>
                </ul>
              </div>

              <!-- Đồ ngọt -->
              <div class="mega-menu__column">
                <h3 class="mega-menu__title">Đồ Ngọt</h3>
                <ul class="mega-menu__list">
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="sweet"
                      data-sub="candy"
                      >Bánh snack</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="sweet"
                      data-sub="chocolate"
                      >Chocolate</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="sweet"
                      data-sub="snack"
                      >Snack</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="sweet"
                      data-sub="cereal"
                      >Ngũ cốc</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="sweet"
                      data-sub="dried"
                      >Trái cây sấy</a
                    >
                  </li>
                </ul>
              </div>

              <!-- Đồ gia dụng -->
              <div class="mega-menu__column">
                <h3 class="mega-menu__title">Đồ Gia Dụng</h3>
                <ul class="mega-menu__list">
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="household"
                      data-sub="cleaning"
                      >Giấy & khăn</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="household"
                      data-sub="laundry"
                      >Giặt giũ</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="household"
                      data-sub="kitchenware"
                      >Dụng cụ nhà bếp</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="household"
                      data-sub="personal"
                      >Chăm sóc cá nhân</a
                    >
                  </li>
                  <li>
                    <a
                      href="${catalogHref}"
                      class="mega-menu__link"
                      data-category="household"
                      data-sub="bags"
                      >Túi & bao bì</a
                    >
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <a href="recipes.html">Công thức</a>
        <a href="aboutus.html">Giới thiệu</a>
      </nav>
      <div class="actions">
        <div class="searchbox" role="search">
          <input id="searchInput" class="searchbox__input" type="search" placeholder="Search" aria-label="Tìm kiếm sản phẩm" autocomplete="on" />
          <button class="searchbox__btn" aria-label="Tìm">${iconSearch}</button>
        </div>
        <a class="btn btn--icon" id="accountBtn" href="account.html">Tài khoản</a>
        <a class="btn btn--pri" id="cartOpenBtn" href="cart.html">Giỏ hàng <span id="cartBadge" class="badge">0</span></a>
      </div>
    </div>`;
}

function mountHeader() {
  const container = document.querySelector('#siteHeader') || document.querySelector('header.header');
  if (!container) return;
  container.innerHTML = buildHeaderHTML();
  // Bind mega menu for hover/click interactions; on other pages, clicking link navigates to catalog in Home
  bindMegaMenu((e) => {
    const a = e.target.closest('.mega-menu__link');
    if (!a) return;
    // always navigate to homepage catalog to ensure consistent behavior
    a.setAttribute('href', '/html/index.html#catalog');
  });
  // Update cart badge immediately and on cart changes
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = String(sumCartQty());
  document.addEventListener('cart:changed', () => {
    const b = document.getElementById('cartBadge');
    if (b) b.textContent = String(sumCartQty());
  });
}

document.addEventListener('DOMContentLoaded', mountHeader);
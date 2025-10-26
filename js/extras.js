// js/extras.js — Recipes & Contact handlers
import { RECIPES } from './data.js';
import { renderProductsInto } from './ui.js';

export function createExtras({ getAllProducts, addToCart, openCart }) {
  function addRecipeToCart() {
    const recipeInput = document.getElementById('recipeInput');
    const rName = (recipeInput?.value || '').trim().toLowerCase();
    const recipe = RECIPES.find((r) => r.name.toLowerCase() === rName);
    if (!recipe) {
      alert('Không tìm thấy công thức. Vui lòng chọn món từ gợi ý.');
      return;
    }
    const allProducts = typeof getAllProducts === 'function' ? getAllProducts() : [];
    for (const item of recipe.items) {
      const product = allProducts.find((p) =>
        p.name.toLowerCase().includes(item.match.toLowerCase())
      );
      if (product && item.qty > 0) addToCart(product.id, item.qty);
    }
    openCart();
  }

  function showRecipeProducts() {
    const recipeInput = document.getElementById('recipeInput');
    const rName = (recipeInput?.value || '').trim().toLowerCase();
    const recipe = RECIPES.find((r) => r.name.toLowerCase() === rName);
    if (!recipe) {
      alert('Không tìm thấy công thức. Vui lòng chọn món từ gợi ý.');
      return;
    }
    const container = document.getElementById('recipeResults');
    if (!container) {
      alert('Không tìm thấy vùng hiển thị sản phẩm.');
      return;
    }
    const all = typeof getAllProducts === 'function' ? getAllProducts() : [];
    const matched = [];
    for (const item of recipe.items) {
      const p = all.find((prod) => prod.name.toLowerCase().includes(item.match.toLowerCase()));
      if (p) matched.push(p);
    }
    renderProductsInto(container, matched, null);
    // Gắn handler Add cho lưới kết quả (đảm bảo chỉ gắn một lần)
    if (container._recipeHandler) container.removeEventListener('click', container._recipeHandler);
    const onClick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const card = e.target.closest('.card');
      const pid = card?.dataset?.id;
      if (!pid) return;
      const action = btn.dataset.action;
      if (action === 'add') {
        addToCart(pid, 1);
        openCart();
      }
    };
    container._recipeHandler = onClick;
    container.addEventListener('click', onClick);
  }

  function onSubmitContact(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const message = (fd.get('message') || '').toString().trim();
    const contactMsg = document.getElementById('contactMsg');
    if (!name || !email || !message) {
      if (contactMsg) contactMsg.textContent = 'Vui lòng điền đầy đủ thông tin.';
      return;
    }
    if (contactMsg) contactMsg.textContent = 'Đã gửi! (Mô phỏng cho đồ án, không gửi ra ngoài.)';
    e.target.reset();
  }

  return { addRecipeToCart, showRecipeProducts, onSubmitContact };
}
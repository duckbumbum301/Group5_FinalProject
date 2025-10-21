// js/extras.js — Recipes & Contact handlers
import { RECIPES } from './data.js';

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

  return { addRecipeToCart, onSubmitContact };
}
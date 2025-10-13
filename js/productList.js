import { productUtils } from './productUtils.js';

export function renderProducts(containerId, categoryId = null, subId = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let products;
  if (categoryId && subId) {
    products = productUtils.getProductsBySubcategory(categoryId, subId);
  } else if (categoryId) {
    products = productUtils.getProductsByCategory(categoryId);
  } else {
    products = productUtils.getAllProducts();
  }

  const html = products.map(product => `
    <div class="product-item">
      <div class="product-emoji">${product.emoji}</div>
      <h3>${product.name}</h3>
      <p class="price">${product.price.toLocaleString('vi-VN')}đ/${product.unit}</p>
      <button onclick="addToCart('${product.id}')">Thêm vào giỏ</button>
    </div>
  `).join('');

  container.innerHTML = html;
}

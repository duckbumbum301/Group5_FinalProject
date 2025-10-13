import { PRODUCTS, CATEGORIES } from './data.js';

export const productUtils = {
  // Lấy tất cả sản phẩm
  getAllProducts() {
    return PRODUCTS;
  },

  // Lấy sản phẩm theo category
  getProductsByCategory(categoryId) {
    return PRODUCTS.filter(p => p.cat === categoryId);
  },

  // Lấy sản phẩm theo subcategory 
  getProductsBySubcategory(categoryId, subId) {
    return PRODUCTS.filter(p => p.cat === categoryId && p.sub === subId);
  },

  // Lấy category name
  getCategoryName(categoryId) {
    return CATEGORIES[categoryId]?.name || '';
  },

  // Lấy subcategory name
  getSubcategoryName(categoryId, subId) {
    return CATEGORIES[categoryId]?.subcategories[subId]?.name || '';
  }
};

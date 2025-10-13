import { CATEGORIES, PRODUCTS } from './data.js';

export class ProductManager {
  static getProductsBySubcategory(categoryId, subcategoryId) {
    const category = CATEGORIES[categoryId];
    if (!category) return [];
    
    const subcategory = category.subcategories[subcategoryId];
    if (!subcategory) return [];

    return subcategory.products.map(productId => 
      PRODUCTS.find(p => p.id === productId)
    ).filter(p => p != null);
  }

  static updateProduct(productId, newData) {
    const productIndex = PRODUCTS.findIndex(p => p.id === productId);
    if (productIndex >= 0) {
      PRODUCTS[productIndex] = {
        ...PRODUCTS[productIndex],
        ...newData
      };
      return true;
    }
    return false;
  }

  static addProduct(categoryId, subcategoryId, productData) {
    const newProduct = {
      id: `p${PRODUCTS.length + 1}`,
      stock: true,
      pop: 0,
      ...productData
    };
    
    PRODUCTS.push(newProduct);
    CATEGORIES[categoryId].subcategories[subcategoryId].products.push(newProduct.id);
    
    return newProduct;
  }
}

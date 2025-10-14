// js/data.js (Cập nhật danh mục & sản phẩm theo nhóm mới)

export const PRODUCTS = [
  // id, name, category, price (VND), unit, stock, pop, emoji

  // Rau Củ ID 1xx
  {id:'p100',  name:'Bí đỏ (500g)',            cat:'veg', sub:'leaf',   price:25000,  unit:'gói',  stock:true,  pop:80, image: '../images/kem/celano.jpg'},
  // Trái Cây ID 2xx
  {id:'p200',  name:'Bí đỏ (500g)',            cat:'fruit', sub:'mixed',   price:25000,  unit:'gói',  stock:true,  pop:80, image: '../images/kem/celano.jpg'},
  // Thịt Cá ID 3xx
  {id:'p300',  name:'Bí đỏ (500g)',            cat:'vegfruit',   price:25000,  unit:'gói',  stock:true,  pop:80, image: '../images/kem/celano.jpg'},
  // Nước Giải Khát ID 4xx
  {id:'p400',  name:'Bí đỏ (500g)',            cat:'vegfruit',   price:25000,  unit:'gói',  stock:true,  pop:80, image: '../images/kem/celano.jpg'},
  // Đồ Khô ID 5xx 
  {id:'p500',  name:'Bí đỏ (500g)',            cat:'vegfruit',   price:25000,  unit:'gói',  stock:true,  pop:80, image: '../images/kem/celano.jpg'},
  // Gia vị ID 6xx
  {id:'p600',  name:'Bí đỏ (500g)',            cat:'vegfruit',   price:25000,  unit:'gói',  stock:true,  pop:80, image: '../images/kem/celano.jpg'},
  // Đồ Gia Dụng ID 7xx
  {id:'p700',  name:'Bí đỏ (500g)',            cat:'vegfruit',   price:25000,  unit:'gói',  stock:true,  pop:80, image: '../images/kem/celano.jpg'},
  // Đồ Ngọt ID 8xx
  {id:'p800',  name:'Bí đỏ (500g)',            cat:'vegfruit',   price:25000,  unit:'gói',  stock:true,  pop:80, image: '../images/kem/celano.jpg'},
  


];

// Dữ liệu công thức (giữ nguyên logic khớp tên sản phẩm)
export const RECIPES = [
  {
    name: 'Canh bí đỏ',
    items: [
      {match:'Bí đỏ', qty:1},
      {match:'Thịt heo ba rọi', qty:1},
      {match:'Hành lá', qty:1},
      {match:'Nước mắm', qty:1},
    ],
  },
  {
    name: 'Canh chua cá',
    items: [
      {match:'Cá basa', qty:1},
      {match:'Cà rốt', qty:1},
      {match:'Hành lá', qty:1},
      {match:'Nước mắm', qty:1},
    ],
  },
  {
    name: 'Rau muống xào',
    items: [
      {match:'Rau muống', qty:1},
      {match:'Dầu ăn', qty:1},
      {match:'Nước mắm', qty:1},
      {match:'Tỏi', qty:1},
    ],
  },
];

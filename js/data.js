// js/data.js (Chỉ chứa dữ liệu sản phẩm, công thức)

export const PRODUCTS = [
  // id, name, category, price (VND), unit, stock, pop, emoji
  {id:'p1',  name:'Bí đỏ (500g)',       cat:'veg',   price:25000,  unit:'gói',  stock:true,  pop:80, emoji:'🎃'},
  {id:'p2',  name:'Rau muống (400g)',   cat:'veg',   price:18000,  unit:'bó',   stock:true,  pop:86, emoji:'🥬'},
  {id:'p3',  name:'Cải thìa (400g)',    cat:'veg',   price:22000,  unit:'bó',   stock:true,  pop:60, emoji:'🥗'},
  {id:'p4',  name:'Cà rốt (500g)',      cat:'veg',   price:21000,  unit:'gói',  stock:true,  pop:55, emoji:'🥕'},
  {id:'p5',  name:'Hành lá (100g)',     cat:'veg',   price:8000,   unit:'bó',   stock:true,  pop:74, emoji:'🧅'},
  {id:'p6',  name:'Táo Fuji (1kg)',     cat:'fruit', price:65000,  unit:'kg',   stock:true,  pop:92, emoji:'🍎'},
  {id:'p7',  name:'Chuối (1kg)',        cat:'fruit', price:38000,  unit:'kg',   stock:true,  pop:70, emoji:'🍌'},
  {id:'p8',  name:'Cam sành (1kg)',     cat:'fruit', price:52000,  unit:'kg',   stock:true,  pop:68, emoji:'🍊'},
  {id:'p9',  name:'Thịt heo ba rọi (300g)', cat:'meat', price:76000, unit:'khay', stock:true, pop:88, emoji:'🥓'},
  {id:'p10', name:'Phi lê gà (300g)',   cat:'meat',  price:52000,  unit:'khay', stock:true,  pop:64, emoji:'🍗'},
  {id:'p11', name:'Cá basa phi lê (400g)', cat:'meat', price:54000, unit:'khay', stock:true, pop:73, emoji:'🐟'},
  {id:'p12', name:'Gạo ST25 (5kg)',     cat:'dry',   price:180000, unit:'túi',  stock:true,  pop:95, emoji:'🍚'},
  {id:'p13', name:'Nước mắm 500ml',     cat:'dry',   price:32000,  unit:'chai', stock:true,  pop:84, emoji:'🧂'},
  {id:'p14', name:'Dầu ăn 1L',          cat:'dry',   price:52000,  unit:'chai', stock:true,  pop:76, emoji:'🛢️'},
  {id:'p15', name:'Sữa tươi 1L',        cat:'drink', price:34000,  unit:'hộp',  stock:true,  pop:71, emoji:'🥛'},
  {id:'p16', name:'Nước khoáng 500ml',  cat:'drink', price:6000,   unit:'chai', stock:true,  pop:50, emoji:'💧'},
  {id:'p17', name:'Muối tinh 500g',     cat:'spice', price:8000,   unit:'gói',  stock:true,  pop:45, emoji:'🧂'},
  {id:'p18', name:'Đường trắng 1kg',    cat:'spice', price:18000,  unit:'gói',  stock:true,  pop:52, emoji:'🍯'},
  {id:'p19', name:'Tiêu đen 100g',      cat:'spice', price:25000,  unit:'gói',  stock:true,  pop:38, emoji:'🫚'},
  {id:'p20', name:'Tỏi tươi 200g',      cat:'spice', price:15000,  unit:'gói',  stock:true,  pop:48, emoji:'🧄'},
  {id:'p21', name:'Khăn giấy 10 cuộn',  cat:'household', price:45000, unit:'gói', stock:true, pop:65, emoji:'🧻'},
  {id:'p22', name:'Nước rửa chén 500ml', cat:'household', price:28000, unit:'chai', stock:true, pop:58, emoji:'🧽'},
  {id:'p23', name:'Túi nilon 100 cái',   cat:'household', price:12000, unit:'gói', stock:true, pop:42, emoji:'🛍️'},
  {id:'p24', name:'Bánh kẹo mix 500g',   cat:'sweet', price:35000, unit:'gói', stock:true, pop:55, emoji:'🍬'},
  {id:'p25', name:'Socola đen 100g',     cat:'sweet', price:25000, unit:'thanh', stock:true, pop:47, emoji:'🍫'},
  {id:'p26', name:'Bánh quy 200g',       cat:'sweet', price:18000, unit:'gói', stock:true, pop:43, emoji:'🍪'},
];

// Dữ liệu công thức
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
      {match:'Tỏi', qty:0},
    ],
  },
];
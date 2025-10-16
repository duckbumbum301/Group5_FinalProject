// js/data.js — Danh mục sản phẩm hoàn chỉnh + auto sinh

// Hàm tiện ích sinh nhanh sản phẩm
function makeProducts(baseId, cat, sub, list) {
  return list.map((p, i) => ({
    id: `${baseId + i}`,
    name: p.name,
    cat,
    sub,
    price: p.price,
    unit: p.unit || 'gói',
    stock: true,
    pop: Math.floor(Math.random() * 100) + 10,
    image: p.image,
  }));
}

// ====================================================
// 🥬 RAU CỦ
// ====================================================

const VEG_LEAF = makeProducts(100, 'veg', 'leaf', [
  { name: 'Rau muống (500g)', price: 15000, image: '../images/VEG/leaf/raumuong.jpg'},
  { name: 'Cải bẹ xanh (500g)', price: 18000, image: '../images/VEG/leaf/caibexanh.jpg' },
  { name: 'Rau mồng tơi (500g)', price: 16000, image: '../images/VEG/leaf/rau-mong-toi-goi-300g_202506020917306037.jpg' },
]);

const VEG_ROOT = makeProducts(110, 'veg', 'root', [
  { name: 'Cà rốt (500g)', price: 15000, image: '../images/VEG/root/Cà Rốt.jpg' },
  { name: 'Khoai tây (1kg)', price: 20000, image: '../images/VEG/root/Khoai Tây.jpg' },
  { name: 'Bí Đỏ (500g)', price: 18000, image: '../images/VEG/root/Bí Đỏ.jpg' },
]);

const VEG_FRUIT = makeProducts(120, 'veg', 'fruit', [
  { name: 'Bầu sao (500g)', price: 12000, image: '../images/VEG/fruit/bausao.jpg' },
  { name: 'Bí xanh (1kg)', price: 25000, image: '../images/VEG/fruit/bi-xanh-trai-202403181357319493.jpg' },
  { name: 'Cà chua bi (500g)', price: 15000, image: '../images/VEG/fruit/ca-chua-bi-hop-300g_202504140839559740.jpg' },
]);

const VEG_MUSHROOM = makeProducts(130, 'veg', 'mushroom', [
  { name: 'Nấm rơm (200g)', price: 20000, image: '../images/VEG/mushroom/namrom.jpg' },
  { name: 'Nấm kim châm (200g)', price: 18000, image: '../images/VEG/mushroom/namkimcham.jpg' },
]);

// ====================================================
// 🍎 TRÁI CÂY
// ====================================================

const FRUIT_MIXED = makeProducts(200, 'fruit', 'mixed', [
  { name: 'Táo Mỹ (1kg)', price: 85000, image: '../images/FRUIT/Mixed/Táo.jpg' },
  { name: 'Chuối Laba (1kg)', price: 28000, image: '../images/FRUIT/Mixed/Chuối.jpg' },
  { name: 'Cam sành (1kg)', price: 35000, image: '../images/FRUIT/Mixed/Cam.jpg' },
]);

const FRUIT_GIFT = makeProducts(210, 'fruit', 'gift', [
  { name: 'Giỏ trái cây Mix', price: 250000, image: '../images/FRUIT/gift/mix.jpg' },
  { name: 'Giỏ quà cao cấp', price: 480000, image: '../images/FRUIT/gift/caocap.jpg' },
]);

// ====================================================
// 🍖 THỊT CÁ
// ====================================================

const MEAT_PORK = makeProducts(300, 'meat', 'pork', [
  { name: 'Thịt heo ba rọi (500g)', price: 70000, image: '../images/MEAT/pork/baroi.jpg' },
  { name: 'Sườn non (500g)', price: 85000, image: '../images/MEAT/pork/suon.jpg' },
]);

const MEAT_FISH = makeProducts(310, 'meat', 'fish', [
  { name: 'Cá basa phi lê (500g)', price: 55000, image: '../images/MEAT/fish/ca-basa-cat-lat_202505260007155939.jpg' },
  { name: 'Cá hồi cắt lát (200g)', price: 95000, image: '../images/MEAT/fish/cahoi.jpg' },
]);

const MEAT_POULTRY = makeProducts(320, 'meat', 'poultry', [
  { name: 'Ức gà phi lê (500g)', price: 60000, image: '../images/MEAT/poultry/ucga.jpg' },
  { name: 'Đùi gà ta (1kg)', price: 85000, image: '../images/MEAT/poultry/dui.jpg' },
]);

// ====================================================
// 🧃 NƯỚC GIẢI KHÁT
// ====================================================

const DRINK_JUICE = makeProducts(400, 'drink', 'juice', [
  { name: 'Nước cam ép Twister (330ml)', price: 12000, image: '../images/DRINK/juice/epcam.jpg' },
  { name: 'Nước ép táo (350ml)', price: 15000, image: '../images/DRINK/juice/eptao.jpg' },
]);

const DRINK_MILK = makeProducts(410, 'drink', 'milk', [
  { name: 'Sữa tươi Vinamilk (180ml)', price: 9000, image: '../images/DRINK/milk/vinamilk.jpg' },
  { name: 'Sữa đậu nành Fami (200ml)', price: 8000, image: '../images/DRINK/milk/fami.jpg' },
]);

const DRINK_TEA = makeProducts(420, 'drink', 'tea', [
  { name: 'Trà ô long Tea Plus (500ml)', price: 10000, image: '../images/DRINK/tea/olong.jpg' },
  { name: 'Trà chanh C2 (500ml)', price: 9000, image: '../images/DRINK/tea/c2.jpg' },
]);

// ====================================================
// 🍚 ĐỒ KHÔ
// ====================================================

const DRY_RICE = makeProducts(500, 'dry', 'rice', [
  { name: 'Gạo ST25 (1kg)', price: 38000, image: '../images/DRY/rice/st25.jpg' },
  { name: 'Gạo thơm Jasmine (1kg)', price: 32000, image: '../images/DRY/rice/gaothom.jpg' },
]);

const DRY_NOODLE = makeProducts(510, 'dry', 'noodle', [
  { name: 'Mì Hảo Hảo (5 gói)', price: 24000, image: '../images/DRY/noodle/haohao.jpg' },
  { name: 'Bún khô (500g)', price: 22000, image: '../images/DRY/noodle/bunkho.jpg' },
]);

const DRY_BEANS = makeProducts(520, 'dry', 'beans', [
  { name: 'Đậu xanh (500g)', price: 26000, image: '../images/DRY/beans/dauxanh.jpg' },
  { name: 'Đậu đỏ (500g)', price: 25000, image: '../images/DRY/beans/daudo.jpg' },
]);

// ====================================================
// 🧂 GIA VỊ
// ====================================================

const SPICE_SAUCE = makeProducts(600, 'spice', 'sauce', [
  { name: 'Nước mắm Nam Ngư (500ml)', price: 25000, image: '../images/SPICE/Sauce/nuocmam.jpg' },
  { name: 'Nước tương Maggi (500ml)', price: 23000, image: '../images/SPICE/Sauce/nuoctuong.jpg' },
]);

const SPICE_OIL = makeProducts(610, 'spice', 'oil', [
  { name: 'Dầu ăn Neptune (1L)', price: 55000, image: '../images/SPICE/Oil/226995-thumb-moi_202411071422115102.jpg' },
]);

const SPICE_POWDER = makeProducts(620, 'spice', 'powder', [
  { name: 'Muối i-ốt (200g)', price: 6000, image: '../images/SPICE/Powder/muoi.jpg' },
  { name: 'Bột ngọt Ajinomoto (200g)', price: 12000, image: '../images/SPICE/Powder/botngot.jpg' },
]);

// ====================================================
// 🧴 ĐỒ GIA DỤNG
// ====================================================

const HOUSEHOLD_CLEAN = makeProducts(700, 'household', 'cleaning', [
  { name: 'Nước rửa chén Sunlight (750ml)', price: 30000, image: '../images/HOUSEHOLD_CLEAN/nuocruachen.jpg' },
  { name: 'Bột giặt Omo (3kg)', price: 120000, image: '../images/HOUSEHOLD_CLEAN/omo.jpg' },
  { name: 'Khăn giấy Bless You (hộp)', price: 20000, image: '../images/HOUSEHOLD_CLEAN/khangiay.jpg' },
]);

// ====================================================
// 🍫 ĐỒ NGỌT
// ====================================================

const SWEET_SNACK = makeProducts(800, 'sweet', 'snack', [
  { name: 'Bánh Oreo (133g)', price: 15000, image: '../images/SWEET/SNACK/oreo.jpg' },
  { name: 'Bánh gạo One One (100g)', price: 18000, image: '../images/SWEET/SNACK/oneone.jpg' },
]);

const SWEET_CHOCOLATE = makeProducts(810, 'sweet', 'chocolate', [
  { name: 'Socola Snickers (40g)', price: 25000, image: '../images/SWEET/CHOCOLATE/snickers.jpg' },
]);

const SWEET_CANDY = makeProducts(820, 'sweet', 'candy', [
  { name: 'Kẹo Alpenliebe (120g)', price: 18000, image: '../images/SWEET/CANDY/alpenliebe.jpg' },
  { name: 'Kẹo bạc hà Mentos (38g)', price: 15000, image: '../images/SWEET/CANDY/mentos.jpg' },
]);

// ====================================================
// ✅ KẾT HỢP TẤT CẢ
// ====================================================

export const PRODUCTS = [
  ...VEG_LEAF,
  ...VEG_ROOT,
  ...VEG_FRUIT,
  ...VEG_MUSHROOM,
  ...FRUIT_MIXED,
  ...FRUIT_GIFT,
  ...MEAT_PORK,
  ...MEAT_FISH,
  ...MEAT_POULTRY,
  ...DRINK_JUICE,
  ...DRINK_MILK,
  ...DRINK_TEA,
  ...DRY_RICE,
  ...DRY_NOODLE,
  ...DRY_BEANS,
  ...SPICE_SAUCE,
  ...SPICE_OIL,
  ...SPICE_POWDER,
  ...HOUSEHOLD_CLEAN,
  ...SWEET_SNACK,
  ...SWEET_CHOCOLATE,
  ...SWEET_CANDY,
];

// ====================================================
// 🍲 GỢI Ý MÓN ĂN
// ====================================================

export const RECIPES = [
  {
    name: 'Canh bí đỏ',
    items: [
      { match: 'Bí đỏ', qty: 1 },
      { match: 'Thịt heo', qty: 1 },
      { match: 'Hành lá', qty: 1 },
      { match: 'Nước mắm', qty: 1 },
    ],
  },
  {
    name: 'Cá kho tộ',
    items: [
      { match: 'Cá basa', qty: 1 },
      { match: 'Nước mắm', qty: 1 },
      { match: 'Đường', qty: 1 },
    ],
  },
  {
    name: 'Rau muống xào tỏi',
    items: [
      { match: 'Rau muống', qty: 1 },
      { match: 'Dầu ăn', qty: 1 },
      { match: 'Muối', qty: 1 },
    ],
  },
];

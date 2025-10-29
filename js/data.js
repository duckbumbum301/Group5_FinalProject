// js/data.js — Danh mục sản phẩm hoàn chỉnh + auto sinh

// Hàm tiện ích sinh nhanh sản phẩm
function makeProducts(baseId, cat, sub, list) {
  return list.map((p, i) => ({
    id: `${baseId + i}`,
    name: p.name,
    cat,
    sub,
    price: p.price,
    unit: p.unit || "gói",
    stock: true,
    pop: Math.floor(Math.random() * 100) + 10,
    image: p.image,
  }));
}

// ====================================================
// RAU CỦ
// ====================================================

const VEG_LEAF = makeProducts(100, "veg", "leaf", [
  {
    name: "Rau muống (500g)",
    price: 15000,
    image: "../images/VEG/leaf/raumuong.jpg",
  },
  {
    name: "Cải bẹ xanh (500g)",
    price: 18000,
    image: "../images/VEG/leaf/caibexanh.jpg",
  },
  {
    name: "Rau mồng tơi (500g)",
    price: 16000,
    image: "../images/VEG/leaf/rau-mong-toi-goi-300g_202506020917306037.jpg",
  },
  {
    name: "Cải Thia (500g)",
    price: 18000,
    image: "../images/VEG/cabbage/cải thìa.jpg",
  }, // Bổ sung từ file RAR
]);

const VEG_ROOT = makeProducts(110, "veg", "root", [
  {
    name: "Cà rốt (500g)",
    price: 15000,
    image: "../images/VEG/root/Cà Rốt.jpg",
  },
  {
    name: "Khoai tây (1kg)",
    price: 20000,
    image: "../images/VEG/root/Khoai Tây.jpg",
  },
  { name: "Bí Đỏ (500g)", price: 18000, image: "../images/VEG/root/Bí Đỏ.jpg" },
]);

const VEG_FRUIT = makeProducts(120, "veg", "fruit", [
  {
    name: "Bầu sao (500g)",
    price: 12000,
    image: "../images/VEG/fruit/bausao.jpg",
  },
  {
    name: "Bí xanh (1kg)",
    price: 25000,
    image: "../images/VEG/fruit/bi-xanh-trai-202403181357319493.jpg",
  },
  {
    name: "Cà chua bi (500g)",
    price: 15000,
    image: "../images/VEG/fruit/ca-chua-bi-hop-300g_202504140839559740.jpg",
  },
]);

const VEG_MUSHROOM = makeProducts(130, "veg", "mushroom", [
  {
    name: "Nấm rơm (200g)",
    price: 20000,
    image: "../images/VEG/mushroom/namrom.jpg",
  },
  {
    name: "Nấm kim châm (200g)",
    price: 18000,
    image: "../images/VEG/mushroom/namkimcham.jpg",
  },
]);

const VEG_HERB = makeProducts(140, "veg", "herb", [
  {
    name: "Hành Lá (100g)",
    price: 8000,
    image: "../images/VEG/herb/hành lá.jpg",
  }, // Bổ sung từ file RAR
  { name: "Hẹ Lá (100g)", price: 10000, image: "../images/VEG/herb/hẹ lá.jpg" }, // Bổ sung từ file RAR
  {
    name: "Ngò Gai (100g)",
    price: 4000,
    image: "../images/VEG/herb/ngò gai.jpg",
  }, // Bổ sung từ file RAR
]);

const VEG_CABBAGE = makeProducts(150, "veg", "cabbage", [
  {
    name: "Cải bẹ dún (1kg)",
    price: 25000,
    image: "../images/VEG/cabbage/cải bẹ dún.jpg",
  },
  {
    name: "Cải ngồng (500g)",
    price: 30000,
    image: "../images/VEG/cabbage/cải ngồng.jpg",
  },
  {
    name: "Cải ngọt (500g)",
    price: 25000,
    image: "../images/VEG/cabbage/cải ngọt.jpg",
  },
  {
    name: "Cải thìa (500g)",
    price: 15000,
    image: "../images/VEG/cabbage/cải thìa.jpg",
  },
]);

const VEG_ORGANIC = makeProducts(160, "veg", "organic", [
  {
    name: "Xà lách thuỷ tinh thuỷ canh",
    price: 30000,
    image: "../images/VEG/organic/xà lách thuỷ canh.jpg",
  },
]);

const VEG_PROCESSED = makeProducts(170, "veg", "processed", [
  {
    name: "Khổ qua sơ chế",
    price: 30000,
    image: "../images/VEG/processed/khổ qua sơ chế.jpg",
  },
]);

// ====================================================
// TRÁI CÂY
// ====================================================

const FRUIT_MIXED = makeProducts(200, "fruit", "mixed", [
  {
    name: "Táo Mỹ (1kg)",
    price: 85000,
    image: "../images/FRUIT/Mixed/Táo.jpg",
  },
  {
    name: "Chuối Laba (1kg)",
    price: 28000,
    image: "../images/FRUIT/Mixed/Chuối.jpg",
  },
  {
    name: "Cam sành (1kg)",
    price: 35000,
    image: "../images/FRUIT/Mixed/Cam.jpg",
  },
]);

const FRUIT_GIFT = makeProducts(210, "fruit", "gift", [
  {
    name: "Giỏ trái cây Mix",
    price: 250000,
    image: "../images/FRUIT/gift/mix.jpg",
  },
  {
    name: "Giỏ quà cao cấp",
    price: 480000,
    image: "../images/FRUIT/gift/caocap.jpg",
  },
]);

// ====================================================
// THỊT CÁ
// ====================================================

const MEAT_PORK = makeProducts(300, "meat", "pork", [
  {
    name: "Thịt heo ba rọi (500g)",
    price: 70000,
    image: "../images/MEAT/pork/baroi.jpg",
  },
  {
    name: "Sườn non (500g)",
    price: 85000,
    image: "../images/MEAT/pork/suon.jpg",
  },
]);

const MEAT_FISH = makeProducts(310, "meat", "fish", [
  {
    name: "Cá basa phi lê (500g)",
    price: 55000,
    image: "../images/MEAT/fish/ca-basa-cat-lat_202505260007155939.jpg",
  },
  {
    name: "Cá hồi cắt lát (200g)",
    price: 95000,
    image: "../images/MEAT/fish/cahoi.jpg",
  },
]);

const MEAT_POULTRY = makeProducts(320, "meat", "poultry", [
  {
    name: "Ức gà phi lê (500g)",
    price: 60000,
    image: "../images/MEAT/poultry/ucga.jpg",
  },
  {
    name: "Đùi gà ta (1kg)",
    price: 85000,
    image: "../images/MEAT/poultry/dui.jpg",
  },
]);

const MEAT_REDMEAT = makeProducts(330, "meat", "redmeat", [
  { name: "Bắp bò", price: 60000, image: "../images/MEAT/redmeat/bapbo.jpg" },
  { name: "Nạm bò", price: 85000, image: "../images/MEAT/redmeat/nambo.jpg" },
]);

const MEAT_SEAFOOD = makeProducts(340, "meat", "seafood", [
  {
    name: "Bạch tuộc",
    price: 60000,
    image: "../images/MEAT/seafood/bachtuoc.jpg",
  },
  {
    name: "Râu mực",
    price: 85000,
    image: "../images/MEAT/seafood/râu mực.jpg",
  },
]);

// ====================================================
// NƯỚC GIẢI KHÁT
// ====================================================

const DRINK_JUICE = makeProducts(400, "drink", "juice", [
  {
    name: "Nước cam ép Twister (330ml)",
    price: 12000,
    image: "../images/DRINK/juice/epcam.jpg",
  },
  {
    name: "Nước ép táo (350ml)",
    price: 15000,
    image: "../images/DRINK/juice/eptao.jpg",
  },
]);

const DRINK_MILK = makeProducts(410, "drink", "milk", [
  {
    name: "Sữa tươi Vinamilk (180ml)",
    price: 9000,
    image: "../images/DRINK/milk/vinamilk.jpg",
  },
  {
    name: "Sữa đậu nành Fami (200ml)",
    price: 8000,
    image: "../images/DRINK/milk/fami.jpg",
  },
]);

const DRINK_TEA = makeProducts(420, "drink", "tea", [
  {
    name: "Trà ô long Tea Plus (500ml)",
    price: 10000,
    image: "../images/DRINK/tea/olong.jpg",
  },
  {
    name: "Trà chanh C2 (500ml)",
    price: 9000,
    image: "../images/DRINK/tea/c2.jpg",
  },
]);

const DRINK_CAN = makeProducts(430, "drink", "can", [
  {
    name: "soda chanh 7 Up (320ml)",
    price: 10000,
    image: "../images/DRINK/can/7upsodachanh.jpg",
  },
  {
    name: "Nước ngọt Fanta hương dâu lon (320ml)",
    price: 9000,
    image: "../images/DRINK/can/fantadau.jpg",
  },
]);

const DRINK_COFFEE = makeProducts(440, "drink", "coffee", [
  {
    name: "Cà phê phin đậm truyền thống Phương Vy 500g",
    price: 10000,
    image: "../images/DRINK/coffee/caphephin.jpg",
  },
  {
    name: "Cà phê Trung Nguyên S chinh phục thành công 100g",
    price: 9000,
    image: "../images/DRINK/coffee/caphetrungnguyen.jpg",
  },
]);

// ====================================================
// ĐỒ KHÔ
// ====================================================

const DRY_RICE = makeProducts(500, "dry", "rice", [
  {
    name: "Gạo ST25 (1kg)",
    price: 38000,
    image: "../images/DRY/rice/st25.jpg",
  },
  {
    name: "Gạo thơm Jasmine (1kg)",
    price: 32000,
    image: "../images/DRY/rice/gaothom.jpg",
  },
]);

const DRY_NOODLE = makeProducts(510, "dry", "noodle", [
  {
    name: "Mì Hảo Hảo (5 gói)",
    price: 24000,
    image: "../images/DRY/noodle/haohao.jpg",
  },
  {
    name: "Bún khô (500g)",
    price: 22000,
    image: "../images/DRY/noodle/bunkho.jpg",
  },
]);

const DRY_BEANS = makeProducts(520, "dry", "beans", [
  {
    name: "Đậu xanh (500g)",
    price: 26000,
    image: "../images/DRY/beans/dauxanh.jpg",
  },
  {
    name: "Đậu đỏ (500g)",
    price: 25000,
    image: "../images/DRY/beans/daudo.jpg",
  },
]);

const DRY_FLOUR = makeProducts(530, "dry", "flour", [
  {
    name: "Bột phô mai StFood gói 100g",
    price: 26000,
    image: "../images/DRY/flour/bột phô mai.jpg",
  },
  {
    name: "Bột bánh rán Ajinomoto vị truyền thống gói 200g",
    price: 25000,
    image: "../images/DRY/flour/bột bánh rán doraemon.jpg",
  },
]);

const DRY_SEAWEED = makeProducts(540, "dry", "seaweed", [
  {
    name: "Rong biển rắc giòn trộn gia vị",
    price: 26000,
    image: "../images/DRY/seaweed/rong biển giòn.jpg",
  },
  {
    name: "Rong biển nướng giòn trộn chà bông cá hồi ",
    price: 25000,
    image: "../images/DRY/seaweed/rong biển.jpg",
  },
]);

const DRY_CANNED = makeProducts(550, "dry", "canned", [
  {
    name: "Pate thịt bò Vissan ",
    price: 25000,
    image: "../images/DRY/canned/vissan bò 2 lát.png",
  },
  {
    name: "Thịt heo hai lát Vissan (150g)",
    price: 35000,
    image: "../images/DRY/canned/vissan heo 2 lát.png",
  },
]);

// ====================================================
// GIA VỊ
// ====================================================

const SPICE_SAUCE = makeProducts(600, "spice", "sauce", [
  {
    name: "Nước mắm Nam Ngư (500ml)",
    price: 25000,
    image: "../images/SPICE/Sauce/nuocmam.jpg",
  },
  {
    name: "Nước tương Maggi (500ml)",
    price: 23000,
    image: "../images/SPICE/Sauce/nuoctuong.jpg",
  },
]);

const SPICE_OIL = makeProducts(610, "spice", "oil", [
  {
    name: "Dầu ăn Neptune (1L)",
    price: 55000,
    image: "../images/SPICE/Oil/226995-thumb-moi_202411071422115102.jpg",
  },
]);

const SPICE_POWDER = makeProducts(620, "spice", "powder", [
  {
    name: "Muối i-ốt (200g)",
    price: 6000,
    image: "../images/SPICE/Powder/muoi.jpg",
  },
  {
    name: "Bột ngọt Ajinomoto (200g)",
    price: 12000,
    image: "../images/SPICE/Powder/botngot.jpg",
  },
]);

// ====================================================
// ĐỒ GIA DỤNG
// ====================================================

const HOUSEHOLD_BAGS = makeProducts(700, "household", "bags", [
  {
    name: "Túi đựng rác đen",
    price: 20000,
    image: "../images/HOUSEHOLD/bags/tuidungracden.jpg",
  },
  {
    name: "Túi đựng rác màu",
    price: 22000,
    image: "../images/HOUSEHOLD/bags/túi đựng rác màu.jpg",
  },
]);

const HOUSEHOLD_CLEANING = makeProducts(710, "household", "cleaning", [
  {
    name: "Nước rửa chén Sunlight gói",
    price: 10000,
    image: "../images/HOUSEHOLD/cleaning/sunlight gói.jpg",
  },
  {
    name: "Nước rửa chén Sunlight",
    price: 35000,
    image: "../images/HOUSEHOLD/cleaning/sunlight.jpg",
  },
]);

const HOUSEHOLD_KITCHENWARE = makeProducts(720, "household", "kitchenware", [
  {
    name: "Dao bào",
    price: 40000,
    image: "../images/HOUSEHOLD/kitchenware/dao bào.jpg",
  },
  {
    name: "Hộp đựng thực phẩm",
    price: 50000,
    image: "../images/HOUSEHOLD/kitchenware/hộp đựng thực phẩm.jpg",
  },
]);

const HOUSEHOLD_LAUNDRY = makeProducts(730, "household", "laundry", [
  {
    name: "Bột giặt Aba",
    price: 65000,
    image: "../images/HOUSEHOLD/laundry/aba.jpg",
  },
  {
    name: "Bột giặt Omo",
    price: 70000,
    image: "../images/HOUSEHOLD/laundry/omo.jpg",
  },
]);

const HOUSEHOLD_PAPER = makeProducts(740, "household", "paper", [
  {
    name: "Khăn tắm",
    price: 80000,
    image: "../images/HOUSEHOLD/paper/khăn tắm.jpg",
  },
  {
    name: "Giấy vệ sinh Puri",
    price: 30000,
    image: "../images/HOUSEHOLD/paper/puri.jpg",
  },
]);

const HOUSEHOLD_PERSONAL = makeProducts(750, "household", "personal", [
  {
    name: "Kem đánh răng Closeup",
    price: 32000,
    image: "../images/HOUSEHOLD/personal/closeup.jpg",
  },
  {
    name: "Kem dưỡng da Nivea",
    price: 95000,
    image: "../images/HOUSEHOLD/personal/nivea.jpg",
  },
  {
    name: "Dầu gội Sunsilk",
    price: 75000,
    image: "../images/HOUSEHOLD/personal/sunsilk.jpg",
  },
]);

// ====================================================
// ĐỒ NGỌT
// ====================================================

const SWEET_SNACK = makeProducts(800, "sweet", "snack", [
  {
    name: "Bánh Oreo (133g)",
    price: 15000,
    image: "../images/SWEET/SNACK/oreo.jpg",
  },
  {
    name: "Bánh gạo One One (100g)",
    price: 18000,
    image: "../images/SWEET/SNACK/oneone.jpg",
  },
]);

const SWEET_CHOCOLATE = makeProducts(810, "sweet", "chocolate", [
  {
    name: "Socola Snickers (40g)",
    price: 25000,
    image: "../images/SWEET/CHOCOLATE/snickers.jpg",
  },
]);

const SWEET_CANDY = makeProducts(820, "sweet", "candy", [
  {
    name: "Kẹo Alpenliebe (120g)",
    price: 18000,
    image: "../images/SWEET/CANDY/alpenliebe.jpg",
  },
  {
    name: "Kẹo bạc hà Mentos (38g)",
    price: 15000,
    image: "../images/SWEET/CANDY/mentos.jpg",
  },
]);

const SWEET_CEREAL = makeProducts(830, "sweet", "cereal", [
  {
    name: "Ngũ cốc Granola",
    price: 95000,
    image: "../images/SWEET/cereal/ngũ cốc granola.jpg",
  },
]);

// MỨT & TRÁI CÂY SẤY (dried)
const SWEET_DRIED = makeProducts(840, "sweet", "dried", [
  {
    name: "Chuối sấy",
    price: 45000,
    image: "../images/SWEET/dried/chuối sấy.jpg",
  },
  { name: "Mít sấy", price: 50000, image: "../images/SWEET/dried/mít sấy.jpg" },
  {
    name: "Xoài sấy",
    price: 60000,
    image: "../images/SWEET/dried/xoài sấy.jpg",
  },
]);

// ====================================================
// KẾT HỢP TẤT CẢ
// ====================================================

export const PRODUCTS = [
  ...VEG_LEAF,
  ...VEG_ROOT,
  ...VEG_FRUIT,
  ...VEG_MUSHROOM,
  ...VEG_HERB,
  ...VEG_CABBAGE,
  ...VEG_ORGANIC,
  ...VEG_PROCESSED,
  ...FRUIT_MIXED,
  ...FRUIT_GIFT,
  ...MEAT_PORK,
  ...MEAT_FISH,
  ...MEAT_POULTRY,
  ...MEAT_REDMEAT,
  ...MEAT_SEAFOOD,
  ...DRINK_JUICE,
  ...DRINK_MILK,
  ...DRINK_TEA,
  ...DRINK_CAN,
  ...DRINK_COFFEE,
  ...DRY_RICE,
  ...DRY_NOODLE,
  ...DRY_BEANS,
  ...DRY_FLOUR,
  ...DRY_SEAWEED,
  ...DRY_CANNED,
  ...SPICE_SAUCE,
  ...SPICE_OIL,
  ...SPICE_POWDER,
  ...HOUSEHOLD_BAGS,
  ...HOUSEHOLD_CLEANING,
  ...HOUSEHOLD_PERSONAL,
  ...HOUSEHOLD_KITCHENWARE,
  ...HOUSEHOLD_LAUNDRY,
  ...HOUSEHOLD_PAPER,
  ...SWEET_SNACK,
  ...SWEET_CHOCOLATE,
  ...SWEET_CANDY,
  ...SWEET_CEREAL,
  ...SWEET_DRIED,
];

// ====================================================
// 🍲 GỢI Ý MÓN ĂN
// ====================================================

export const RECIPES = [
  {
    name: "Canh bí đỏ",
    image: "../images/recipes/canh-bi-do.jpg",
    items: [
      { match: "Bí đỏ", qty: 1 },
      { match: "Thịt heo", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Nước mắm", qty: 1 },
    ],
  },
  {
    name: "Cá kho tộ",
    image: "../images/recipes/ca-kho-to.jpg",
    items: [
      { match: "Cá basa", qty: 1 },
      { match: "Nước mắm", qty: 1 },
      { match: "Đường", qty: 1 },
    ],
  },
  {
    name: "Rau muống xào tỏi",
    image: "../images/recipes/rau-muong-xao.jpg",
    items: [
      { match: "Rau muống", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Canh chua cá basa",
    image: "../images/recipes/canh-chua-ca-basa.jpg",
    items: [
      { match: "Cá basa", qty: 1 },
      { match: "Cà chua", qty: 1 },
      { match: "Ngò Gai", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Nước mắm", qty: 1 },
    ],
  },
  {
    name: "Canh rau mồng tơi",
    image: "../images/recipes/canh-rau-mong-toi.jpg",
    items: [
      { match: "Rau mồng tơi", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Khoai tây xào thịt heo",
    image: "../images/recipes/khoai-tay-xao-thit-heo.jpg",
    items: [
      { match: "Khoai tây", qty: 1 },
      { match: "Thịt heo", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Cà rốt xào nấm rơm",
    image: "../images/recipes/ca-rot-xao-nam-rom.jpg",
    items: [
      { match: "Cà rốt", qty: 1 },
      { match: "Nấm rơm", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Cải ngọt xào",
    image: "../images/recipes/cai-ngot-xao.jpg",
    items: [
      { match: "Cải ngọt", qty: 1 },
      { match: "Nước tương", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Canh bí xanh thịt heo",
    image: "../images/recipes/canh-bi-xanh-thit-heo.jpg",
    items: [
      { match: "Bí xanh", qty: 1 },
      { match: "Thịt heo", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Canh bầu nấu thịt heo",
    image: "../images/recipes/canh-bau-thit-heo.jpg",
    items: [
      { match: "Bầu sao", qty: 1 },
      { match: "Thịt heo", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Ức gà áp chảo",
    image: "../images/recipes/uc-ga-ap-chao.jpg",
    items: [
      { match: "Ức gà phi lê", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },
  {
    name: "Nấm kim châm xào ức gà",
    image: "../images/recipes/nam-kim-cham-xao-uc-ga.jpg",
    items: [
      { match: "Nấm kim châm", qty: 1 },
      { match: "Ức gà phi lê", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Đùi gà chiên nước mắm",
    image: "../images/recipes/dui-ga-chien-nuoc-mam.jpg",
    items: [
      { match: "Đùi gà ta", qty: 1 },
      { match: "Nước mắm", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },
  {
    name: "Cá hồi áp chảo",
    image: "../images/recipes/ca-hoi-ap-chao.jpg",
    items: [
      { match: "Cá hồi", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },
  {
    name: "Cá basa chiên giòn",
    image: "../images/recipes/ca-basa-chien-gion.jpg",
    items: [
      { match: "Cá basa", qty: 1 },
      { match: "Bột bánh rán", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Bắp bò hầm cà rốt",
    image: "../images/recipes/bop-bo-ham-ca-rot.jpg",
    items: [
      { match: "Bắp bò", qty: 1 },
      { match: "Cà rốt", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Nạm bò xào cải ngồng",
    image: "../images/recipes/nam-bo-xao-cai-ngong.jpg",
    items: [
      { match: "Nạm bò", qty: 1 },
      { match: "Cải ngồng", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Cải thìa xào nấm",
    image: "../images/recipes/cai-thia-xao-nam.jpg",
    items: [
      { match: "Cải thìa", qty: 1 },
      { match: "Nấm rơm", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Bạch tuộc xào rau củ",
    image: "../images/recipes/bach-tuoc-xao-rau-cu.jpg",
    items: [
      { match: "Bạch tuộc", qty: 1 },
      { match: "Cà rốt", qty: 1 },
      { match: "Cải ngọt", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Mực xào hành hẹ",
    image: "../images/recipes/muc-xao-hanh-he.jpg",
    items: [
      { match: "Râu mực", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Hẹ Lá", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },

  {
    name: "Salad xà lách cà chua",
    image: "../images/recipes/salad-xa-lach-ca-chua.jpg",
    items: [
      { match: "Xà lách", qty: 1 },
      { match: "Cà chua", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },

  {
    name: "Bún thịt heo trộn mắm",
    image: "../images/recipes/bun-thit-heo-tron-mam.jpg",
    items: [
      { match: "Bún khô", qty: 1 },
      { match: "Thịt heo", qty: 1 },
      { match: "Nước mắm", qty: 1 },
      { match: "Hành lá", qty: 1 },
    ],
  },
  {
    name: "Mì xào rau củ",
    image: "../images/recipes/mien-xao-rau-cu.jpg",
    items: [
      { match: "Mì Hảo Hảo", qty: 1 },
      { match: "Cà rốt", qty: 1 },
      { match: "Rau muống", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },

  {
    name: "Cơm rong biển đơn giản",
    image: "../images/recipes/com-rong-bien-don-gian.jpg",
    items: [
      { match: "Gạo ST25", qty: 1 },
      { match: "Rong biển", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },

  {
    name: "Canh khổ qua nhồi thịt",
    image: "../images/recipes/canh-kho-qua-nhoi-thit.jpg",
    items: [
      { match: "Khổ qua sơ chế", qty: 1 },
      { match: "Thịt heo", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Nước mắm", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Gà nướng mật ong",
    image: "../images/recipes/ga-nuong-mat-ong.jpg",
    items: [
      { match: "Đùi gà ta", qty: 1 },
      { match: "Mật ong", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },
  {
    name: "Bạch tuộc hấp xả",
    image: "../images/recipes/bach-tuoc-hap-xa.jpg",
    items: [
      { match: "Bạch tuộc", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Nước mắm", qty: 1 },
    ],
  },
  {
    name: "Cơm chiên trứng",
    image: "../images/recipes/com-chien-trung.jpg",
    items: [
      { match: "Gạo ST25", qty: 1 },
      { match: "Trứng gà", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },
  {
    name: "Nấm kim châm hấp",
    image: "../images/recipes/can-nam-kim-cham-hap.jpg",
    items: [
      { match: "Nấm kim châm", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },
  {
    name: "Mực chiên nước mắm",
    image: "../images/recipes/muc-chien-nuoc-mam.jpg",
    items: [
      { match: "Râu mực", qty: 1 },
      { match: "Nước mắm", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },
  {
    name: "Canh măng chua cá basa",
    image: "../images/recipes/canh-mang-chua-ca-basa.jpg",
    items: [
      { match: "Cá basa", qty: 1 },
      { match: "Măng chua", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Nước mắm", qty: 1 },
    ],
  },
  {
    name: "Cải thìa xào thịt bò",
    image: "../images/recipes/cai-thia-xao-thit-bo.jpg",
    items: [
      { match: "Cải thìa", qty: 1 },
      { match: "Nạm bò", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Bắp bò kho tiêu",
    image: "../images/recipes/bap-bo-kho-tieu.jpg",
    items: [
      { match: "Bắp bò", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Nước mắm", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },
  {
    name: "Thịt heo kho gừng",
    image: "../images/recipes/thit-heo-kho-gung.jpg",
    items: [
      { match: "Thịt heo ba rọi", qty: 1 },
      { match: "Nước mắm", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Hành lá", qty: 1 },
    ],
  },
  {
    name: "Cá hồi sốt tiêu đen",
    image: "../images/recipes/ca-hoi-sot-tieu-den.jpg",
    items: [
      { match: "Cá hồi cắt lát", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },
  {
    name: "Ức gà sốt chua ngọt",
    image: "../images/recipes/uc-ga-sot-chua-ngot.jpg",
    items: [
      { match: "Ức gà phi lê", qty: 1 },
      { match: "Nước tương", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },
  {
    name: "Salad bầu trộn giấm",
    image: "../images/recipes/salad-bau-tron-giam.jpg",
    items: [
      { match: "Bầu sao", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Bí xanh hấp",
    image: "../images/recipes/bi-xanh-hap.jpg",
    items: [
      { match: "Bí xanh", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },

  {
    name: "Khoai tây chiên",
    image: "../images/recipes/khoai-tay-chien.jpg",
    items: [
      { match: "Khoai tây", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Cải bẹ xanh luộc",
    image: "../images/recipes/cai-be-xanh-luoc.jpg",
    items: [
      { match: "Cải bẹ xanh", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },

  {
    name: "Canh rau mồng tơi nấu tôm",
    image: "../images/recipes/canh-rau-mong-toi-nau-tom.jpg",
    items: [
      { match: "Rau mồng tơi", qty: 1 },
      { match: "Tôm tươi", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Nước mắm", qty: 1 },
    ],
  },

  {
    name: "Cá basa kho nghệ",
    image: "../images/recipes/ca-basa-kho-nghe.jpg",
    items: [
      { match: "Cá basa phi lê", qty: 1 },
      { match: "Nước mắm", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
    ],
  },

  {
    name: "Xà lách trộn dầu giấm",
    image: "../images/recipes/xa-lach-tron-dau-giam.jpg",
    items: [
      { match: "Xà lách thuỷ canh", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },

  {
    name: "Mỳ xào chay",
    image: "../images/recipes/my-xao-chay.jpg",
    items: [
      { match: "Mì Hảo Hảo", qty: 1 },
      { match: "Cải bẹ xanh", qty: 1 },
      { match: "Dầu ăn", qty: 1 },
      { match: "Muối", qty: 1 },
    ],
  },
  {
    name: "Canh cua rau cải",
    image: "../images/recipes/canh-cua-rau-cai.jpg",
    items: [
      { match: "Cải bẹ xanh", qty: 1 },
      { match: "Cua đồng", qty: 1 },
      { match: "Hành lá", qty: 1 },
      { match: "Muối", qty: 1 },
      { match: "Nước mắm", qty: 1 },
    ],
  },
];

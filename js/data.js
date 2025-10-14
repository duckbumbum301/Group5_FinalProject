// js/data.js (Cập nhật danh mục & sản phẩm theo nhóm mới)

export const PRODUCTS = [
  // id, name, category, price (VND), unit, stock, pop, emoji

  // Rau, Củ, Nấm, Trái Cây (vegfruit)
  {id:'p1',  name:'Bí đỏ (500g)',            cat:'vegfruit',   price:25000,  unit:'gói',  stock:true,  pop:80, image: '../images/kem/celano.jpg'},
  {id:'p2',  name:'Rau muống (400g)',        cat:'vegfruit',   price:18000,  unit:'bó',   stock:true,  pop:86, emoji:'🥬'},
  {id:'p3',  name:'Cải thìa (400g)',         cat:'vegfruit',   price:22000,  unit:'bó',   stock:true,  pop:60, emoji:'🥗'},
  {id:'p4',  name:'Cà rốt (500g)',           cat:'vegfruit',   price:21000,  unit:'gói',  stock:true,  pop:55, emoji:'🥕'},
  {id:'p5',  name:'Hành lá (100g)',          cat:'vegfruit',   price:8000,   unit:'bó',   stock:true,  pop:74, emoji:'🧅'},
  {id:'p6',  name:'Táo Fuji (1kg)',          cat:'vegfruit',   price:65000,  unit:'kg',   stock:true,  pop:92, emoji:'🍎'},
  {id:'p7',  name:'Chuối (1kg)',             cat:'vegfruit',   price:38000,  unit:'kg',   stock:true,  pop:70, emoji:'🍌'},
  {id:'p8',  name:'Cam sành (1kg)',          cat:'vegfruit',   price:52000,  unit:'kg',   stock:true,  pop:68, emoji:'🍊'},
  {id:'p99',  name:'Cam sành (2kg)',          cat:'vegfruit',   price:104000,  unit:'kg',   stock:true,  pop:68, emoji:'🍊'},

  // Thịt, Cá, Trứng, Hải Sản (meatfish)
  {id:'p9',  name:'Thịt heo ba rọi (300g)',  cat:'meatfish',   price:76000,  unit:'khay', stock:true,  pop:88, emoji:'🥓'},
  {id:'p10', name:'Phi lê gà (300g)',        cat:'meatfish',   price:52000,  unit:'khay', stock:true,  pop:64, emoji:'🍗'},
  {id:'p11', name:'Cá basa phi lê (400g)',   cat:'meatfish',   price:54000,  unit:'khay', stock:true,  pop:73, emoji:'🐟'},
  {id:'p27', name:'Trứng gà ta (10 quả)',    cat:'meatfish',   price:38000,  unit:'vỉ',   stock:true,  pop:67, emoji:'🥚'},
  {id:'p28', name:'Tôm thẻ (300g)',          cat:'meatfish',   price:95000,  unit:'khay', stock:true,  pop:62, emoji:'🦐'},
  {id:'p46', name:'Thịt bò thăn (300g)',     cat:'meatfish',   price:119000, unit:'khay', stock:true,  pop:66, emoji:'🥩'},
  {id:'p47', name:'Cua biển (300g)',         cat:'meatfish',   price:135000, unit:'khay', stock:true,  pop:45, emoji:'🦀'},
  {id:'p48', name:'Cá hồi phi lê (300g)',    cat:'meatfish',   price:165000, unit:'khay', stock:true,  pop:72, emoji:'🐟'},

  // Dầu Ăn, Nước Chấm, Gia Vị (cookingoil)
  {id:'p13', name:'Nước mắm 500ml',          cat:'cookingoil', price:32000,  unit:'chai', stock:true,  pop:84, emoji:'🧂'},
  {id:'p14', name:'Dầu ăn 1L',               cat:'cookingoil', price:52000,  unit:'chai', stock:true,  pop:76, emoji:'🛢️'},
  {id:'p17', name:'Muối tinh 500g',          cat:'cookingoil', price:8000,   unit:'gói',  stock:true,  pop:45, emoji:'🧂'},
  {id:'p18', name:'Đường trắng 1kg',         cat:'cookingoil', price:18000,  unit:'gói',  stock:true,  pop:52, emoji:'🍯'},
  {id:'p19', name:'Tiêu đen 100g',           cat:'cookingoil', price:25000,  unit:'gói',  stock:true,  pop:38, emoji:'🫚'},
  {id:'p20', name:'Tỏi tươi 200g',           cat:'cookingoil', price:15000,  unit:'gói',  stock:true,  pop:48, emoji:'🧄'},

  // Bia, Nước Giải Khát (drink)
  {id:'p16', name:'Nước khoáng 500ml',       cat:'drink',      price:6000,   unit:'chai', stock:true,  pop:50, emoji:'💧'},
  {id:'p29', name:'Trà chanh đóng chai',     cat:'drink',      price:12000,  unit:'chai', stock:true,  pop:44, emoji:'🧋'},
  {id:'p30', name:'Bia lon (330ml)',         cat:'drink',      price:15000,  unit:'lon',  stock:true,  pop:59, emoji:'🍺'},

  // Gạo, Bột, Đồ Khô (dry)
  {id:'p12', name:'Gạo ST25 (5kg)',          cat:'dry',        price:180000, unit:'túi',  stock:true,  pop:95, emoji:'🍚'},
  {id:'p31', name:'Bột mì đa dụng 1kg',      cat:'dry',        price:23000,  unit:'gói',  stock:true,  pop:46, emoji:'🌾'},

  // Mì, Miến, Cháo, Phở (noodle)
  {id:'p32', name:'Mì gói (5 gói)',          cat:'noodle',     price:28000,  unit:'lốc',  stock:true,  pop:71, emoji:'🍜'},
  {id:'p33', name:'Miến dong 300g',          cat:'noodle',     price:26000,  unit:'gói',  stock:true,  pop:52, emoji:'🍜'},
  {id:'p34', name:'Phở khô 400g',            cat:'noodle',     price:32000,  unit:'gói',  stock:true,  pop:49, emoji:'🍜'},

  // Sữa Các Loại (milk)
  {id:'p15', name:'Sữa tươi 1L',             cat:'milk',       price:34000,  unit:'hộp',  stock:true,  pop:71, emoji:'🥛'},
  {id:'p35', name:'Sữa hạt óc chó 1L',       cat:'milk',       price:52000,  unit:'hộp',  stock:true,  pop:40, emoji:'🌰'},

  // Kem & Sữa Chua (icecream)
  {id:'p36', name:'Kem vani 450ml',          cat:'icecream',   price:52000,  unit:'hộp',  stock:true,  pop:57, emoji:'🍨'},
  {id:'p37', name:'Sữa chua có đường (4 hũ)',cat:'icecream',   price:28000,  unit:'lốc',  stock:true,  pop:61, emoji:'🥣'},

  // Thực Phẩm Đông Mát (frozen)
  {id:'p38', name:'Ngô hạt đông lạnh 500g',                cat:'frozen', price:26000, unit:'gói', stock:true, pop:42, emoji:'🌽'},
  {id:'p39', name:'Há cảo đông lạnh 300g',                 cat:'frozen', price:48000, unit:'gói', stock:true, pop:54, emoji:'🥟'},
  {id:'p49', name:'Thịt heo viên đông lạnh 500g',          cat:'frozen', price:62000, unit:'gói', stock:true, pop:48, emoji:'🥓'},
  {id:'p50', name:'Hải sản tổng hợp đông lạnh 500g',       cat:'frozen', price:98000, unit:'gói', stock:true, pop:52, emoji:'🦐'},
  {id:'p51', name:'Rau củ thập cẩm đông lạnh 500g',        cat:'frozen', price:45000, unit:'gói', stock:true, pop:46, emoji:'🥦'},

  // Bánh Kẹo (snack)
  {id:'p24', name:'Bánh kẹo mix 500g',       cat:'snack',      price:35000,  unit:'gói',  stock:true,  pop:55, emoji:'🍬'},
  {id:'p25', name:'Socola đen 100g',         cat:'snack',      price:25000,  unit:'thanh',stock:true,  pop:47, emoji:'🍫'},
  {id:'p26', name:'Bánh quy 200g',           cat:'snack',      price:18000,  unit:'gói',  stock:true,  pop:43, emoji:'🍪'},

  // Chăm Sóc Cá Nhân (personalcare)
  {id:'p21', name:'Khăn giấy 10 cuộn',       cat:'personalcare', price:45000, unit:'gói',  stock:true,  pop:65, emoji:'🧻'},
  {id:'p40', name:'Bàn chải đánh răng',      cat:'personalcare', price:15000, unit:'cái',  stock:true,  pop:37, emoji:'🪥'},
  {id:'p41', name:'Sữa tắm 500ml',           cat:'personalcare', price:62000, unit:'chai', stock:true,  pop:35, emoji:'🧴'},

  // Vệ Sinh Nhà Cửa (cleaning)
  {id:'p22', name:'Nước rửa chén 500ml',     cat:'cleaning',   price:28000,  unit:'chai', stock:true,  pop:58, emoji:'🧽'},
  {id:'p42', name:'Nước lau sàn 1L',         cat:'cleaning',   price:45000,  unit:'chai', stock:true,  pop:41, emoji:'🧴'},

  // Sản Phẩm Mẹ Và Bé (baby)
  {id:'p43', name:'Khăn ướt em bé (80 tờ)',  cat:'baby',       price:26000,  unit:'gói',  stock:true,  pop:39, emoji:'🧻'},
  {id:'p44', name:'Bỉm dán size M (48 miếng)',cat:'baby',     price:265000, unit:'bịch', stock:true,  pop:50, emoji:'🍼'},

  // Đồ Dùng Gia Đình (household)
  {id:'p23', name:'Túi nilon 100 cái',       cat:'household',  price:12000,  unit:'gói',  stock:true,  pop:42, emoji:'🛍️'},
  {id:'p45', name:'Hộp đựng thực phẩm 3pcs', cat:'household',  price:65000,  unit:'bộ',   stock:true,  pop:33, emoji:'🧊'}
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

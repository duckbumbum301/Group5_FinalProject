// js/data.js (Chỉ chứa dữ liệu sản phẩm, công thức)

export const CATEGORIES = {
  veg: {
    name: 'Rau củ',
    subcategories: {
      leaf: {
        name: 'Rau xanh'
      },
      root: {
        name: 'Củ quả'
      }
    }
  },
  fruit: {
    name: 'Trái cây',
    subcategories: {
      local: {
        name: 'Trái cây nội'
      },
      import: {
        name: 'Trái cây nhập'
      }
    }
  },
  meat: {
    name: 'Thịt cá',
    subcategories: {
      pork: {
        name: 'Thịt heo'
      },
      chicken: {
        name: 'Thịt gà'
      },
      fish: {
        name: 'Cá'
      }
    }
  },
  dry: {
    name: 'Thực phẩm khô',
    subcategories: {
      rice: {
        name: 'Gạo'
      },
      seasoning: {
        name: 'Gia vị'
      }
    }
  },
  drink: {
    name: 'Đồ uống',
    subcategories: {
      water: {
        name: 'Nước'
      },
      milk: {
        name: 'Sữa'
      }
    }
  },
  spice: {
    name: 'Gia vị',
    subcategories: {
      salt: {
        name: 'Muối'
      },
      sugar: {
        name: 'Đường'
      },
      pepper: {
        name: 'Tiêu'
      },
      garlic: {
        name: 'Tỏi'
      }
    }
  },
  household: {
    name: 'Gia dụng',
    subcategories: {
      paper: {
        name: 'Giấy'
      },
      cleaner: {
        name: 'Chất tẩy rửa'
      },
      plastic: {
        name: 'Nhựa'
      }
    }
  },
  sweet: {
    name: 'Đồ ngọt',
    subcategories: {
      candy: {
        name: 'Kẹo'
      },
      chocolate: {
        name: 'Socola'
      },
      cookie: {
        name: 'Bánh quy'
      }
    }
  }
};

export const PRODUCTS = [
  {
    id: 'p1',
    name: 'Bí đỏ (500g)',
    cat: 'veg',
    sub: 'root',
    price: 25000,
    unit: 'gói',
    stock: true,
    pop: 80,
    emoji: '🎃',
    image: 'products/pumpkin.jpg',
    description: 'Bí đỏ tươi ngon, giàu dinh dưỡng'
  },
  {id:'p2',  name:'Rau muống (400g)',   cat:'veg', sub:'leaf',  price:18000,  unit:'bó',   stock:true,  pop:86, emoji:'🥬'},
  {id:'p3',  name:'Cải thìa (400g)',    cat:'veg', sub:'leaf',  price:22000,  unit:'bó',   stock:true,  pop:60, emoji:'🥗'},
  {id:'p4',  name:'Cà rốt (500g)',      cat:'veg', sub:'root',  price:21000,  unit:'gói',  stock:true,  pop:55, emoji:'🥕'},
  {id:'p5',  name:'Hành lá (100g)',     cat:'veg', sub:'leaf',  price:8000,   unit:'bó',   stock:true,  pop:74, emoji:'🧅'},
  {id:'p27', name:'Rau mồng tơi (500g)', cat:'veg', sub:'leaf', price:15000,  unit:'bó',   stock:true,  pop:72, emoji:'🥬'},
  {id:'p28', name:'Rau dền (500g)',     cat:'veg', sub:'leaf',  price:14000,  unit:'bó',   stock:true,  pop:68, emoji:'🥬'},
  {id:'p29', name:'Rau ngót (500g)',    cat:'veg', sub:'leaf',  price:16000,  unit:'bó',   stock:true,  pop:65, emoji:'🥬'},
  {id:'p6',  name:'Táo Fuji (1kg)',     cat:'fruit', sub:'import', price:65000,  unit:'kg', stock:true, pop:92, emoji:'🍎'},
  {id:'p7',  name:'Chuối (1kg)',        cat:'fruit', sub:'local', price:38000,  unit:'kg', stock:true, pop:70, emoji:'🍌'},
  {id:'p8',  name:'Cam sành (1kg)',     cat:'fruit', sub:'local', price:52000,  unit:'kg', stock:true, pop:68, emoji:'🍊'},
  {id:'p9',  name:'Thịt heo ba rọi (300g)', cat:'meat', sub:'pork', price:76000, unit:'khay', stock:true, pop:88, emoji:'🥓'},
  {id:'p10', name:'Phi lê gà (300g)',    cat:'meat', sub:'chicken', price:52000, unit:'khay', stock:true, pop:64, emoji:'🍗'},
  {id:'p11', name:'Cá basa phi lê (400g)', cat:'meat', sub:'fish', price:54000, unit:'khay', stock:true, pop:73, emoji:'🐟'},
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

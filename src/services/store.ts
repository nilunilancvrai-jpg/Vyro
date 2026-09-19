import {
  UserRole,
  AuthUser,
  UserProfile,
  Category,
  Product,
  Order,
  OrderItem,
  RetailerInventoryItem,
  SalesRecord,
  ProductMovement,
  AIInsight,
  AppNotification,
  OrderStatus,
  PaymentMethod,
} from '../types';

// Default Profiles
export const DEFAULT_RETAILER: UserProfile = {
  id: 'ret_ramesh_01',
  name: 'Ramesh Kumar',
  businessName: 'Ramesh Stores',
  role: 'retailer',
  phone: '+91 98450 23145',
  email: 'ramesh.stores@vyro.in',
  city: 'Bengaluru',
  state: 'Karnataka',
  gstin: '29ABCDE1234F1Z5',
  address: 'Shop #14, 4th Main, Malleshwaram, Bengaluru, Karnataka 560003',
};

export const DEFAULT_WHOLESALER: UserProfile = {
  id: 'who_lakshmi_01',
  name: 'Suresh Patel',
  businessName: 'Shree Lakshmi Wholesale',
  role: 'wholesaler',
  phone: '+91 98860 99421',
  email: 'orders@shreelakshmiwholesale.com',
  city: 'Bengaluru',
  state: 'Karnataka',
  gstin: '29XYZAB9876C1Z3',
  address: 'Warehouse #8, APMC Yard, Yeshwanthpur, Bengaluru, Karnataka 560022',
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_groceries', name: 'Groceries & Staples', icon: 'ShoppingBag', itemCount: 34 },
  { id: 'cat_oil', name: 'Edible Oil & Ghee', icon: 'Droplet', itemCount: 18 },
  { id: 'cat_rice', name: 'Rice & Grains', icon: 'Wheat', itemCount: 22 },
  { id: 'cat_biscuits', name: 'Biscuits & Bakery', icon: 'Cookie', itemCount: 28 },
  { id: 'cat_beverages', name: 'Beverages & Tea', icon: 'Coffee', itemCount: 19 },
  { id: 'cat_snacks', name: 'Snacks & Noodles', icon: 'Utensils', itemCount: 25 },
  { id: 'cat_home', name: 'Home Care & Detergents', icon: 'Sparkles', itemCount: 16 },
  { id: 'cat_personal', name: 'Personal Care & Soaps', icon: 'Heart', itemCount: 20 },
  { id: 'cat_dairy', name: 'Dairy & Spreads', icon: 'Milk', itemCount: 12 },
  { id: 'cat_stationery', name: 'Stationery & General', icon: 'BookOpen', itemCount: 14 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_tata_salt',
    wholesalerId: 'who_lakshmi_01',
    wholesalerName: 'Shree Lakshmi Wholesale',
    name: 'Tata Salt Vaccum Evaporated 1kg',
    brand: 'Tata',
    categoryId: 'cat_groceries',
    categoryName: 'Groceries & Staples',
    image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80',
    description: 'Desh Ka Namak. Pure vacuum evaporated iodized salt for everyday Indian cooking.',
    price: 30, // Retail Selling MRP ₹
    wholesalePrice: 24, // Wholesale price ₹
    costPrice: 19.5, // Wholesaler procurement cost per unit ₹
    moq: 10,
    stock: 240,
    lowStockThreshold: 40,
    deliveryEstimate: 'Tomorrow by 11 AM',
    verified: true,
    createdAt: '2026-03-01T10:00:00Z',
    unit: '1kg Pouch',
  },
  {
    id: 'prod_fortune_oil',
    wholesalerId: 'who_lakshmi_01',
    wholesalerName: 'Shree Lakshmi Wholesale',
    name: 'Fortune Sunlite Refined Sunflower Oil 1L',
    brand: 'Fortune',
    categoryId: 'cat_oil',
    categoryName: 'Edible Oil & Ghee',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    description: 'Light, healthy refined sunflower oil enriched with Vitamins A & D.',
    price: 155,
    wholesalePrice: 132,
    costPrice: 110,
    moq: 12,
    stock: 180,
    lowStockThreshold: 25,
    deliveryEstimate: 'Tomorrow by 2 PM',
    verified: true,
    createdAt: '2026-03-02T10:00:00Z',
    unit: '1L Pouch',
  },
  {
    id: 'prod_aashirvaad_atta',
    wholesalerId: 'who_lakshmi_01',
    wholesalerName: 'Shree Lakshmi Wholesale',
    name: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg',
    brand: 'Aashirvaad',
    categoryId: 'cat_groceries',
    categoryName: 'Groceries & Staples',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    description: '100% pure whole wheat grain atta made using traditional chakki process for soft rotis.',
    price: 260,
    wholesalePrice: 220,
    costPrice: 182,
    moq: 5,
    stock: 95,
    lowStockThreshold: 15,
    deliveryEstimate: 'Tomorrow by 11 AM',
    verified: true,
    createdAt: '2026-03-03T10:00:00Z',
    unit: '5kg Bag',
  },
  {
    id: 'prod_india_gate_rice',
    wholesalerId: 'who_bharat_02',
    wholesalerName: 'Bharat Distributors',
    name: 'India Gate Feast Rozzana Basmati Rice 5kg',
    brand: 'India Gate',
    categoryId: 'cat_rice',
    categoryName: 'Rice & Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    description: 'Aromatic long grain basmati rice ideal for everyday cooking and biryani.',
    price: 490,
    wholesalePrice: 415,
    costPrice: 345,
    moq: 4,
    stock: 110,
    lowStockThreshold: 20,
    deliveryEstimate: '1-2 Business Days',
    verified: true,
    createdAt: '2026-03-04T10:00:00Z',
    unit: '5kg Bag',
  },
  {
    id: 'prod_parle_g',
    wholesalerId: 'who_bharat_02',
    wholesalerName: 'Bharat Distributors',
    name: 'Parle-G Original Gluco Biscuits (Case of 24 × 250g)',
    brand: 'Parle',
    categoryId: 'cat_biscuits',
    categoryName: 'Biscuits & Bakery',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
    description: 'The iconic glucose biscuit filled with energy and tradition. High turnover product.',
    price: 35, // per pack MRP
    wholesalePrice: 28, // wholesale per pack in carton
    costPrice: 23,
    moq: 24,
    stock: 350,
    lowStockThreshold: 50,
    deliveryEstimate: 'Tomorrow by 11 AM',
    verified: true,
    createdAt: '2026-03-05T10:00:00Z',
    unit: 'Carton (24 Packs)',
  },
  {
    id: 'prod_britannia_good_day',
    wholesalerId: 'who_bharat_02',
    wholesalerName: 'Bharat Distributors',
    name: 'Britannia Good Day Cashew Cookies (Pack of 12 × 100g)',
    brand: 'Britannia',
    categoryId: 'cat_biscuits',
    categoryName: 'Biscuits & Bakery',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
    description: 'Rich buttery cookies with real cashew nut flakes. Loved across all age groups.',
    price: 40,
    wholesalePrice: 32,
    costPrice: 26.5,
    moq: 12,
    stock: 140,
    lowStockThreshold: 20,
    deliveryEstimate: 'Tomorrow by 2 PM',
    verified: true,
    createdAt: '2026-03-05T12:00:00Z',
    unit: 'Bundle (12 Packs)',
  },
  {
    id: 'prod_maggi_noodles',
    wholesalerId: 'who_ganesh_03',
    wholesalerName: 'Sri Ganesh Traders',
    name: 'Maggi 2-Minute Masala Instant Noodles (Box of 24 × 70g)',
    brand: 'Maggi',
    categoryId: 'cat_snacks',
    categoryName: 'Snacks & Noodles',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    description: "India's favorite noodle with the authentic tastemaker spice mix.",
    price: 15,
    wholesalePrice: 12,
    costPrice: 9.8,
    moq: 24,
    stock: 420,
    lowStockThreshold: 48,
    deliveryEstimate: 'Tomorrow by 11 AM',
    verified: true,
    createdAt: '2026-03-06T10:00:00Z',
    unit: 'Box (24 Units)',
  },
  {
    id: 'prod_surf_excel',
    wholesalerId: 'who_ganesh_03',
    wholesalerName: 'Sri Ganesh Traders',
    name: 'Surf Excel Easy Wash Detergent Powder 1kg',
    brand: 'Surf Excel',
    categoryId: 'cat_home',
    categoryName: 'Home Care & Detergents',
    image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80',
    description: 'Superior stain removal formulation for bucket wash and washing machines.',
    price: 140,
    wholesalePrice: 118,
    costPrice: 98,
    moq: 10,
    stock: 160,
    lowStockThreshold: 20,
    deliveryEstimate: 'Tomorrow by 2 PM',
    verified: true,
    createdAt: '2026-03-06T14:00:00Z',
    unit: '1kg Pouch',
  },
  {
    id: 'prod_tata_tea',
    wholesalerId: 'who_lakshmi_01',
    wholesalerName: 'Shree Lakshmi Wholesale',
    name: 'Tata Tea Premium Desh Ki Chai 500g',
    brand: 'Tata Tea',
    categoryId: 'cat_beverages',
    categoryName: 'Beverages & Tea',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    description: 'Expert blend of large tea leaves for aroma and small tea grains for strength.',
    price: 275,
    wholesalePrice: 235,
    costPrice: 196,
    moq: 6,
    stock: 85,
    lowStockThreshold: 15,
    deliveryEstimate: 'Tomorrow by 11 AM',
    verified: true,
    createdAt: '2026-03-07T10:00:00Z',
    unit: '500g Pack',
  },
  {
    id: 'prod_toor_dal',
    wholesalerId: 'who_lakshmi_01',
    wholesalerName: 'Shree Lakshmi Wholesale',
    name: 'Premium Unpolished Desi Toor Dal 1kg',
    brand: 'Laxmi Dal Mills',
    categoryId: 'cat_groceries',
    categoryName: 'Groceries & Staples',
    image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80',
    description: 'Natural unpolished toor dal with high protein content and authentic taste.',
    price: 175,
    wholesalePrice: 148,
    costPrice: 122,
    moq: 10,
    stock: 210,
    lowStockThreshold: 30,
    deliveryEstimate: 'Tomorrow by 2 PM',
    verified: true,
    createdAt: '2026-03-07T12:00:00Z',
    unit: '1kg Pouch',
  },
  {
    id: 'prod_mysore_sandal',
    wholesalerId: 'who_ganesh_03',
    wholesalerName: 'Sri Ganesh Traders',
    name: 'Mysore Sandal Soap Pure Sandalwood Oil (Pack of 3 × 150g)',
    brand: 'Mysore Sandal',
    categoryId: 'cat_personal',
    categoryName: 'Personal Care & Soaps',
    image: 'https://images.unsplash.com/photo-1607006311003-8898950669cf?auto=format&fit=crop&w=600&q=80',
    description: 'Traditional heritage bath soap with genuine natural sandalwood oil.',
    price: 240,
    wholesalePrice: 204,
    costPrice: 172,
    moq: 6,
    stock: 120,
    lowStockThreshold: 15,
    deliveryEstimate: '1-2 Business Days',
    verified: true,
    createdAt: '2026-03-08T10:00:00Z',
    unit: '3-Pack Box',
  },
  {
    id: 'prod_premium_biscuit_box',
    wholesalerId: 'who_bharat_02',
    wholesalerName: 'Bharat Distributors',
    name: 'Royal Heritage Danish Butter Cookies 400g Tin',
    brand: 'Royal Heritage',
    categoryId: 'cat_biscuits',
    categoryName: 'Biscuits & Bakery',
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=600&q=80',
    description: 'Imported style luxury assorted butter cookies in decorative tin. Slow moving specialty.',
    price: 360,
    wholesalePrice: 300,
    costPrice: 255,
    moq: 4,
    stock: 45,
    lowStockThreshold: 10,
    deliveryEstimate: '2-3 Business Days',
    verified: true,
    createdAt: '2026-02-15T10:00:00Z',
    unit: '400g Tin',
  },
];

// Initial Retailer Inventory for Ramesh Stores
export const INITIAL_RETAILER_INVENTORY: RetailerInventoryItem[] = [
  {
    id: 'inv_salt',
    retailerId: 'ret_ramesh_01',
    productId: 'prod_tata_salt',
    productName: 'Tata Salt Vaccum Evaporated 1kg',
    brand: 'Tata',
    categoryName: 'Groceries & Staples',
    image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80',
    currentStock: 42,
    purchasePrice: 24,
    sellingPrice: 30,
    lowStockThreshold: 15,
    unit: '1kg Pouch',
    lastRestocked: '2026-03-15',
  },
  {
    id: 'inv_oil',
    retailerId: 'ret_ramesh_01',
    productId: 'prod_fortune_oil',
    productName: 'Fortune Sunlite Refined Sunflower Oil 1L',
    brand: 'Fortune',
    categoryName: 'Edible Oil & Ghee',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    currentStock: 8, // Low Stock! (Matches master prompt: "Cooking Oil running low. Current stock: 8 units")
    purchasePrice: 132,
    sellingPrice: 155,
    lowStockThreshold: 12,
    unit: '1L Pouch',
    lastRestocked: '2026-03-10',
  },
  {
    id: 'inv_atta',
    retailerId: 'ret_ramesh_01',
    productId: 'prod_aashirvaad_atta',
    productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg',
    brand: 'Aashirvaad',
    categoryName: 'Groceries & Staples',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    currentStock: 16,
    purchasePrice: 220,
    sellingPrice: 260,
    lowStockThreshold: 8,
    unit: '5kg Bag',
    lastRestocked: '2026-03-14',
  },
  {
    id: 'inv_rice',
    retailerId: 'ret_ramesh_01',
    productId: 'prod_india_gate_rice',
    productName: 'India Gate Feast Rozzana Basmati Rice 5kg',
    brand: 'India Gate',
    categoryName: 'Rice & Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    currentStock: 12,
    purchasePrice: 415,
    sellingPrice: 490,
    lowStockThreshold: 6,
    unit: '5kg Bag',
    lastRestocked: '2026-03-12',
  },
  {
    id: 'inv_parle_g',
    retailerId: 'ret_ramesh_01',
    productId: 'prod_parle_g',
    productName: 'Parle-G Original Gluco Biscuits (Case of 24 × 250g)',
    brand: 'Parle',
    categoryName: 'Biscuits & Bakery',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
    currentStock: 36,
    purchasePrice: 28,
    sellingPrice: 35,
    lowStockThreshold: 20,
    unit: 'Pack',
    lastRestocked: '2026-03-16',
  },
  {
    id: 'inv_maggi',
    retailerId: 'ret_ramesh_01',
    productId: 'prod_maggi_noodles',
    productName: 'Maggi 2-Minute Masala Instant Noodles (Box of 24 × 70g)',
    brand: 'Maggi',
    categoryName: 'Snacks & Noodles',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    currentStock: 48,
    purchasePrice: 12,
    sellingPrice: 15,
    lowStockThreshold: 24,
    unit: 'Pack',
    lastRestocked: '2026-03-17',
  },
  {
    id: 'inv_premium_biscuits',
    retailerId: 'ret_ramesh_01',
    productId: 'prod_premium_biscuit_box',
    productName: 'Royal Heritage Danish Butter Cookies 400g Tin',
    brand: 'Royal Heritage',
    categoryName: 'Biscuits & Bakery',
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=600&q=80',
    currentStock: 42, // Slow moving: 42 units in stock, only 6 sold in 30 days! (Matches prompt section 37)
    purchasePrice: 300,
    sellingPrice: 360,
    lowStockThreshold: 5,
    unit: '400g Tin',
    lastRestocked: '2026-02-18',
  },
  {
    id: 'inv_tea',
    retailerId: 'ret_ramesh_01',
    productId: 'prod_tata_tea',
    productName: 'Tata Tea Premium Desh Ki Chai 500g',
    brand: 'Tata Tea',
    categoryName: 'Beverages & Tea',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    currentStock: 14,
    purchasePrice: 235,
    sellingPrice: 275,
    lowStockThreshold: 6,
    unit: '500g Pack',
    lastRestocked: '2026-03-14',
  },
];

// Initial Realistic Sales Records for Ramesh Stores (Calculated real data)
export const INITIAL_SALES: SalesRecord[] = [
  // Today's Sales
  {
    id: 'sale_t_1',
    userId: 'ret_ramesh_01',
    productId: 'prod_tata_salt',
    productName: 'Tata Salt Vaccum Evaporated 1kg',
    categoryName: 'Groceries & Staples',
    quantity: 12,
    purchasePrice: 24,
    sellingPrice: 30,
    revenue: 360,
    cost: 288,
    profit: 72,
    margin: 20.0,
    date: '2026-09-19',
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 'sale_t_2',
    userId: 'ret_ramesh_01',
    productId: 'prod_fortune_oil',
    productName: 'Fortune Sunlite Refined Sunflower Oil 1L',
    categoryName: 'Edible Oil & Ghee',
    quantity: 6,
    purchasePrice: 132,
    sellingPrice: 155,
    revenue: 930,
    cost: 792,
    profit: 138,
    margin: 14.84,
    date: '2026-09-19',
    timestamp: Date.now() - 3600000 * 3,
  },
  {
    id: 'sale_t_3',
    userId: 'ret_ramesh_01',
    productId: 'prod_aashirvaad_atta',
    productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg',
    categoryName: 'Groceries & Staples',
    quantity: 8,
    purchasePrice: 220,
    sellingPrice: 260,
    revenue: 2080,
    cost: 1760,
    profit: 320,
    margin: 15.38,
    date: '2026-09-19',
    timestamp: Date.now() - 3600000 * 4,
  },
  {
    id: 'sale_t_4',
    userId: 'ret_ramesh_01',
    productId: 'prod_india_gate_rice',
    productName: 'India Gate Feast Rozzana Basmati Rice 5kg',
    categoryName: 'Rice & Grains',
    quantity: 6,
    purchasePrice: 415,
    sellingPrice: 490,
    revenue: 2940,
    cost: 2490,
    profit: 450,
    margin: 15.31,
    date: '2026-09-19',
    timestamp: Date.now() - 3600000 * 5,
  },
  {
    id: 'sale_t_5',
    userId: 'ret_ramesh_01',
    productId: 'prod_maggi_noodles',
    productName: 'Maggi 2-Minute Masala Instant Noodles (Box of 24 × 70g)',
    categoryName: 'Snacks & Noodles',
    quantity: 24,
    purchasePrice: 12,
    sellingPrice: 15,
    revenue: 360,
    cost: 288,
    profit: 72,
    margin: 20.0,
    date: '2026-09-19',
    timestamp: Date.now() - 3600000 * 6,
  },
  {
    id: 'sale_t_6',
    userId: 'ret_ramesh_01',
    productId: 'prod_tata_tea',
    productName: 'Tata Tea Premium Desh Ki Chai 500g',
    categoryName: 'Beverages & Tea',
    quantity: 4,
    purchasePrice: 235,
    sellingPrice: 275,
    revenue: 1100,
    cost: 940,
    profit: 160,
    margin: 14.55,
    date: '2026-09-19',
    timestamp: Date.now() - 3600000 * 7,
  },

  // Historical Records (Past 30 days) providing measurable sales velocity
  // Tata Salt: Fast moving (120 units in past 30 days -> 4 units/day)
  ...Array.from({ length: 28 }, (_, i) => ({
    id: `sale_hist_salt_${i}`,
    userId: 'ret_ramesh_01',
    productId: 'prod_tata_salt',
    productName: 'Tata Salt Vaccum Evaporated 1kg',
    categoryName: 'Groceries & Staples',
    quantity: 4,
    purchasePrice: 24,
    sellingPrice: 30,
    revenue: 120,
    cost: 96,
    profit: 24,
    margin: 20.0,
    date: new Date(Date.now() - (i + 1) * 86400000).toISOString().split('T')[0],
    timestamp: Date.now() - (i + 1) * 86400000,
  })),

  // Fortune Oil: 65 units in past 30 days -> ~2.2 units/day (10-12/week)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `sale_hist_oil_${i}`,
    userId: 'ret_ramesh_01',
    productId: 'prod_fortune_oil',
    productName: 'Fortune Sunlite Refined Sunflower Oil 1L',
    categoryName: 'Edible Oil & Ghee',
    quantity: 3,
    purchasePrice: 132,
    sellingPrice: 155,
    revenue: 465,
    cost: 396,
    profit: 69,
    margin: 14.84,
    date: new Date(Date.now() - (i * 1.5 + 1) * 86400000).toISOString().split('T')[0],
    timestamp: Date.now() - (i * 1.5 + 1) * 86400000,
  })),

  // Aashirvaad Atta: 45 units in 30 days -> 1.5 units/day
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `sale_hist_atta_${i}`,
    userId: 'ret_ramesh_01',
    productId: 'prod_aashirvaad_atta',
    productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg',
    categoryName: 'Groceries & Staples',
    quantity: 3,
    purchasePrice: 220,
    sellingPrice: 260,
    revenue: 780,
    cost: 660,
    profit: 120,
    margin: 15.38,
    date: new Date(Date.now() - (i * 2 + 1) * 86400000).toISOString().split('T')[0],
    timestamp: Date.now() - (i * 2 + 1) * 86400000,
  })),

  // Maggi Noodles: 180 packs in 30 days -> 6 units/day
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `sale_hist_maggi_${i}`,
    userId: 'ret_ramesh_01',
    productId: 'prod_maggi_noodles',
    productName: 'Maggi 2-Minute Masala Instant Noodles (Box of 24 × 70g)',
    categoryName: 'Snacks & Noodles',
    quantity: 7,
    purchasePrice: 12,
    sellingPrice: 15,
    revenue: 105,
    cost: 84,
    profit: 21,
    margin: 20.0,
    date: new Date(Date.now() - (i + 1) * 86400000).toISOString().split('T')[0],
    timestamp: Date.now() - (i + 1) * 86400000,
  })),

  // Premium Biscuits: Only 6 units in 30 days! (Matches prompt section 37: "Sales: 6 units in last 30 days, stock: 42 units")
  {
    id: 'sale_hist_slow_1',
    userId: 'ret_ramesh_01',
    productId: 'prod_premium_biscuit_box',
    productName: 'Royal Heritage Danish Butter Cookies 400g Tin',
    categoryName: 'Biscuits & Bakery',
    quantity: 2,
    purchasePrice: 300,
    sellingPrice: 360,
    revenue: 720,
    cost: 600,
    profit: 120,
    margin: 16.67,
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    timestamp: Date.now() - 5 * 86400000,
  },
  {
    id: 'sale_hist_slow_2',
    userId: 'ret_ramesh_01',
    productId: 'prod_premium_biscuit_box',
    productName: 'Royal Heritage Danish Butter Cookies 400g Tin',
    categoryName: 'Biscuits & Bakery',
    quantity: 2,
    purchasePrice: 300,
    sellingPrice: 360,
    revenue: 720,
    cost: 600,
    profit: 120,
    margin: 16.67,
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    timestamp: Date.now() - 14 * 86400000,
  },
  {
    id: 'sale_hist_slow_3',
    userId: 'ret_ramesh_01',
    productId: 'prod_premium_biscuit_box',
    productName: 'Royal Heritage Danish Butter Cookies 400g Tin',
    categoryName: 'Biscuits & Bakery',
    quantity: 2,
    purchasePrice: 300,
    sellingPrice: 360,
    revenue: 720,
    cost: 600,
    profit: 120,
    margin: 16.67,
    date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
    timestamp: Date.now() - 25 * 86400000,
  },
];

const makeWholesaleOrder = (
  id: string,
  daysAgo: number,
  hoursAgo: number,
  retailerBusinessName: string,
  retailerName: string,
  retailerId: string,
  items: {
    productId: string;
    productName: string;
    brand: string;
    image: string;
    quantity: number;
    wholesalePrice: number;
    unit: string;
  }[],
  status: OrderStatus = 'delivered',
  paymentMethod: PaymentMethod = 'upi'
): Order => {
  const timestamp = Date.now() - (daysAgo * 86400000 + hoursAgo * 3600000);
  const dateObj = new Date(timestamp);
  const dateIso = dateObj.toISOString();
  const orderItems: OrderItem[] = items.map((it) => ({
    ...it,
    subtotal: it.quantity * it.wholesalePrice,
  }));
  const subtotal = orderItems.reduce((acc, it) => acc + it.subtotal, 0);
  const deliveryFee = subtotal > 2500 ? 0 : 60;
  const total = subtotal + deliveryFee;

  const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return {
    id,
    retailerId,
    retailerName,
    retailerBusinessName,
    wholesalerId: 'who_lakshmi_01',
    wholesalerName: 'Shree Lakshmi Wholesale',
    items: orderItems,
    subtotal,
    deliveryFee,
    tax: 0,
    total,
    status,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'cod' : 'paid',
    deliveryAddress: `${retailerBusinessName}, Bengaluru, Karnataka 560003`,
    createdAt: dateIso,
    updatedAt: dateIso,
    timeline: [
      { status: 'pending', time: `${dateStr}, 09:15 AM`, note: `Order placed by ${retailerBusinessName}` },
      { status: 'confirmed', time: `${dateStr}, 09:30 AM`, note: 'Confirmed by Shree Lakshmi Wholesale' },
      { status: 'preparing', time: `${dateStr}, 10:45 AM`, note: 'Packed at APMC Yard Warehouse' },
      { status: 'dispatched', time: `${dateStr}, 01:00 PM`, note: 'Out for store delivery' },
      { status: status, time: `${dateStr}, 03:30 PM`, note: 'Shipment delivered & verified' },
    ],
  };
};

export const INITIAL_ORDERS: Order[] = [
  // --- PAST 7 DAYS (Active daily commerce) ---
  makeWholesaleOrder('VYRO-ORD-1150', 0, 3, 'Ramesh Stores', 'Ramesh Kumar', 'ret_ramesh_01', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 24, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 15, wholesalePrice: 220, unit: '5kg Bag' },
    { productId: 'prod_tata_salt', productName: 'Tata Salt Vaccum Evaporated 1kg', brand: 'Tata', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80', quantity: 40, wholesalePrice: 24, unit: '1kg Pouch' },
  ], 'preparing', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1148', 0, 7, 'Krishna Provision Store', 'Krishna Murthy', 'ret_krishna_02', [
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 25, wholesalePrice: 148, unit: '1kg Pouch' },
    { productId: 'prod_tata_tea', productName: 'Tata Tea Premium Desh Ki Chai 500g', brand: 'Tata Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', quantity: 12, wholesalePrice: 235, unit: '500g Pack' },
  ], 'dispatched', 'netbanking'),

  makeWholesaleOrder('VYRO-ORD-1145', 1, 4, 'Balaji Supermarket', 'N. Balaji', 'ret_balaji_03', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 36, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_tata_salt', productName: 'Tata Salt Vaccum Evaporated 1kg', brand: 'Tata', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80', quantity: 50, wholesalePrice: 24, unit: '1kg Pouch' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1142', 1, 9, 'Om Sai Kirana', 'Suresh Gowda', 'ret_sai_04', [
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 20, wholesalePrice: 220, unit: '5kg Bag' },
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 30, wholesalePrice: 148, unit: '1kg Pouch' },
  ], 'delivered', 'cod'),

  makeWholesaleOrder('VYRO-ORD-1139', 2, 5, 'Venkateshwara Traders', 'M. Venkatesh', 'ret_venkat_05', [
    { productId: 'prod_tata_tea', productName: 'Tata Tea Premium Desh Ki Chai 500g', brand: 'Tata Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', quantity: 18, wholesalePrice: 235, unit: '500g Pack' },
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 24, wholesalePrice: 132, unit: '1L Pouch' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1136', 2, 8, 'Sri Manjunatha Daily Needs', 'Ravi Shankar', 'ret_manjunatha_06', [
    { productId: 'prod_tata_salt', productName: 'Tata Salt Vaccum Evaporated 1kg', brand: 'Tata', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80', quantity: 60, wholesalePrice: 24, unit: '1kg Pouch' },
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 12, wholesalePrice: 220, unit: '5kg Bag' },
  ], 'delivered', 'upi'),

  makeWholesaleOrder('VYRO-ORD-1132', 3, 6, 'Ramesh Stores', 'Ramesh Kumar', 'ret_ramesh_01', [
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 40, wholesalePrice: 148, unit: '1kg Pouch' },
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 30, wholesalePrice: 132, unit: '1L Pouch' },
  ], 'delivered', 'upi'),

  makeWholesaleOrder('VYRO-ORD-1128', 4, 3, 'Krishna Provision Store', 'Krishna Murthy', 'ret_krishna_02', [
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 25, wholesalePrice: 220, unit: '5kg Bag' },
    { productId: 'prod_tata_tea', productName: 'Tata Tea Premium Desh Ki Chai 500g', brand: 'Tata Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', quantity: 15, wholesalePrice: 235, unit: '500g Pack' },
  ], 'delivered', 'upi'),

  makeWholesaleOrder('VYRO-ORD-1124', 5, 5, 'Balaji Supermarket', 'N. Balaji', 'ret_balaji_03', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 48, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 20, wholesalePrice: 148, unit: '1kg Pouch' },
  ], 'delivered', 'netbanking'),

  makeWholesaleOrder('VYRO-ORD-1120', 6, 4, 'Om Sai Kirana', 'Suresh Gowda', 'ret_sai_04', [
    { productId: 'prod_tata_salt', productName: 'Tata Salt Vaccum Evaporated 1kg', brand: 'Tata', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80', quantity: 80, wholesalePrice: 24, unit: '1kg Pouch' },
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 18, wholesalePrice: 220, unit: '5kg Bag' },
  ], 'delivered', 'upi'),

  // --- PAST 30 DAYS (Weeks 2, 3, 4) ---
  makeWholesaleOrder('VYRO-ORD-1115', 8, 4, 'Ramesh Stores', 'Ramesh Kumar', 'ret_ramesh_01', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 30, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 25, wholesalePrice: 148, unit: '1kg Pouch' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1110', 10, 5, 'Venkateshwara Traders', 'M. Venkatesh', 'ret_venkat_05', [
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 30, wholesalePrice: 220, unit: '5kg Bag' },
    { productId: 'prod_tata_tea', productName: 'Tata Tea Premium Desh Ki Chai 500g', brand: 'Tata Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', quantity: 20, wholesalePrice: 235, unit: '500g Pack' },
  ], 'delivered', 'netbanking'),
  makeWholesaleOrder('VYRO-ORD-1105', 13, 6, 'Sri Manjunatha Daily Needs', 'Ravi Shankar', 'ret_manjunatha_06', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 36, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_tata_salt', productName: 'Tata Salt Vaccum Evaporated 1kg', brand: 'Tata', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80', quantity: 60, wholesalePrice: 24, unit: '1kg Pouch' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1100', 16, 3, 'Krishna Provision Store', 'Krishna Murthy', 'ret_krishna_02', [
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 45, wholesalePrice: 148, unit: '1kg Pouch' },
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 20, wholesalePrice: 220, unit: '5kg Bag' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1096', 20, 5, 'Balaji Supermarket', 'N. Balaji', 'ret_balaji_03', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 40, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_tata_tea', productName: 'Tata Tea Premium Desh Ki Chai 500g', brand: 'Tata Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', quantity: 24, wholesalePrice: 235, unit: '500g Pack' },
  ], 'delivered', 'netbanking'),
  makeWholesaleOrder('VYRO-ORD-1092', 24, 7, 'Om Sai Kirana', 'Suresh Gowda', 'ret_sai_04', [
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 35, wholesalePrice: 220, unit: '5kg Bag' },
    { productId: 'prod_tata_salt', productName: 'Tata Salt Vaccum Evaporated 1kg', brand: 'Tata', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80', quantity: 70, wholesalePrice: 24, unit: '1kg Pouch' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1088', 28, 4, 'Ramesh Stores', 'Ramesh Kumar', 'ret_ramesh_01', [
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 35, wholesalePrice: 148, unit: '1kg Pouch' },
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 28, wholesalePrice: 132, unit: '1L Pouch' },
  ], 'delivered', 'upi'),

  // --- PAST 90 DAYS (Months 2 & 3) ---
  makeWholesaleOrder('VYRO-ORD-1080', 35, 4, 'Venkateshwara Traders', 'M. Venkatesh', 'ret_venkat_05', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 50, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_tata_tea', productName: 'Tata Tea Premium Desh Ki Chai 500g', brand: 'Tata Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', quantity: 30, wholesalePrice: 235, unit: '500g Pack' },
  ], 'delivered', 'netbanking'),
  makeWholesaleOrder('VYRO-ORD-1075', 42, 6, 'Balaji Supermarket', 'N. Balaji', 'ret_balaji_03', [
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 40, wholesalePrice: 220, unit: '5kg Bag' },
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 30, wholesalePrice: 148, unit: '1kg Pouch' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1070', 50, 5, 'Sri Manjunatha Daily Needs', 'Ravi Shankar', 'ret_manjunatha_06', [
    { productId: 'prod_tata_salt', productName: 'Tata Salt Vaccum Evaporated 1kg', brand: 'Tata', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80', quantity: 90, wholesalePrice: 24, unit: '1kg Pouch' },
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 42, wholesalePrice: 132, unit: '1L Pouch' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1065', 58, 3, 'Krishna Provision Store', 'Krishna Murthy', 'ret_krishna_02', [
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 50, wholesalePrice: 148, unit: '1kg Pouch' },
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 25, wholesalePrice: 220, unit: '5kg Bag' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1060', 68, 5, 'Om Sai Kirana', 'Suresh Gowda', 'ret_sai_04', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 55, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_tata_tea', productName: 'Tata Tea Premium Desh Ki Chai 500g', brand: 'Tata Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', quantity: 25, wholesalePrice: 235, unit: '500g Pack' },
  ], 'delivered', 'netbanking'),
  makeWholesaleOrder('VYRO-ORD-1055', 78, 6, 'Ramesh Stores', 'Ramesh Kumar', 'ret_ramesh_01', [
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 36, wholesalePrice: 220, unit: '5kg Bag' },
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 40, wholesalePrice: 148, unit: '1kg Pouch' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1050', 88, 4, 'Balaji Supermarket', 'N. Balaji', 'ret_balaji_03', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 60, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_tata_salt', productName: 'Tata Salt Vaccum Evaporated 1kg', brand: 'Tata', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80', quantity: 100, wholesalePrice: 24, unit: '1kg Pouch' },
  ], 'delivered', 'upi'),

  // --- PAST 1 YEAR (Months 4 to 12) ---
  makeWholesaleOrder('VYRO-ORD-1040', 110, 4, 'Venkateshwara Traders', 'M. Venkatesh', 'ret_venkat_05', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 65, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 45, wholesalePrice: 148, unit: '1kg Pouch' },
  ], 'delivered', 'netbanking'),
  makeWholesaleOrder('VYRO-ORD-1030', 140, 5, 'Krishna Provision Store', 'Krishna Murthy', 'ret_krishna_02', [
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 45, wholesalePrice: 220, unit: '5kg Bag' },
    { productId: 'prod_tata_tea', productName: 'Tata Tea Premium Desh Ki Chai 500g', brand: 'Tata Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', quantity: 30, wholesalePrice: 235, unit: '500g Pack' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1020', 180, 4, 'Balaji Supermarket', 'N. Balaji', 'ret_balaji_03', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 70, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_tata_salt', productName: 'Tata Salt Vaccum Evaporated 1kg', brand: 'Tata', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80', quantity: 120, wholesalePrice: 24, unit: '1kg Pouch' },
  ], 'delivered', 'netbanking'),
  makeWholesaleOrder('VYRO-ORD-1010', 220, 6, 'Sri Manjunatha Daily Needs', 'Ravi Shankar', 'ret_manjunatha_06', [
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 60, wholesalePrice: 148, unit: '1kg Pouch' },
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 50, wholesalePrice: 220, unit: '5kg Bag' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1005', 270, 4, 'Ramesh Stores', 'Ramesh Kumar', 'ret_ramesh_01', [
    { productId: 'prod_fortune_oil', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', brand: 'Fortune', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', quantity: 80, wholesalePrice: 132, unit: '1L Pouch' },
    { productId: 'prod_tata_tea', productName: 'Tata Tea Premium Desh Ki Chai 500g', brand: 'Tata Tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', quantity: 35, wholesalePrice: 235, unit: '500g Pack' },
  ], 'delivered', 'upi'),
  makeWholesaleOrder('VYRO-ORD-1001', 320, 5, 'Om Sai Kirana', 'Suresh Gowda', 'ret_sai_04', [
    { productId: 'prod_tata_salt', productName: 'Tata Salt Vaccum Evaporated 1kg', brand: 'Tata', image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80', quantity: 150, wholesalePrice: 24, unit: '1kg Pouch' },
    { productId: 'prod_aashirvaad_atta', productName: 'Aashirvaad Shudh Chakki Whole Wheat Atta 5kg', brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', quantity: 40, wholesalePrice: 220, unit: '5kg Bag' },
    { productId: 'prod_toor_dal', productName: 'Premium Unpolished Desi Toor Dal 1kg', brand: 'Laxmi Dal Mills', image: 'https://images.unsplash.com/photo-1585994192701-f25bfa17c093?auto=format&fit=crop&w=600&q=80', quantity: 45, wholesalePrice: 148, unit: '1kg Pouch' },
  ], 'delivered', 'netbanking'),
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'ret_ramesh_01',
    title: 'Order Dispatched',
    message: 'Your order #VYRO-ORD-1095 from Shree Lakshmi Wholesale is out for delivery.',
    time: '2 hours ago',
    read: false,
    type: 'order',
    linkRoute: '/retailer/orders',
  },
  {
    id: 'notif_2',
    userId: 'ret_ramesh_01',
    title: 'Low Stock Alert',
    message: 'Fortune Sunflower Oil 1L has only 8 units left. Expected stockout in 3-4 days.',
    time: '4 hours ago',
    read: false,
    type: 'inventory',
    linkRoute: '/retailer/ai-insights',
  },
  {
    id: 'notif_3',
    userId: 'who_lakshmi_01',
    title: 'New Order Received',
    message: 'Ramesh Stores placed an order for ₹3,124 (Fortune Oil & Toor Dal).',
    time: 'Yesterday',
    read: true,
    type: 'order',
    linkRoute: '/wholesaler/orders',
  },
];

// Reactive Store State holder with LocalStorage persistence
const STORAGE_KEY = 'vyro_b2b_database_v2';

export interface VyroStoreState {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  currentRole: UserRole;
  retailerProfile: UserProfile;
  wholesalerProfile: UserProfile;
  categories: Category[];
  products: Product[];
  retailerInventory: RetailerInventoryItem[];
  orders: Order[];
  salesRecords: SalesRecord[];
  notifications: AppNotification[];
  cart: { [productId: string]: number };
}

class VyroStore {
  private state: VyroStoreState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): VyroStoreState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure auth fields exist
        if (typeof parsed.isAuthenticated !== 'boolean') {
          parsed.isAuthenticated = false;
          parsed.currentUser = null;
        }
        // Ensure products have costPrice
        if (Array.isArray(parsed.products)) {
          parsed.products = parsed.products.map((p: Product) => {
            const initP = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
            return {
              ...p,
              costPrice: p.costPrice ?? initP?.costPrice ?? Math.round(p.wholesalePrice * 0.82),
            };
          });
        }
        // Ensure orders contain rich historical data for graphs
        if (!Array.isArray(parsed.orders) || parsed.orders.length < 15) {
          parsed.orders = INITIAL_ORDERS;
        }
        return parsed;
      }
    } catch {
      // Fallback
    }

    return {
      isAuthenticated: false,
      currentUser: null,
      currentRole: 'retailer',
      retailerProfile: DEFAULT_RETAILER,
      wholesalerProfile: DEFAULT_WHOLESALER,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      retailerInventory: INITIAL_RETAILER_INVENTORY,
      orders: INITIAL_ORDERS,
      salesRecords: INITIAL_SALES,
      notifications: INITIAL_NOTIFICATIONS,
      cart: {},
    };
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage full or restricted
    }
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): VyroStoreState {
    return this.state;
  }

  public resetToDefault() {
    this.state = {
      isAuthenticated: false,
      currentUser: null,
      currentRole: 'retailer',
      retailerProfile: DEFAULT_RETAILER,
      wholesalerProfile: DEFAULT_WHOLESALER,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      retailerInventory: INITIAL_RETAILER_INVENTORY,
      orders: INITIAL_ORDERS,
      salesRecords: INITIAL_SALES,
      notifications: INITIAL_NOTIFICATIONS,
      cart: {},
    };
    this.notify();
  }

  // Authentication Management
  public login(emailOrId: string, role: UserRole) {
    this.state.isAuthenticated = true;
    this.state.currentRole = role;
    this.state.currentUser = {
      emailOrId,
      role,
      name: role === 'retailer' ? this.state.retailerProfile.name : this.state.wholesalerProfile.name,
      businessName: role === 'retailer' ? this.state.retailerProfile.businessName : this.state.wholesalerProfile.businessName,
      loginTime: new Date().toISOString(),
    };
    this.notify();
  }

  public logout() {
    this.state.isAuthenticated = false;
    this.state.currentUser = null;
    this.notify();
  }

  // Role Management
  public setRole(role: UserRole) {
    this.state.currentRole = role;
    if (this.state.currentUser) {
      this.state.currentUser.role = role;
      this.state.currentUser.name = role === 'retailer' ? this.state.retailerProfile.name : this.state.wholesalerProfile.name;
      this.state.currentUser.businessName = role === 'retailer' ? this.state.retailerProfile.businessName : this.state.wholesalerProfile.businessName;
    }
    this.notify();
  }

  // Cart Management
  public addToCart(productId: string, quantity: number) {
    const product = this.state.products.find((p) => p.id === productId);
    if (!product) return;

    const currentQty = this.state.cart[productId] || 0;
    const requestedTotal = currentQty + quantity;
    const safeQty = Math.min(requestedTotal, product.stock);

    if (safeQty <= 0) {
      delete this.state.cart[productId];
    } else {
      this.state.cart[productId] = safeQty;
    }
    this.notify();
  }

  public updateCartQuantity(productId: string, quantity: number) {
    const product = this.state.products.find((p) => p.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      delete this.state.cart[productId];
    } else {
      const safeQty = Math.min(quantity, product.stock);
      this.state.cart[productId] = safeQty;
    }
    this.notify();
  }

  public removeFromCart(productId: string) {
    delete this.state.cart[productId];
    this.notify();
  }

  public clearCart() {
    this.state.cart = {};
    this.notify();
  }

  // Product Management (Wholesaler adds or updates)
  public addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.state.products = [newProduct, ...this.state.products];
    this.notify();
    return newProduct;
  }

  public updateProductStock(productId: string, newStock: number) {
    const product = this.state.products.find((p) => p.id === productId);
    if (product) {
      product.stock = Math.max(0, newStock);
      this.notify();
    }
  }

  public updateProductWholesalePriceAndStock(productId: string, wholesalePrice: number, newStock: number) {
    const product = this.state.products.find((p) => p.id === productId);
    if (product) {
      product.wholesalePrice = Math.max(0, wholesalePrice);
      product.stock = Math.max(0, newStock);
      this.notify();
    }
  }

  public deleteProduct(productId: string) {
    this.state.products = this.state.products.filter((p) => p.id !== productId);
    delete this.state.cart[productId];
    this.notify();
  }

  // Order Placement (Retailer creates order)
  public placeOrder(
    items: { product: Product; quantity: number }[],
    paymentMethod: PaymentMethod,
    deliveryAddress: string
  ): Order {
    if (items.length === 0) throw new Error('Cart is empty');

    const firstWholesalerId = items[0].product.wholesalerId;
    const wholesaler = this.state.wholesalerProfile.id === firstWholesalerId
      ? this.state.wholesalerProfile
      : { id: firstWholesalerId, businessName: items[0].product.wholesalerName };

    const orderItems: OrderItem[] = items.map(({ product, quantity }) => ({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      image: product.image,
      quantity,
      wholesalePrice: product.wholesalePrice,
      subtotal: product.wholesalePrice * quantity,
      unit: product.unit,
    }));

    const subtotal = orderItems.reduce((acc, item) => acc + item.subtotal, 0);
    const deliveryFee = subtotal > 2000 ? 0 : 60; // Free delivery over ₹2000
    const tax = 0; // B2B composite display
    const total = subtotal + deliveryFee + tax;

    const orderId = `VYRO-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      retailerId: this.state.retailerProfile.id,
      retailerName: this.state.retailerProfile.name,
      retailerBusinessName: this.state.retailerProfile.businessName,
      wholesalerId: firstWholesalerId,
      wholesalerName: wholesaler.businessName,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      total,
      status: 'pending',
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'cod' : 'paid',
      deliveryAddress: deliveryAddress || this.state.retailerProfile.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'pending',
          time: 'Just now',
          note: `Order placed by ${this.state.retailerProfile.businessName}`,
        },
      ],
    };

    // Deduct stock from wholesaler products
    items.forEach(({ product, quantity }) => {
      const p = this.state.products.find((prod) => prod.id === product.id);
      if (p) {
        p.stock = Math.max(0, p.stock - quantity);
      }
    });

    // Create notifications for both
    this.state.orders = [newOrder, ...this.state.orders];
    this.state.notifications.unshift(
      {
        id: `notif_${Date.now()}_1`,
        userId: this.state.wholesalerProfile.id,
        title: 'New Wholesale Order Received',
        message: `${this.state.retailerProfile.businessName} placed order #${orderId} for ₹${total.toLocaleString('en-IN')}`,
        time: 'Just now',
        read: false,
        type: 'order',
        linkRoute: '/wholesaler/orders',
      },
      {
        id: `notif_${Date.now()}_2`,
        userId: this.state.retailerProfile.id,
        title: 'Order Confirmed',
        message: `Order #${orderId} for ₹${total.toLocaleString('en-IN')} is awaiting processing by wholesaler.`,
        time: 'Just now',
        read: false,
        type: 'order',
        linkRoute: '/retailer/orders',
      }
    );

    // Clear cart
    this.clearCart();
    return newOrder;
  }

  // Order Status Update by Wholesaler
  public updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const orderIndex = this.state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const order = this.state.orders[orderIndex];

    const noteMap: Record<OrderStatus, string> = {
      pending: 'Order pending review',
      confirmed: 'Accepted and verified by wholesaler',
      preparing: 'Items packed and being bundled for dispatch',
      dispatched: 'Dispatched via delivery transport',
      delivered: 'Delivered and verified at retailer store',
      cancelled: 'Order has been cancelled',
    };

    const updatedTimeline = [
      ...order.timeline,
      {
        status: newStatus,
        time: 'Just now',
        note: noteMap[newStatus],
      },
    ];

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline,
    };

    // Replace order immutably in state array
    const updatedOrders = [...this.state.orders];
    updatedOrders[orderIndex] = updatedOrder;
    this.state.orders = updatedOrders;

    // If order was marked DELIVERED, automatically fulfill and increment Retailer Inventory (only once per order)
    if (newStatus === 'delivered' && !(order as any).inventoryRestocked) {
      (updatedOrder as any).inventoryRestocked = true;
      updatedOrder.items.forEach((item) => {
        const existingInv = this.state.retailerInventory.find((inv) => inv.productId === item.productId);
        if (existingInv) {
          existingInv.currentStock += item.quantity;
          existingInv.purchasePrice = item.wholesalePrice;
          existingInv.lastRestocked = new Date().toISOString().split('T')[0];
        } else {
          const product = this.state.products.find((p) => p.id === item.productId);
          this.state.retailerInventory.push({
            id: `inv_${Date.now()}_${item.productId}`,
            retailerId: updatedOrder.retailerId,
            productId: item.productId,
            productName: item.productName,
            brand: item.brand,
            categoryName: product?.categoryName || 'General',
            image: item.image,
            currentStock: item.quantity,
            purchasePrice: item.wholesalePrice,
            sellingPrice: product ? product.price : Math.round(item.wholesalePrice * 1.25),
            lowStockThreshold: 10,
            unit: item.unit,
            lastRestocked: new Date().toISOString().split('T')[0],
          });
        }
      });

      this.state.notifications.unshift({
        id: `notif_${Date.now()}_del`,
        userId: updatedOrder.retailerId,
        title: 'Stock Added to Inventory',
        message: `Order #${updatedOrder.id} delivered! Stock automatically updated in your inventory.`,
        time: 'Just now',
        read: false,
        type: 'inventory',
        linkRoute: '/retailer/inventory',
      });
    }

    this.notify();
    return updatedOrder;
  }

  // Retailer counter customer sales (Simulate/Record counter sales)
  public recordRetailerSale(productId: string, quantity: number, customSellingPrice?: number) {
    const inv = this.state.retailerInventory.find((item) => item.productId === productId);
    if (!inv) throw new Error('Product not found in store inventory');

    if (inv.currentStock < quantity) {
      throw new Error(`Insufficient stock! You only have ${inv.currentStock} units.`);
    }

    const sellingPrice = customSellingPrice || inv.sellingPrice;
    const purchasePrice = inv.purchasePrice;
    const revenue = sellingPrice * quantity;
    const cost = purchasePrice * quantity;
    const profit = revenue - cost;
    const margin = (profit / revenue) * 100;

    // Deduct inventory
    inv.currentStock -= quantity;

    // Create sales record
    const record: SalesRecord = {
      id: `sale_${Date.now()}`,
      userId: this.state.retailerProfile.id,
      productId: inv.productId,
      productName: inv.productName,
      categoryName: inv.categoryName,
      quantity,
      sellingPrice,
      purchasePrice,
      revenue,
      cost,
      profit,
      margin,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    };

    this.state.salesRecords.unshift(record);

    // Check low stock trigger
    if (inv.currentStock <= inv.lowStockThreshold) {
      this.state.notifications.unshift({
        id: `notif_${Date.now()}_low`,
        userId: this.state.retailerProfile.id,
        title: 'Critical Low Stock',
        message: `${inv.productName} is at ${inv.currentStock} units (threshold: ${inv.lowStockThreshold}). Reorder soon!`,
        time: 'Just now',
        read: false,
        type: 'ai',
        linkRoute: '/retailer/ai-insights',
      });
    }

    this.notify();
    return record;
  }

  // Update Retailer Selling Price
  public updateRetailerSellingPrice(productId: string, newPrice: number) {
    const inv = this.state.retailerInventory.find((item) => item.productId === productId);
    if (inv) {
      inv.sellingPrice = newPrice;
      this.notify();
    }
  }

  // Helper Analytics & Calculations
  public getRetailerMetrics(timeframe: 'today' | 'week' | 'month' | 'year') {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const filterFn = (r: SalesRecord) => {
      const recordDate = new Date(r.timestamp);
      if (timeframe === 'today') {
        return r.date === todayStr;
      }
      if (timeframe === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        return recordDate >= weekAgo;
      }
      if (timeframe === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 86400000);
        return recordDate >= monthAgo;
      }
      // year
      const yearAgo = new Date(now.getTime() - 365 * 86400000);
      return recordDate >= yearAgo;
    };

    const records = this.state.salesRecords.filter(filterFn);

    const sales = records.reduce((sum, r) => sum + r.revenue, 0);
    const cost = records.reduce((sum, r) => sum + r.cost, 0);
    const grossProfit = sales - cost;
    const profitMargin = sales > 0 ? (grossProfit / sales) * 100 : 0;
    const unitsSold = records.reduce((sum, r) => sum + r.quantity, 0);

    return {
      sales,
      cost,
      grossProfit,
      profitMargin,
      unitsSold,
      recordsCount: records.length,
    };
  }

  // Calculate Product Movement & Sales Velocity (Past 30 days)
  public getProductPerformance(productId: string) {
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const productSales = this.state.salesRecords.filter(
      (r) => r.productId === productId && r.timestamp >= thirtyDaysAgo
    );

    const unitsSold = productSales.reduce((sum, r) => sum + r.quantity, 0);
    const revenue = productSales.reduce((sum, r) => sum + r.revenue, 0);
    const cost = productSales.reduce((sum, r) => sum + r.cost, 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Daily and weekly velocity
    const averageDailySales = unitsSold / 30;
    const averageWeeklySales = averageDailySales * 7;

    const inv = this.state.retailerInventory.find((i) => i.productId === productId);
    const currentStock = inv ? inv.currentStock : 0;

    // Stock Coverage = Current Stock / Average Daily Sales
    const stockCoverageDays =
      averageDailySales > 0 ? Math.round(currentStock / averageDailySales) : currentStock > 0 ? 999 : 0;

    // Movement Classification
    let movement: ProductMovement = 'NORMAL_MOVING';
    if (unitsSold === 0 && currentStock > 0) {
      movement = 'DEAD_STOCK';
    } else if (unitsSold >= 90 || averageDailySales >= 3) {
      movement = 'FAST_MOVING';
    } else if (unitsSold < 15 || averageDailySales < 0.5) {
      movement = 'SLOW_MOVING';
    } else {
      movement = 'NORMAL_MOVING';
    }

    return {
      productId,
      unitsSold,
      revenue,
      cost,
      profit,
      margin,
      averageDailySales,
      averageWeeklySales,
      currentStock,
      stockCoverageDays,
      movement,
    };
  }

  // Dynamic AI Insights Generator based on real store facts
  public getRetailerAIInsights(): AIInsight[] {
    const insights: AIInsight[] = [];
    const retailerId = this.state.retailerProfile.id;

    this.state.retailerInventory.forEach((inv) => {
      const perf = this.getProductPerformance(inv.productId);

      // Rule 1: POTENTIAL STOCKOUT / CRITICAL LOW STOCK
      if (inv.currentStock <= inv.lowStockThreshold || (perf.stockCoverageDays > 0 && perf.stockCoverageDays <= 4)) {
        insights.push({
          id: `ai_low_${inv.productId}`,
          userId: retailerId,
          type: 'POTENTIAL_STOCKOUT',
          title: `Potential Stockout Risk: ${inv.productName}`,
          productName: inv.productName,
          productId: inv.productId,
          categoryName: inv.categoryName,
          whatHappened: `${inv.productName} has dropped to ${inv.currentStock} ${inv.unit}. Average daily sales is ${perf.averageDailySales.toFixed(1)} units.`,
          whyItMatters: `At this sales pace, your store will run out of stock in approximately ${perf.stockCoverageDays} days, causing lost customer footfall.`,
          whatShouldIDo: `Place a replenishment order for approximately ${Math.max(12, Math.round(perf.averageWeeklySales * 2))} units immediately.`,
          recommendedUnits: Math.max(12, Math.round(perf.averageWeeklySales * 2)),
          stockCoverageDays: perf.stockCoverageDays,
          salesVelocityPerDay: perf.averageDailySales,
          priority: 'HIGH',
          createdAt: 'Active Now',
          actionText: 'Reorder Now',
          actionType: 'reorder',
        });
      }

      // Rule 2: BUY MORE (High velocity, coverage < 1 week)
      else if (perf.movement === 'FAST_MOVING' && perf.stockCoverageDays <= 8) {
        insights.push({
          id: `ai_buymore_${inv.productId}`,
          userId: retailerId,
          type: 'BUY_MORE',
          title: `Buy More: ${inv.productName}`,
          productName: inv.productName,
          productId: inv.productId,
          categoryName: inv.categoryName,
          whatHappened: `High sales velocity of ${perf.averageWeeklySales.toFixed(0)} units/week. Current stock is ${inv.currentStock} units.`,
          whyItMatters: `Stock coverage is less than 1.5 weeks (${perf.stockCoverageDays} days). Demand is consistent.`,
          whatShouldIDo: `Order approximately ${Math.round(perf.averageWeeklySales * 2.5)} units from wholesale to capture strong turnover.`,
          recommendedUnits: Math.round(perf.averageWeeklySales * 2.5),
          stockCoverageDays: perf.stockCoverageDays,
          salesVelocityPerDay: perf.averageDailySales,
          priority: 'HIGH',
          createdAt: 'Active Now',
          actionText: 'Reorder',
          actionType: 'reorder',
        });
      }

      // Rule 3: DO NOT BUY (Low sales, excess coverage > 45 days)
      else if (perf.movement === 'SLOW_MOVING' && perf.stockCoverageDays >= 45) {
        insights.push({
          id: `ai_donotbuy_${inv.productId}`,
          userId: retailerId,
          type: 'DO_NOT_BUY',
          title: `Do Not Buy: ${inv.productName}`,
          productName: inv.productName,
          productId: inv.productId,
          categoryName: inv.categoryName,
          whatHappened: `Only ${perf.unitsSold} units sold in the last 30 days while you hold ${inv.currentStock} units in inventory.`,
          whyItMatters: `Estimated stock coverage is over ${Math.round(perf.stockCoverageDays / 7)} weeks. Reordering will tie up your working capital.`,
          whatShouldIDo: `Do NOT reorder yet. Sell existing inventory before purchasing more, or offer a slight 5-10% bundle discount.`,
          stockCoverageDays: perf.stockCoverageDays,
          salesVelocityPerDay: perf.averageDailySales,
          priority: 'MEDIUM',
          createdAt: 'Active Now',
          actionText: 'View Inventory',
          actionType: 'view_inventory',
        });
      }

      // Rule 4: DEAD STOCK (0 sales in 30 days and holding stock)
      else if (perf.movement === 'DEAD_STOCK' && inv.currentStock > 0) {
        insights.push({
          id: `ai_deadstock_${inv.productId}`,
          userId: retailerId,
          type: 'DEAD_STOCK',
          title: `Dead Stock Alert: ${inv.productName}`,
          productName: inv.productName,
          productId: inv.productId,
          categoryName: inv.categoryName,
          whatHappened: `No customer purchases recorded in the past 30 days, while holding ${inv.currentStock} units.`,
          whyItMatters: `₹${(inv.currentStock * inv.purchasePrice).toLocaleString('en-IN')} of your money is frozen on shop shelves.`,
          whatShouldIDo: `Do not reorder. Consider a promotional bundle or clearance pricing to free up shelf space.`,
          stockCoverageDays: 999,
          salesVelocityPerDay: 0,
          priority: 'HIGH',
          createdAt: 'Active Now',
          actionText: 'Clear Stock',
          actionType: 'clear_stock',
        });
      }

      // Rule 5: HIGH PROFIT DRIVER
      else if (perf.margin >= 18 && perf.profit > 1000) {
        insights.push({
          id: `ai_highprofit_${inv.productId}`,
          userId: retailerId,
          type: 'HIGH_PROFIT',
          title: `High Profit Driver: ${inv.productName}`,
          productName: inv.productName,
          productId: inv.productId,
          categoryName: inv.categoryName,
          whatHappened: `Generated ₹${perf.profit.toLocaleString('en-IN')} gross profit with an attractive ${perf.margin.toFixed(1)}% profit margin.`,
          whyItMatters: `This product is one of the top gross profit contributors in your ${inv.categoryName} category.`,
          whatShouldIDo: `Keep premium shelf visibility at store checkout counter and maintain consistent inventory depth.`,
          priority: 'LOW',
          createdAt: 'Active Now',
          actionText: 'View Details',
          actionType: 'view_inventory',
        });
      }

      // Rule 6: LOW PROFIT MARGIN / REVIEW COST
      else if (perf.margin < 10 && perf.revenue > 2000) {
        insights.push({
          id: `ai_lowmargin_${inv.productId}`,
          userId: retailerId,
          type: 'LOW_PROFIT_MARGIN',
          title: `Low Profit Margin: ${inv.productName}`,
          productName: inv.productName,
          productId: inv.productId,
          categoryName: inv.categoryName,
          whatHappened: `High sales volume but low margin of only ${perf.margin.toFixed(1)}% (Purchase: ₹${inv.purchasePrice}, Selling: ₹${inv.sellingPrice}).`,
          whyItMatters: `You are generating high footfall for minimal net profit gain after operational handling.`,
          whatShouldIDo: `Review retail selling price or explore volume discounts with alternative wholesalers on VYRO.`,
          priority: 'MEDIUM',
          createdAt: 'Active Now',
          actionText: 'Adjust Price',
          actionType: 'adjust_price',
        });
      }
    });

    // Sort: HIGH priority first, then MEDIUM, then LOW
    const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return insights.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }
}

export const vyroStore = new VyroStore();

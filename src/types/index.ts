export type UserRole = 'retailer' | 'wholesaler';

export interface AuthUser {
  emailOrId: string;
  role: UserRole;
  businessName?: string;
  name?: string;
  loginTime: string;
}

export interface UserProfile {
  id: string;
  name: string;
  businessName: string;
  role: UserRole;
  phone: string;
  email: string;
  city: string;
  state: string;
  gstin?: string;
  address: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
}

export interface Product {
  id: string;
  wholesalerId: string;
  wholesalerName: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  image: string;
  description: string;
  price: number; // Retail Suggested / Selling price in ₹
  wholesalePrice: number; // Wholesale B2B Purchase Price in ₹
  moq: number; // Minimum Order Quantity
  stock: number; // Available inventory with wholesaler
  lowStockThreshold: number;
  deliveryEstimate: string; // e.g. "Tomorrow by 2 PM", "1-2 Business Days"
  verified: boolean;
  createdAt: string;
  unit: string; // e.g. "Pack", "Box", "Carton", "kg", "L"
  costPrice?: number; // Wholesaler procurement cost per unit in ₹
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';
export type PaymentMethod = 'upi' | 'cod' | 'netbanking' | 'credit';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  image: string;
  quantity: number;
  wholesalePrice: number;
  subtotal: number;
  unit: string;
}

export interface Order {
  id: string;
  retailerId: string;
  retailerName: string;
  retailerBusinessName: string;
  wholesalerId: string;
  wholesalerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'cod';
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    status: OrderStatus;
    time: string;
    note: string;
  }[];
}

export interface RetailerInventoryItem {
  id: string;
  retailerId: string;
  productId: string;
  productName: string;
  brand: string;
  categoryName: string;
  image: string;
  currentStock: number;
  purchasePrice: number; // What the retailer bought it for from wholesaler
  sellingPrice: number; // What the retailer sells it for to consumer
  lowStockThreshold: number;
  unit: string;
  lastRestocked: string;
}

export interface SalesRecord {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  sellingPrice: number;
  purchasePrice: number;
  revenue: number; // sellingPrice * quantity
  cost: number; // purchasePrice * quantity
  profit: number; // revenue - cost
  margin: number; // (profit / revenue) * 100
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export type ProductMovement = 'FAST_MOVING' | 'NORMAL_MOVING' | 'SLOW_MOVING' | 'DEAD_STOCK';

export type AIRecommendationType =
  | 'BUY_MORE'
  | 'REORDER_SOON'
  | 'WATCH'
  | 'DO_NOT_BUY'
  | 'OVERSTOCKED'
  | 'DEAD_STOCK'
  | 'FAST_MOVING'
  | 'SLOW_MOVING'
  | 'HIGH_PROFIT'
  | 'LOW_PROFIT_MARGIN'
  | 'LOW_STOCK'
  | 'POTENTIAL_STOCKOUT';

export interface AIInsight {
  id: string;
  userId: string;
  type: AIRecommendationType;
  title: string;
  productName: string;
  productId?: string;
  categoryName?: string;
  whatHappened: string;
  whyItMatters: string;
  whatShouldIDo: string;
  recommendedUnits?: number;
  estimatedProfitImpact?: string;
  stockCoverageDays?: number;
  salesVelocityPerDay?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  actionText?: string;
  actionType?: 'reorder' | 'view_inventory' | 'adjust_price' | 'clear_stock' | 'review_cost';
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'inventory' | 'ai' | 'payment';
  linkRoute?: string;
}

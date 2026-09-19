import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Search,
  Store,
  Boxes,
  Zap,
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';
import { vyroStore } from '../../services/store';

interface RetailerHomeProps {
  onNavigate: (route: string) => void;
  onOpenProductDetails: (product: Product) => void;
  onCategorySelect: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const RetailerHome: React.FC<RetailerHomeProps> = ({
  onNavigate,
  onOpenProductDetails,
  onCategorySelect,
  searchQuery,
  onSearchChange,
}) => {
  const state = vyroStore.getState();
  const retailer = state.retailerProfile;
  const categories = state.categories;
  const products = state.products;
  const insights = vyroStore.getRetailerAIInsights();

  // Find critical low stock item for the hero alert
  const topAlert = insights.find((i) => i.priority === 'HIGH' || i.type === 'POTENTIAL_STOCKOUT');

  // Popular products (fast moving)
  const popularProducts = products.slice(0, 4);

  // Quick reorder candidate from inventory
  const lowStockInv = state.retailerInventory.find((i) => i.currentStock <= i.lowStockThreshold);
  const lowStockProduct = lowStockInv
    ? products.find((p) => p.id === lowStockInv.productId)
    : products[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Greeting & Store Header Banner */}
      <div className="bg-linear-to-r from-[#102A56] via-[#1769E0] to-[#0EA5A4] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-white/20">
            <Store className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{retailer.businessName} • {retailer.city}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste {retailer.name.split(' ')[0]} ji
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mt-1.5 font-normal leading-relaxed">
            What does your store need today? Explore wholesale rates direct from verified APMC & FMCG distributors.
          </p>

          {/* Quick Search on Home */}
          <div className="mt-5 relative max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Tata Salt, Fortune Oil, Aashirvaad Atta..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onNavigate('/retailer/marketplace');
              }}
              className="w-full pl-10 pr-24 py-2.5 bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-xl focus:outline-hidden shadow-sm"
            />
            <button
              onClick={() => onNavigate('/retailer/marketplace')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1769E0] hover:bg-[#102A56] text-white text-xs font-bold rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Quick Quick Reorder Card in Hero if low stock exists */}
        {lowStockInv && lowStockProduct && (
          <div className="mt-6 pt-5 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
              <span className="font-semibold text-white">
                Low Stock Alert: {lowStockInv.productName} has only {lowStockInv.currentStock} units left in your shop.
              </span>
            </div>
            <button
              onClick={() => onOpenProductDetails(lowStockProduct)}
              className="px-4 py-1.5 rounded-lg bg-white text-[#102A56] hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>Quick Reorder</span>
            </button>
          </div>
        )}
      </div>

      {/* AI Business Decision Alert Highlight */}
      {topAlert && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  AI DECISION CENTER
                </span>
                <span className="text-xs font-bold text-amber-900">{topAlert.title}</span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {topAlert.whatHappened} {topAlert.whyItMatters}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/retailer/ai-insights')}
            className="shrink-0 px-4 py-2 bg-[#102A56] hover:bg-[#1769E0] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>View Recommendation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#102A56]">Wholesale Categories</h2>
            <p className="text-xs text-slate-500">Order by bulk category direct from specialized wholesalers</p>
          </div>
          <button
            onClick={() => onNavigate('/retailer/categories')}
            className="text-xs font-bold text-[#1769E0] hover:text-[#102A56] flex items-center gap-1"
          >
            View All ({categories.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.slice(0, 10).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onCategorySelect(cat.id);
                onNavigate('/retailer/marketplace');
              }}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition-all text-left group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 group-hover:text-[#1769E0] text-slate-700 flex items-center justify-center transition-colors mb-2">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#1769E0] transition-colors leading-tight">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{cat.itemCount} SKUs</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Fast-Moving Products Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#102A56]">Fast-Moving Wholesale Products</h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                High Turnover
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Essential staples with proven retail demand in Bengaluru kiranas
            </p>
          </div>

          <button
            onClick={() => onNavigate('/retailer/marketplace')}
            className="text-xs font-bold text-[#1769E0] hover:text-[#102A56] flex items-center gap-1"
          >
            See All Products
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={onOpenProductDetails}
            />
          ))}
        </div>
      </div>

      {/* Recommended for Your Store & Quick Reorder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recommended Products */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#102A56]">Recommended For Your Store</h2>
              <p className="text-xs text-slate-500">Based on your shop sales velocity and current inventory depth</p>
            </div>
            <button
              onClick={() => onNavigate('/retailer/marketplace')}
              className="text-xs font-bold text-[#1769E0]"
            >
              Browse Catalog
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.slice(4, 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={onOpenProductDetails}
              />
            ))}
          </div>
        </div>

        {/* Right Col: Store Health Snapshot */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-[#1769E0]">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#102A56]">Inventory Health</h3>
                <p className="text-[11px] text-slate-400">Ramesh Stores Snapshot</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Tracked Store SKUs:</span>
                <span className="font-bold text-slate-900">{state.retailerInventory.length} items</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Low Stock Alerts:</span>
                <span className="font-bold text-amber-600">
                  {state.retailerInventory.filter((i) => i.currentStock <= i.lowStockThreshold).length} items
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Stock Value:</span>
                <span className="font-black text-[#102A56]">
                  ₹
                  {state.retailerInventory
                    .reduce((sum, i) => sum + i.currentStock * i.purchasePrice, 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onNavigate('/retailer/inventory')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors text-center"
            >
              Open Inventory Manager
            </button>
            <button
              onClick={() => onNavigate('/retailer/sales')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#1769E0] hover:bg-[#102A56] text-white text-xs font-bold transition-colors text-center"
            >
              View Sales & Profit Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

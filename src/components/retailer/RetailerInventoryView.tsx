import React, { useState } from 'react';
import {
  Boxes,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Plus,
  Minus,
  CheckCircle2,
  ShoppingCart,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { MovementBadge } from '../common/StatusBadge';
import { MetricCard } from '../common/MetricCard';
import { RetailerInventoryItem } from '../../types';
import { vyroStore } from '../../services/store';

interface RetailerInventoryViewProps {
  onNavigateToMarketplace: () => void;
  onOpenProductDetailsById: (productId: string) => void;
}

export const RetailerInventoryView: React.FC<RetailerInventoryViewProps> = ({
  onNavigateToMarketplace,
  onOpenProductDetailsById,
}) => {
  const state = vyroStore.getState();
  const inventory = state.retailerInventory;

  // Selected item for counter sale modal
  const [sellingItem, setSellingItem] = useState<RetailerInventoryItem | null>(null);
  const [saleQuantity, setSaleQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);

  // Price adjustment modal
  const [adjustingPriceItem, setAdjustingPriceItem] = useState<RetailerInventoryItem | null>(null);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(0);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'instock'>('all');

  // Summary Metrics
  const totalSkus = inventory.length;
  const lowStockCount = inventory.filter((i) => i.currentStock <= i.lowStockThreshold && i.currentStock > 0).length;
  const outOfStockCount = inventory.filter((i) => i.currentStock === 0).length;
  const inStockCount = inventory.filter((i) => i.currentStock > i.lowStockThreshold).length;
  const totalInventoryValue = inventory.reduce(
    (sum, i) => sum + i.currentStock * i.purchasePrice,
    0
  );

  const filteredInventory = inventory.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!item.productName.toLowerCase().includes(q) && !item.brand.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (filterStock === 'low') {
      return item.currentStock <= item.lowStockThreshold;
    }
    if (filterStock === 'instock') {
      return item.currentStock > item.lowStockThreshold;
    }
    return true;
  });

  const handleOpenSaleModal = (item: RetailerInventoryItem) => {
    setSellingItem(item);
    setSaleQuantity(1);
    setCustomPrice(item.sellingPrice);
  };

  const handleExecuteSale = () => {
    if (!sellingItem) return;

    try {
      const record = vyroStore.recordRetailerSale(sellingItem.productId, saleQuantity, customPrice);
      setSaleSuccessMessage(
        `Sold ${saleQuantity} ${sellingItem.unit} of ${sellingItem.productName} for ₹${record.revenue}. Profit: ₹${record.profit} (${record.margin.toFixed(1)}% margin)!`
      );
      setSellingItem(null);
      setTimeout(() => setSaleSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePrice = () => {
    if (!adjustingPriceItem) return;
    vyroStore.updateRetailerSellingPrice(adjustingPriceItem.productId, newSellingPrice);
    setAdjustingPriceItem(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#1769E0]" />
            <h1 className="text-xl font-black text-[#102A56]">Store Shelf Inventory</h1>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
              Live Stock Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock on hand, purchase cost basis, selling MRP, and stock valuation
          </p>
        </div>

        <button
          onClick={onNavigateToMarketplace}
          className="px-4 py-2.5 bg-[#1769E0] hover:bg-[#102A56] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Procure More Wholesale</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Total SKUs"
          value={totalSkus}
          subtext="Active products stocked"
          icon={<Boxes className="w-4 h-4" />}
        />
        <MetricCard
          label="In Stock"
          value={inStockCount}
          subtext="Healthy inventory depth"
          trend={{ value: 'Stable', isPositive: true }}
        />
        <MetricCard
          label="Low Stock Alerts"
          value={lowStockCount}
          subtext="Needs replenishment"
          trend={{ value: `${lowStockCount} items`, isPositive: false }}
          highlight={lowStockCount > 0}
        />
        <MetricCard
          label="Inventory Value"
          value={`₹${totalInventoryValue.toLocaleString('en-IN')}`}
          subtext="Wholesale purchase cost"
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>

      {/* Success Notification Alert */}
      {saleSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saleSuccessMessage}</span>
          </div>
          <button onClick={() => setSaleSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            ✕
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search inventory by product or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
          />
          <Boxes className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'low', label: 'Low Stock Only' },
            { id: 'instock', label: 'In Stock' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStock(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStock === tab.id
                  ? 'bg-[#102A56] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items List */}
      <div className="space-y-3">
        {filteredInventory.map((item) => {
          const perf = vyroStore.getProductPerformance(item.productId);
          const stockValue = item.currentStock * item.purchasePrice;
          const profitPerUnit = item.sellingPrice - item.purchasePrice;
          const profitMargin = ((profitPerUnit / item.sellingPrice) * 100).toFixed(1);
          const isLowStock = item.currentStock <= item.lowStockThreshold && item.currentStock > 0;
          const isOut = item.currentStock === 0;

          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 hover:border-blue-300 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.brand}
                    </span>
                    <MovementBadge movement={perf.movement} />
                    {isLowStock && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Low Stock Alert
                      </span>
                    )}
                    {isOut && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[#102A56] leading-snug">{item.productName}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Category: {item.categoryName} • Last restocked: {item.lastRestocked}
                  </p>
                </div>
              </div>

              {/* Numerical Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 px-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stock</span>
                  <span
                    className={`text-base font-extrabold ${
                      isLowStock ? 'text-amber-600' : isOut ? 'text-rose-600' : 'text-[#102A56]'
                    }`}
                  >
                    {item.currentStock} {item.unit}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Velocity: {perf.averageDailySales.toFixed(1)}/day
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Purchase Cost</span>
                  <span className="text-base font-bold text-slate-800">₹{item.purchasePrice}</span>
                  <span className="text-[10px] text-slate-400 block">Wholesale rate</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Selling Price</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-slate-800">₹{item.sellingPrice}</span>
                    <button
                      onClick={() => {
                        setAdjustingPriceItem(item);
                        setNewSellingPrice(item.sellingPrice);
                      }}
                      className="text-[10px] text-[#1769E0] font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    ₹{profitPerUnit} ({profitMargin}%)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock Value</span>
                  <span className="text-base font-black text-[#102A56]">
                    ₹{stockValue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Coverage: {perf.stockCoverageDays > 90 ? '90+ days' : `${perf.stockCoverageDays} days`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Record Counter Sale Action */}
                <button
                  onClick={() => handleOpenSaleModal(item)}
                  disabled={item.currentStock === 0}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
                  title="Simulate customer buying from store"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Sell to Customer</span>
                </button>

                {/* Reorder from Wholesaler */}
                <button
                  onClick={() => onOpenProductDetailsById(item.productId)}
                  className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#1769E0] border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Record Customer Sale */}
      {sellingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Retail Counter Sale</span>
                <h3 className="font-bold text-base text-[#102A56]">Sell {sellingItem.productName}</h3>
              </div>
              <button
                onClick={() => setSellingItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
                <div>
                  <span className="text-slate-400 block">Available in Store</span>
                  <span className="font-bold text-slate-900">{sellingItem.currentStock} {sellingItem.unit}s</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Wholesale Cost</span>
                  <span className="font-bold text-slate-900">₹{sellingItem.purchasePrice}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Default Selling Price</span>
                  <span className="font-bold text-[#1769E0]">₹{sellingItem.sellingPrice}</span>
                </div>
              </div>

              {/* Quantity to sell */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity Sold to Customer ({sellingItem.unit}s)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => setSaleQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-sm text-[#102A56]">{saleQuantity}</span>
                    <button
                      onClick={() => setSaleQuantity((q) => Math.min(sellingItem.currentStock, q + 1))}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex gap-1.5">
                    {[1, 5, 10, 20].map((qty) => (
                      <button
                        key={qty}
                        disabled={qty > sellingItem.currentStock}
                        onClick={() => setSaleQuantity(qty)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          saleQuantity === qty
                            ? 'bg-[#1769E0] text-white border-[#1769E0]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30'
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selling price adjustment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Selling Rate (₹)</label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-bold text-[#102A56]"
                />
              </div>

              {/* Real-time Math Preview */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-emerald-800">Customer Revenue:</span>
                  <span className="font-bold text-emerald-900">
                    ₹{(customPrice * saleQuantity).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-800">Purchase Cost:</span>
                  <span className="font-medium text-emerald-800">
                    ₹{(sellingItem.purchasePrice * saleQuantity).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200/80 font-black text-sm text-emerald-950">
                  <span>Gross Profit Earned:</span>
                  <span>
                    ₹{(customPrice * saleQuantity - sellingItem.purchasePrice * saleQuantity).toLocaleString('en-IN')} (
                    {(((customPrice - sellingItem.purchasePrice) / (customPrice || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setSellingItem(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteSale}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Confirm Sale & Deduct Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Selling Price */}
      {adjustingPriceItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-[#102A56] mb-1">Adjust Store MRP / Selling Price</h3>
            <p className="text-xs text-slate-500 mb-4">{adjustingPriceItem.productName}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Wholesale Cost: ₹{adjustingPriceItem.purchasePrice}
                </label>
                <input
                  type="number"
                  value={newSellingPrice}
                  onChange={(e) => setNewSellingPrice(Number(e.target.value))}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#102A56]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setAdjustingPriceItem(null)}
                  className="w-1/2 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePrice}
                  className="w-1/2 py-2 bg-[#1769E0] text-white rounded-xl text-xs font-bold"
                >
                  Save Price
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

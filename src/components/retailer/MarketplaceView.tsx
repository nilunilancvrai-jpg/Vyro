import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Store, Check, RotateCcw, ArrowUpDown } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';
import { vyroStore } from '../../services/store';

interface MarketplaceViewProps {
  onOpenProductDetails: (product: Product) => void;
  selectedCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onOpenProductDetails,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const state = vyroStore.getState();
  const products = state.products;
  const categories = state.categories;

  // Filter States
  const [priceRange, setPriceRange] = useState<'all' | 'under50' | '50to200' | 'above200'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [moqFilter, setMoqFilter] = useState<'all' | 'low' | 'med' | 'high'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'tomorrow' | 'twodays'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'newest'>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search Query match: Product name, Brand, Category, Wholesaler name
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = product.name.toLowerCase().includes(q);
          const matchesBrand = product.brand.toLowerCase().includes(q);
          const matchesCat = product.categoryName.toLowerCase().includes(q);
          const matchesWholesaler = product.wholesalerName.toLowerCase().includes(q);

          if (!matchesName && !matchesBrand && !matchesCat && !matchesWholesaler) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory && selectedCategory !== 'all') {
          if (product.categoryId !== selectedCategory) return false;
        }

        // Price Filter (Wholesale price)
        if (priceRange === 'under50' && product.wholesalePrice >= 50) return false;
        if (priceRange === '50to200' && (product.wholesalePrice < 50 || product.wholesalePrice > 200)) return false;
        if (priceRange === 'above200' && product.wholesalePrice <= 200) return false;

        // Availability Filter
        if (inStockOnly && product.stock <= 0) return false;

        // MOQ Filter
        if (moqFilter === 'low' && product.moq > 10) return false;
        if (moqFilter === 'med' && (product.moq <= 10 || product.moq > 24)) return false;
        if (moqFilter === 'high' && product.moq <= 24) return false;

        // Delivery Filter
        if (deliveryFilter === 'tomorrow' && !product.deliveryEstimate.toLowerCase().includes('tomorrow')) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.wholesalePrice - b.wholesalePrice;
        if (sortBy === 'price_desc') return b.wholesalePrice - a.wholesalePrice;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // Default: popular / high stock & verified
        return b.stock - a.stock;
      });
  }, [products, searchQuery, selectedCategory, priceRange, inStockOnly, moqFilter, deliveryFilter, sortBy]);

  const resetFilters = () => {
    onSelectCategory(null);
    onSearchChange('');
    setPriceRange('all');
    setInStockOnly(false);
    setMoqFilter('all');
    setDeliveryFilter('all');
    setSortBy('popular');
  };

  const hasActiveFilters =
    selectedCategory !== null ||
    searchQuery !== '' ||
    priceRange !== 'all' ||
    inStockOnly ||
    moqFilter !== 'all' ||
    deliveryFilter !== 'all';

  return (
    <div className="space-y-6 pb-12">
      {/* Marketplace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#1769E0]" />
            <h1 className="text-xl font-black text-[#102A56]">VYRO Marketplace</h1>
            <span className="text-xs bg-blue-50 text-[#1769E0] font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
              {filteredProducts.length} Wholesale SKUs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Order directly from verified wholesale distributors with transparent wholesale pricing & MOQ
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar: Filters */}
        <div
          className={`md:block space-y-5 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs h-fit ${
            showMobileFilters ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-xs uppercase tracking-wider text-[#102A56] flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#1769E0]" />
              Filter Products
            </span>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-[11px] text-rose-600 font-semibold hover:underline">
                Clear all
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Category</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => onSelectCategory(null)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-50 text-[#1769E0] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                <span>{products.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-50 text-[#1769E0] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate max-w-[150px]">{cat.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {products.filter((p) => p.categoryId === cat.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Wholesale Price Range */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-2">Wholesale Price (₹)</label>
            <div className="space-y-1 text-xs">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under50', label: 'Under ₹50' },
                { id: '50to200', label: '₹50 to ₹200' },
                { id: 'above200', label: 'Above ₹200' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-slate-600 cursor-pointer py-0.5">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={priceRange === opt.id}
                    onChange={() => setPriceRange(opt.id as any)}
                    className="text-[#1769E0] focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Order Quantity (MOQ) */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-2">Min. Order Quantity (MOQ)</label>
            <div className="space-y-1 text-xs">
              {[
                { id: 'all', label: 'All MOQs' },
                { id: 'low', label: 'Low MOQ (≤ 10 units)' },
                { id: 'med', label: 'Medium MOQ (11-24 units)' },
                { id: 'high', label: 'Bulk MOQ (> 24 units)' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-slate-600 cursor-pointer py-0.5">
                  <input
                    type="radio"
                    name="moqFilter"
                    checked={moqFilter === opt.id}
                    onChange={() => setMoqFilter(opt.id as any)}
                    className="text-[#1769E0] focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Speed */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-2">Delivery Time</label>
            <div className="space-y-1 text-xs">
              {[
                { id: 'all', label: 'Any Delivery' },
                { id: 'tomorrow', label: 'Tomorrow by 2 PM' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-slate-600 cursor-pointer py-0.5">
                  <input
                    type="radio"
                    name="deliveryFilter"
                    checked={deliveryFilter === opt.id}
                    onChange={() => setDeliveryFilter(opt.id as any)}
                    className="text-[#1769E0] focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Checkbox */}
          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-[#1769E0] focus:ring-blue-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Right Grid: Product Results */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-800">No matching products found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No products match your current search and filter criteria. Try resetting filters or searching with a different term.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-[#1769E0] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#102A56] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={onOpenProductDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

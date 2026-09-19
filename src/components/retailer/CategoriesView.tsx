import React from 'react';
import { Store, ArrowRight, Package } from 'lucide-react';
import { vyroStore } from '../../services/store';

interface CategoriesViewProps {
  onCategorySelect: (categoryId: string) => void;
  onNavigateToMarketplace: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  onCategorySelect,
  onNavigateToMarketplace,
}) => {
  const state = vyroStore.getState();
  const categories = state.categories;
  const products = state.products;

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <h1 className="text-xl font-black text-[#102A56]">Wholesale Product Categories</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select a category to browse wholesale distributors and bulk rates for your retail store
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const categoryProducts = products.filter((p) => p.categoryId === cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => {
                onCategorySelect(cat.id);
                onNavigateToMarketplace();
              }}
              className="group bg-white p-5 rounded-3xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1769E0] group-hover:bg-[#1769E0] group-hover:text-white flex items-center justify-center transition-colors mb-3">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-[#102A56] group-hover:text-[#1769E0] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {categoryProducts.length} active products
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1769E0]">
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

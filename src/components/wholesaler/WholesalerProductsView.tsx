import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Boxes,
  DollarSign,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Product } from '../../types';
import { vyroStore } from '../../services/store';

interface WholesalerProductsViewProps {
  onOpenAddModal: () => void;
}

export const WholesalerProductsView: React.FC<WholesalerProductsViewProps> = ({
  onOpenAddModal,
}) => {
  const state = vyroStore.getState();
  const wholesaler = state.wholesalerProfile;
  const products = state.products.filter((p) => p.wholesalerId === wholesaler.id);

  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
  });

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditPrice(p.wholesalePrice);
    setEditStock(p.stock);
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    vyroStore.updateProductWholesalePriceAndStock(editingProduct.id, editPrice, editStock);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1769E0]" />
            <h1 className="text-xl font-black text-[#102A56]">Wholesale Product Catalog</h1>
            <span className="text-xs bg-blue-50 text-[#1769E0] font-bold px-2 py-0.5 rounded-full">
              {products.length} Active SKUs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain wholesale pricing, bulk minimum order quantities (MOQ), and bulk inventory counts
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-[#1769E0] hover:bg-[#102A56] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 flex items-center">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search catalog by name or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Wholesale Price</th>
                <th className="py-3 px-4 text-right">Retail MRP</th>
                <th className="py-3 px-4 text-right">MOQ</th>
                <th className="py-3 px-4 text-right">Warehouse Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-400">Brand: {p.brand}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{p.categoryName}</td>
                  <td className="py-3 px-4 text-right font-black text-[#102A56]">
                    ₹{p.wholesalePrice}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">₹{p.price}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-800">
                    {p.moq} {p.unit}s
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-bold ${
                        p.stock < 100 ? 'text-amber-600' : 'text-slate-900'
                      }`}
                    >
                      {p.stock} {p.unit}s
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="px-3 py-1.5 bg-blue-50 text-[#1769E0] hover:bg-blue-100 font-bold rounded-lg text-xs transition-colors"
                    >
                      Quick Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-[#102A56]">Update Wholesale Price & Stock</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-800 mb-4">{editingProduct.name}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Wholesale Price per {editingProduct.unit} (₹)
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#102A56]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Available Warehouse Stock ({editingProduct.unit}s)
                </label>
                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#102A56]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="w-1/2 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="w-1/2 py-2 bg-[#1769E0] text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

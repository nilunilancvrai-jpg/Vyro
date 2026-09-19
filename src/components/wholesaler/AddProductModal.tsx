import React, { useState } from 'react';
import { X, Plus, Package, DollarSign, Image } from 'lucide-react';
import { Product } from '../../types';
import { vyroStore } from '../../services/store';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const state = vyroStore.getState();
  const wholesaler = state.wholesalerProfile;
  const categories = state.categories;

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [wholesalePrice, setWholesalePrice] = useState<number>(100);
  const [retailPrice, setRetailPrice] = useState<number>(120);
  const [moq, setMoq] = useState<number>(12);
  const [stock, setStock] = useState<number>(500);
  const [unit, setUnit] = useState<'piece' | 'packet' | 'box' | 'bag' | 'kg' | 'liter'>('packet');
  const [deliveryEstimate, setDeliveryEstimate] = useState('Tomorrow by 2 PM');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCat = categories.find((c) => c.id === categoryId);

    const newProd: Omit<Product, 'id' | 'createdAt'> = {
      name,
      brand,
      categoryId,
      categoryName: selectedCat ? selectedCat.name : 'Groceries',
      wholesalerId: wholesaler.id,
      wholesalerName: wholesaler.businessName,
      wholesalePrice,
      price: retailPrice,
      moq,
      stock,
      unit,
      image,
      description: description || `Fresh wholesale batch of ${name} directly from verified manufacturer.`,
      deliveryEstimate,
      verified: true,
      lowStockThreshold: 20,
    };

    vyroStore.addProduct(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1769E0]" />
            <h3 className="font-bold text-base text-[#102A56]">List New Wholesale SKU</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Product Title / Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Parle-G Gold Biscuits 1kg Box"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Parle / Tata / Amul"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Wholesale Rate (₹) *</label>
              <input
                type="number"
                required
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#102A56]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Retail MRP (₹) *</label>
              <input
                type="number"
                required
                value={retailPrice}
                onChange={(e) => setRetailPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Minimum Order (MOQ) *</label>
              <input
                type="number"
                required
                value={moq}
                onChange={(e) => setMoq(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Warehouse Stock *</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Packaging Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="packet">packet</option>
                <option value="piece">piece</option>
                <option value="box">box</option>
                <option value="bag">bag</option>
                <option value="kg">kg</option>
                <option value="liter">liter</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery SLA</label>
              <input
                type="text"
                value={deliveryEstimate}
                onChange={(e) => setDeliveryEstimate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Product Description</label>
            <textarea
              rows={2}
              placeholder="Bulk packaging details, shelf life, manufacturer notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1769E0] hover:bg-[#102A56] text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              Publish SKU to Marketplace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

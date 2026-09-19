import React, { useState } from 'react';
import { X, ShieldCheck, Truck, ShieldAlert, Check, ShoppingCart, Zap, Plus, Minus } from 'lucide-react';
import { Product } from '../../types';
import { vyroStore } from '../../services/store';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onProceedToCheckout: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onProceedToCheckout,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(product.moq);
  const [added, setAdded] = useState(false);

  const profitPerUnit = product.price - product.wholesalePrice;
  const marginPercent = ((profitPerUnit / product.price) * 100).toFixed(1);
  const totalWholesaleCost = product.wholesalePrice * quantity;
  const totalRetailValue = product.price * quantity;
  const totalPotentialProfit = totalRetailValue - totalWholesaleCost;

  const handleAddToCart = () => {
    vyroStore.addToCart(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    vyroStore.addToCart(product.id, quantity);
    onProceedToCheckout(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header with Close */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-[#1769E0] uppercase tracking-wider">
              {product.categoryName}
            </span>
            {product.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Wholesaler
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Image & Trust Badges */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Trust Indicators */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#1769E0] shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900">{product.deliveryEstimate}</p>
                  <p className="text-[10px] text-slate-500">Fast doorstep dispatch</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900">Secure B2B Invoice</p>
                  <p className="text-[10px] text-slate-500">GST verified billing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details & Calculations */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{product.brand}</p>
              <h2 className="text-lg sm:text-xl font-bold text-[#102A56] mt-0.5 leading-snug">{product.name}</h2>

              {/* Wholesaler Details */}
              <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5">
                <span>Sold by:</span>
                <span className="font-semibold text-slate-900">{product.wholesalerName}</span>
              </div>

              {/* Price & Margin Breakdown Card */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Wholesale Purchase</span>
                    <span className="text-2xl font-black text-[#102A56]">₹{product.wholesalePrice}</span>
                    <span className="text-xs text-slate-500"> / {product.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Retail MRP</span>
                    <span className="text-lg font-bold text-slate-700">₹{product.price}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>Gross Profit Potential:</span>
                  <span>
                    ₹{profitPerUnit} ({marginPercent}%)
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs text-slate-600 leading-relaxed">{product.description}</p>

              {/* Stock & MOQ Info */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <div>
                  <span className="text-slate-500 block text-[11px]">Minimum Order (MOQ)</span>
                  <span className="font-bold text-[#102A56]">{product.moq} {product.unit}s</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Wholesaler Stock</span>
                  <span className="font-bold text-emerald-700">{product.stock} available</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Live Order Math */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700">Order Quantity ({product.unit}s):</span>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(product.moq, q - 1))}
                    disabled={quantity <= product.moq}
                    className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#102A56]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total Summary */}
              <div className="mb-4 text-xs flex items-center justify-between bg-slate-100/80 px-3 py-2 rounded-lg">
                <span className="text-slate-600">Total Purchase Cost:</span>
                <span className="font-extrabold text-sm text-[#102A56]">
                  ₹{totalWholesaleCost.toLocaleString('en-IN')}
                </span>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                    added
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-slate-50 text-[#1769E0] border-[#1769E0]'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#1769E0] hover:bg-[#102A56] text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Zap className="w-4 h-4" /> Quick Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShoppingCart, Check, ShieldCheck, Clock, Plus, Minus, Zap } from 'lucide-react';
import { Product } from '../../types';
import { vyroStore } from '../../services/store';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onQuickBuy?: (product: Product, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onQuickBuy,
}) => {
  const [quantity, setQuantity] = useState(product.moq);
  const [isAdded, setIsAdded] = useState(false);

  const potentialProfitPerUnit = product.price - product.wholesalePrice;
  const marginPercent = ((potentialProfitPerUnit / product.price) * 100).toFixed(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    vyroStore.addToCart(product.id, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleQuickBuyAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickBuy) {
      onQuickBuy(product, quantity);
    } else {
      vyroStore.addToCart(product.id, quantity);
    }
  };

  const increaseQty = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQty = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > product.moq) {
      setQuantity((prev) => prev - 1);
    }
  };

  const isLowStock = product.stock <= product.lowStockThreshold && product.stock > 0;
  const isOutOfStock = product.stock === 0;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full bg-slate-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="bg-[#102A56]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            {product.brand}
          </span>
          {marginPercent && Number(marginPercent) > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              {marginPercent}% Retail Margin
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Only {product.stock} Left
            </span>
          ) : (
            <span className="bg-emerald-500/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              In Stock
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Wholesaler & Delivery */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span className="inline-flex items-center gap-1 font-medium truncate max-w-[140px]">
              {product.wholesalerName}
              {product.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500 shrink-0">
              <Clock className="w-3 h-3 text-slate-400" />
              {product.deliveryEstimate}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm text-[#0F172A] line-clamp-2 leading-snug group-hover:text-[#1769E0] transition-colors">
            {product.name}
          </h3>

          {/* Pricing Row */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wholesale Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-[#102A56]">₹{product.wholesalePrice}</span>
                <span className="text-xs text-slate-400">/{product.unit || 'unit'}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Selling MRP</span>
              <span className="text-sm font-semibold text-slate-600">₹{product.price}</span>
            </div>
          </div>

          {/* MOQ notice */}
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between bg-slate-50 px-2 py-1 rounded-md">
            <span>Min. Order (MOQ):</span>
            <span className="font-bold text-[#102A56]">{product.moq} units</span>
          </div>
        </div>

        {/* Actions & Quantity Adjuster */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Stepper for Quantity */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
            <button
              onClick={decreaseQty}
              disabled={quantity <= product.moq || isOutOfStock}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded disabled:opacity-30 transition-colors"
              title="Decrease"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-slate-800">{quantity}</span>
            <button
              onClick={increaseQty}
              disabled={quantity >= product.stock || isOutOfStock}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded disabled:opacity-30 transition-colors"
              title="Increase"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-50 hover:bg-blue-100 text-[#1769E0] border border-blue-200'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>

          {/* Quick Buy CTA */}
          <button
            onClick={handleQuickBuyAction}
            disabled={isOutOfStock}
            title="Quick Buy"
            className="p-2 rounded-lg bg-[#1769E0] hover:bg-[#102A56] text-white disabled:opacity-40 transition-colors"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { vyroStore } from '../../services/store';
import { Product } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
  onNavigateToMarketplace: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  onNavigateToMarketplace,
}) => {
  if (!isOpen) return null;

  const state = vyroStore.getState();
  const cartEntries = Object.entries(state.cart);

  const cartItems = cartEntries
    .map(([productId, quantity]) => {
      const product = state.products.find((p) => p.id === productId);
      return product ? { product, quantity } : null;
    })
    .filter(Boolean) as { product: Product; quantity: number }[];

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.product.wholesalePrice * item.quantity,
    0
  );

  const deliveryFee = itemsTotal > 2000 ? 0 : itemsTotal > 0 ? 60 : 0;
  const grandTotal = itemsTotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1769E0]" />
            <h2 className="font-bold text-base text-[#102A56]">Wholesale Cart</h2>
            <span className="text-xs bg-blue-100 text-[#1769E0] font-bold px-2 py-0.5 rounded-full">
              {cartItems.length} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Banner */}
        {itemsTotal > 0 && itemsTotal < 2000 && (
          <div className="bg-amber-50 px-4 py-2 text-xs text-amber-800 border-b border-amber-200 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Add <strong>₹{(2000 - itemsTotal).toLocaleString('en-IN')}</strong> more for <strong>FREE Delivery</strong>!
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Browse verified Indian wholesalers and add fast-moving inventory to your store.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToMarketplace();
                }}
                className="mt-5 px-5 py-2.5 bg-[#1769E0] hover:bg-[#102A56] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            cartItems.map(({ product, quantity }) => {
              const subtotal = product.wholesalePrice * quantity;
              const isBelowMoq = quantity < product.moq;

              return (
                <div
                  key={product.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex gap-3 relative"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-white shrink-0 border border-slate-200"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {product.brand}
                        </span>
                        <h4 className="font-semibold text-xs text-[#0F172A] truncate max-w-[180px]">
                          {product.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => vyroStore.removeFromCart(product.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-bold text-xs text-[#102A56]">
                        ₹{product.wholesalePrice}
                      </span>
                      <span className="text-[11px] text-slate-400">× {quantity}</span>
                      <span className="ml-auto font-black text-xs text-[#102A56]">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {isBelowMoq && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">
                        Min. Order Quantity is {product.moq} units
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        Wholesaler: {product.wholesalerName}
                      </span>

                      <div className="flex items-center border border-slate-200 rounded-md bg-white">
                        <button
                          onClick={() => vyroStore.updateCartQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => vyroStore.updateCartQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{itemsTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-emerald-600">FREE</strong>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#102A56] pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified GST Wholesale B2B Purchase Order</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onNavigateToMarketplace();
                }}
                className="py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-center"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="py-2.5 px-3 rounded-xl bg-[#1769E0] hover:bg-[#102A56] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

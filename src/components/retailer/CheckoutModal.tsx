import React, { useState } from 'react';
import {
  X,
  MapPin,
  CreditCard,
  CheckCircle2,
  Truck,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Banknote,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { vyroStore } from '../../services/store';
import { PaymentMethod, Product, Order } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
  directBuyItem?: { product: Product; quantity: number } | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
  directBuyItem,
}) => {
  if (!isOpen) return null;

  const state = vyroStore.getState();
  const retailer = state.retailerProfile;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [address, setAddress] = useState(retailer.address);
  const [phone, setPhone] = useState(retailer.phone);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute items
  let checkoutItems: { product: Product; quantity: number }[] = [];
  if (directBuyItem) {
    checkoutItems = [directBuyItem];
  } else {
    checkoutItems = Object.entries(state.cart)
      .map(([id, qty]) => {
        const prod = state.products.find((p) => p.id === id);
        return prod ? { product: prod, quantity: qty } : null;
      })
      .filter(Boolean) as { product: Product; quantity: number }[];
  }

  const itemsSubtotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.wholesalePrice * item.quantity,
    0
  );
  const deliveryFee = itemsSubtotal > 2000 ? 0 : 60;
  const grandTotal = itemsSubtotal + deliveryFee;

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    try {
      const order = vyroStore.placeOrder(checkoutItems, paymentMethod, address);
      setPlacedOrder(order);

      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1769E0', '#0EA5A4', '#16B9D8', '#F59E0B'],
      });

      setStep(4);
      onOrderCompleted(order);
    } catch (err: any) {
      alert(err.message || 'Error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              VYRO B2B Wholesale Checkout
            </span>
            <h2 className="font-bold text-base text-[#102A56]">
              {step === 4 ? 'Order Confirmation' : 'Wholesale Procurement'}
            </h2>
          </div>
          {step !== 4 && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Step Indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step >= 1 ? 'bg-[#1769E0] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                1
              </span>
              <span className={`font-semibold ${step === 1 ? 'text-[#102A56]' : 'text-slate-500'}`}>
                Delivery
              </span>
            </div>
            <div className="h-0.5 w-8 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step >= 2 ? 'bg-[#1769E0] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </span>
              <span className={`font-semibold ${step === 2 ? 'text-[#102A56]' : 'text-slate-500'}`}>
                Payment
              </span>
            </div>
            <div className="h-0.5 w-8 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step >= 3 ? 'bg-[#1769E0] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </span>
              <span className={`font-semibold ${step === 3 ? 'text-[#102A56]' : 'text-slate-500'}`}>
                Review
              </span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* STEP 1: Delivery Address */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1769E0] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#102A56]">{retailer.businessName}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Recipient: {retailer.name} ({phone})</p>
                  <p className="text-xs text-slate-500 mt-0.5">GSTIN: {retailer.gstin}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Dispatch Address</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#1769E0] outline-hidden leading-relaxed"
                  placeholder="Enter full commercial storefront address..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#1769E0] outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Direct Warehouse Dispatch</p>
                  <p className="text-[11px] text-slate-500">
                    Dispatched from APMC Wholesale Yards via express logistics.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 py-3 bg-[#1769E0] hover:bg-[#102A56] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select B2B Settlement Method
              </h3>

              <div className="space-y-2.5">
                {/* UPI */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#1769E0] bg-blue-50/70 ring-2 ring-[#1769E0]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Instant UPI Payment</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Fastest
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</p>
                  </div>
                </div>

                {/* COD */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#1769E0] bg-blue-50/70 ring-2 ring-[#1769E0]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-xs text-slate-900">Cash on Delivery (COD)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pay in cash or UPI when transport delivers to store</p>
                  </div>
                </div>

                {/* Netbanking / NEFT */}
                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-[#1769E0] bg-blue-50/70 ring-2 ring-[#1769E0]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1769E0] flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-xs text-slate-900">Commercial Net Banking / NEFT</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">HDFC, SBI, ICICI, Axis Bank Corporate</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-[#1769E0] hover:bg-[#102A56] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Place Order */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                {checkoutItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                    <div className="flex items-center gap-2">
                      <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover border border-slate-200" />
                      <div>
                        <p className="font-semibold text-slate-900 truncate max-w-[200px]">{product.name}</p>
                        <p className="text-[10px] text-slate-500">₹{product.wholesalePrice} × {quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#102A56]">
                      ₹{(product.wholesalePrice * quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery & Payment Preview */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery to</span>
                  <p className="font-semibold text-slate-800 truncate mt-0.5">{address}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment</span>
                  <p className="font-semibold text-slate-800 capitalize mt-0.5">{paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Wholesale Subtotal:</span>
                  <span className="font-semibold text-slate-900">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Logistics Transport:</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#102A56] pt-2 border-t border-blue-200/60">
                  <span>Total Payable:</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setStep(2)}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#1769E0] hover:bg-[#102A56] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Order...' : 'Place Order'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Order Placed Successfully! */}
          {step === 4 && placedOrder && (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Order Placed Successfully!
                </span>
                <h3 className="text-xl font-bold text-[#102A56] mt-2">
                  Order ID: {placedOrder.id}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sent to <strong>{placedOrder.wholesalerName}</strong> for acceptance and packing.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Total Items:</span>
                  <span className="font-bold text-slate-800">{placedOrder.items.length} products</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Order Amount:</span>
                  <span className="font-black text-[#102A56] text-sm">
                    ₹{placedOrder.total.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Expected Delivery:</span>
                  <span className="font-bold text-emerald-700">Tomorrow by 2 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-800 uppercase">{placedOrder.paymentMethod}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    onClose();
                    // Handled by parent view navigation
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#1769E0] hover:bg-[#102A56] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Track Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

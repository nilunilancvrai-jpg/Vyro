import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChevronRight,
  Package,
  Truck,
  Building2,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { OrderStatusBadge } from '../common/StatusBadge';
import { Order, OrderStatus } from '../../types';
import { vyroStore } from '../../services/store';

interface RetailerOrdersViewProps {
  onNavigateToMarketplace: () => void;
}

export const RetailerOrdersView: React.FC<RetailerOrdersViewProps> = ({
  onNavigateToMarketplace,
}) => {
  const [storeState, setStoreState] = useState(vyroStore.getState());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    return vyroStore.subscribe(() => {
      setStoreState({ ...vyroStore.getState() });
    });
  }, []);

  const retailer = storeState.retailerProfile;
  const orders = storeState.orders.filter((o) => o.retailerId === retailer.id);
  const selectedOrder = selectedOrderId
    ? storeState.orders.find((o) => o.id === selectedOrderId) || null
    : null;

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const timelineSteps: { status: OrderStatus; label: string }[] = [
    { status: 'pending', label: 'Order Placed' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'preparing', label: 'Preparing' },
    { status: 'dispatched', label: 'Dispatched' },
    { status: 'delivered', label: 'Delivered' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const orderIndexMap: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 1,
      preparing: 2,
      dispatched: 3,
      delivered: 4,
      cancelled: -1,
    };
    return orderIndexMap[status];
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Orders Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1769E0]" />
            <h1 className="text-xl font-black text-[#102A56]">Wholesale Procurement Orders</h1>
            <span className="text-xs bg-blue-50 text-[#1769E0] font-bold px-2 py-0.5 rounded-full">
              {orders.length} orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track status, deliveries, and wholesale fulfillment from your APMC distributors
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'dispatched', label: 'Dispatched' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-[#102A56] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {filterStatus === 'all'
              ? 'You have not placed any wholesale orders yet.'
              : `No orders currently in "${filterStatus}" status.`}
          </p>
          <button
            onClick={onNavigateToMarketplace}
            className="mt-4 px-5 py-2.5 bg-[#1769E0] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#102A56] transition-colors"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const currentStepIdx = getStepIndex(order.status);

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-[#102A56]">{order.id}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-800">
                      Wholesaler: {order.wholesalerName}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/60 shrink-0"
                      >
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {item.quantity} {item.unit}s × ₹{item.wholesalePrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                    <span className="text-lg font-black text-[#102A56]">
                      ₹{order.total.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 block uppercase">
                      Paid via {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {timelineSteps.map((s, idx) => {
                      const isComplete = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={s.status} className="flex items-center gap-1">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              isCurrent
                                ? 'bg-[#1769E0] ring-4 ring-blue-100'
                                : isComplete
                                ? 'bg-emerald-500'
                                : 'bg-slate-200'
                            }`}
                          />
                          <span
                            className={`text-[10px] hidden sm:inline ${
                              isCurrent
                                ? 'font-bold text-[#1769E0]'
                                : isComplete
                                ? 'text-slate-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {s.label}
                          </span>
                          {idx < timelineSteps.length - 1 && (
                            <div
                              className={`w-4 sm:w-6 h-0.5 ${
                                idx < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-200'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <span className="text-xs font-bold text-[#1769E0] flex items-center gap-1">
                    Order Details <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal with Detailed Visual Timeline */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Procurement Summary
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="font-bold text-base text-[#102A56]">{selectedOrder.id}</h3>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Wholesaler & Delivery Details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Wholesaler</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedOrder.wholesalerName}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">APMC Yard, Bengaluru</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Delivery Address</span>
                  <p className="font-medium text-slate-800 text-xs mt-0.5">{selectedOrder.deliveryAddress}</p>
                </div>
              </div>

              {/* Visual Timeline (Prompt Section 20) */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#102A56] mb-3">
                  Live Fulfillment Timeline
                </h4>
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
                  {selectedOrder.timeline.map((event, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#1769E0] ring-4 ring-blue-100" />
                      <div className="flex items-baseline justify-between">
                        <p className="text-xs font-bold text-slate-900 capitalize">
                          {event.status.replace('_', ' ')}
                        </p>
                        <span className="text-[10px] text-slate-400">{event.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{event.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#102A56] mb-2">
                  Ordered Products ({selectedOrder.items.length})
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <p className="text-slate-500 text-[11px]">
                            {item.quantity} {item.unit}s @ ₹{item.wholesalePrice}
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-[#102A56]">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{selectedOrder.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Logistics Transport:</span>
                  <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : `₹${selectedOrder.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#102A56] pt-2 border-t border-blue-200">
                  <span>Grand Total:</span>
                  <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="px-5 py-2 bg-[#102A56] text-white text-xs font-bold rounded-xl hover:bg-[#1769E0] transition-colors"
              >
                Close Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

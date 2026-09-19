import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Building2,
  Calendar,
  X,
  Search,
  Filter,
  ArrowRight,
  Package,
} from 'lucide-react';
import { OrderStatusBadge } from '../common/StatusBadge';
import { Order, OrderStatus } from '../../types';
import { vyroStore } from '../../services/store';

export const WholesalerOrdersView: React.FC = () => {
  const [storeState, setStoreState] = useState(vyroStore.getState());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    return vyroStore.subscribe(() => {
      setStoreState({ ...vyroStore.getState() });
    });
  }, []);

  const wholesaler = storeState.wholesalerProfile;
  const orders = storeState.orders.filter((o) => o.wholesalerId === wholesaler.id);
  const selectedOrder = selectedOrderId
    ? storeState.orders.find((o) => o.id === selectedOrderId) || null
    : null;

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !order.id.toLowerCase().includes(q) &&
        !order.retailerName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    vyroStore.updateOrderStatus(orderId, newStatus);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1769E0]" />
            <h1 className="text-xl font-black text-[#102A56]">B2B Retail Orders Management</h1>
            <span className="text-xs bg-blue-50 text-[#1769E0] font-bold px-2 py-0.5 rounded-full">
              {orders.length} Wholesale Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming orders from retail kirana stores, verify stock, and dispatch shipments
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'preparing', label: 'Preparing' },
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
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-base">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no orders matching your selected status filter.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-blue-300 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm text-[#102A56]">{order.id}</span>
                  <OrderStatusBadge status={order.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800">
                  Store: {order.retailerName} • ({order.items.reduce((s, i) => s + i.quantity, 0)} units total)
                </p>
                <p className="text-[11px] text-slate-500">
                  Address: {order.deliveryAddress}
                </p>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-3 sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Invoiced</span>
                  <span className="font-black text-base text-[#102A56]">
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedOrderId(order.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  View Details
                </button>

                {/* Quick Status Changers */}
                {order.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    Confirm Order
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    Pack & Prepare
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'dispatched')}
                    className="px-3.5 py-2 bg-[#1769E0] hover:bg-[#102A56] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    Dispatch Shipment
                  </button>
                )}
                {order.status === 'dispatched' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'delivered')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details & Workflow Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Order Management</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="font-bold text-base text-[#102A56]">{selectedOrder.id}</h3>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Change status bar */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-2">Update Order Status:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['pending', 'confirmed', 'preparing', 'dispatched', 'delivered', 'cancelled'] as OrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        id={`status-btn-${st}`}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdateStatus(selectedOrder.id, st);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                          selectedOrder.status === st
                            ? 'bg-[#102A56] text-white ring-2 ring-[#102A56] ring-offset-1 shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Retailer Info */}
              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-[#1769E0] block">Retailer Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.retailerName}</p>
                <p className="text-slate-600 mt-0.5">{selectedOrder.deliveryAddress}</p>
              </div>

              {/* Items List */}
              <div>
                <span className="font-bold text-slate-800 block mb-2">Ordered Products ({selectedOrder.items.length})</span>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <p className="text-slate-500 text-[11px]">
                            Qty: {item.quantity} {item.unit}s @ ₹{item.wholesalePrice}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#102A56]">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Card */}
              <div className="flex justify-between items-center p-3 bg-slate-100 rounded-xl font-bold text-slate-800">
                <span>Invoice Total:</span>
                <span className="text-base text-[#102A56]">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="px-5 py-2 bg-[#102A56] hover:bg-[#1253B8] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

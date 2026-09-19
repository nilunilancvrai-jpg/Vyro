import React, { useState } from 'react';
import {
  Building2,
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Truck,
  ChevronRight,
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { OrderStatusBadge } from '../common/StatusBadge';
import { Order, OrderStatus } from '../../types';
import { vyroStore } from '../../services/store';

interface WholesalerDashboardProps {
  onNavigate: (route: string) => void;
  onOpenAddProductModal: () => void;
}

export const WholesalerDashboard: React.FC<WholesalerDashboardProps> = ({
  onNavigate,
  onOpenAddProductModal,
}) => {
  const state = vyroStore.getState();
  const wholesaler = state.wholesalerProfile;
  const orders = state.orders.filter((o) => o.wholesalerId === wholesaler.id);
  const products = state.products.filter((p) => p.wholesalerId === wholesaler.id);

  // Wholesaler stats
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed');
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockWholesaleProducts = products.filter((p) => p.stock < 100);

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    vyroStore.updateOrderStatus(orderId, nextStatus);
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'dispatched';
      case 'dispatched':
        return 'delivered';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Wholesaler Hero Banner */}
      <div className="bg-linear-to-r from-[#102A56] via-[#1E3A8A] to-[#1769E0] rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-white/20">
              <Building2 className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{wholesaler.gstin} • APMC Yard, Yeshwanthpur</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {wholesaler.businessName}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">
              Wholesale Distribution Portal: Manage retailer B2B orders, dispatch logistics, and product catalogue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddProductModal}
              className="px-4 py-2.5 bg-[#F59E0B] hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>List New SKU</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="INCOMING B2B ORDERS"
          value={orders.length}
          subtext="Total store orders received"
          icon={<ShoppingBag className="w-4 h-4" />}
        />
        <MetricCard
          label="PENDING DISPATCH"
          value={pendingOrders.length}
          subtext="Requires fulfillment action"
          highlight={pendingOrders.length > 0}
          trend={{ value: `${pendingOrders.length} active`, isPositive: pendingOrders.length === 0 }}
        />
        <MetricCard
          label="TOTAL B2B REVENUE"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtext="Wholesale sales invoiced"
          icon={<TrendingUp className="w-4 h-4" />}
          highlight
        />
        <MetricCard
          label="ACTIVE CATALOG SKUS"
          value={products.length}
          subtext="Available to local retailers"
          icon={<Package className="w-4 h-4" />}
        />
      </div>

      {/* Incoming Orders Requiring Immediate Action */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#102A56]">Recent Retailer Orders</h2>
              {pendingOrders.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingOrders.length} Action Needed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Advance order status to dispatch orders directly to local kirana stores
            </p>
          </div>

          <button
            onClick={() => onNavigate('/wholesaler/orders')}
            className="text-xs font-bold text-[#1769E0] hover:text-[#102A56] flex items-center gap-1"
          >
            All Orders ({orders.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No orders received yet.</div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => {
              const nextStatus = getNextStatus(order.status);

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#102A56]">{order.id}</span>
                      <OrderStatusBadge status={order.status} />
                      <span className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Store: {order.retailerName} • {order.items.length} items
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-md">
                      {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                      <span className="font-black text-sm text-[#102A56]">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {nextStatus ? (
                      <button
                        onClick={() => handleUpdateStatus(order.id, nextStatus)}
                        className="px-3 py-2 bg-[#1769E0] hover:bg-[#102A56] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1 capitalize"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Advance to {nextStatus}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Warehouse Bulk Inventory & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Warehouse Products list */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#102A56]">Your Listed Wholesale SKUs</h2>
              <p className="text-xs text-slate-500">Live prices and bulk minimum order quantities</p>
            </div>
            <button
              onClick={() => onNavigate('/wholesaler/products')}
              className="text-xs font-bold text-[#1769E0]"
            >
              Manage Catalog ({products.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.slice(0, 6).map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center gap-3"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{prod.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    Wholesale: <strong className="text-[#102A56]">₹{prod.wholesalePrice}</strong> • MRP: ₹{prod.price}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Stock: {prod.stock} {prod.unit}s • MOQ: {prod.moq}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Wholesaler Profile and Fulfillment Hub */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-[#1769E0]" />
              <div>
                <h3 className="font-bold text-sm text-[#102A56]">Fulfillment Hub</h3>
                <p className="text-[10px] text-slate-400">APMC Yard Terminal 4</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">GST Registration:</span>
                <span className="font-bold text-slate-800">{wholesaler.gstin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Operating City:</span>
                <span className="font-bold text-slate-800">{wholesaler.city}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Average Fulfillment:</span>
                <span className="font-bold text-emerald-600">4.2 Hours</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Delivery Fleets:</span>
                <span className="font-bold text-slate-800">4 Mini Trucks Active</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={onOpenAddProductModal}
              className="w-full py-2.5 px-3 bg-[#1769E0] hover:bg-[#102A56] text-white text-xs font-bold rounded-xl transition-colors text-center"
            >
              Add New Product SKU
            </button>
            <button
              onClick={() => onNavigate('/wholesaler/analytics')}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
            >
              Wholesale Revenue Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

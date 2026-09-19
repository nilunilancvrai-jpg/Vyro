import React from 'react';
import { OrderStatus, ProductMovement, AIRecommendationType } from '../../types';

export const OrderStatusBadge: React.FC<{ status: OrderStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const config = {
    pending: { label: 'Order Placed', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    confirmed: { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    preparing: { label: 'Preparing', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    dispatched: { label: 'Dispatched', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    delivered: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  }[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
};

export const MovementBadge: React.FC<{ movement: ProductMovement; className?: string }> = ({
  movement,
  className = '',
}) => {
  const config = {
    FAST_MOVING: {
      label: 'FAST MOVING',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    NORMAL_MOVING: {
      label: 'NORMAL MOVING',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    SLOW_MOVING: {
      label: 'SLOW MOVING',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    DEAD_STOCK: {
      label: 'DEAD STOCK',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
  }[movement];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
};

export const AIRecommendationBadge: React.FC<{ type: AIRecommendationType; className?: string }> = ({
  type,
  className = '',
}) => {
  const map: Record<AIRecommendationType, { label: string; bg: string; text: string; border: string }> = {
    BUY_MORE: { label: 'BUY MORE', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    REORDER_SOON: { label: 'REORDER SOON', bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
    WATCH: { label: 'WATCH', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
    DO_NOT_BUY: { label: 'DO NOT BUY', bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
    OVERSTOCKED: { label: 'OVERSTOCKED', bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300' },
    DEAD_STOCK: { label: 'DEAD STOCK', bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
    FAST_MOVING: { label: 'FAST MOVING', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
    SLOW_MOVING: { label: 'SLOW MOVING', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    HIGH_PROFIT: { label: 'HIGH PROFIT', bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
    LOW_PROFIT_MARGIN: { label: 'LOW PROFIT MARGIN', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    LOW_STOCK: { label: 'LOW STOCK', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    POTENTIAL_STOCKOUT: { label: 'POTENTIAL STOCKOUT', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  };

  const item = map[type] || { label: type, bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wide uppercase border ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      {item.label}
    </span>
  );
};

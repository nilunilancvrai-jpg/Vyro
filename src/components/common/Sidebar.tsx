import React from 'react';
import {
  Home,
  Store,
  Grid,
  ShoppingBag,
  ShoppingCart,
  Boxes,
  TrendingUp,
  BrainCircuit,
  User,
  LayoutDashboard,
  PackagePlus,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  currentRole: UserRole;
  currentRoute: string;
  onNavigate: (route: string) => void;
  cartCount: number;
  onLogout?: () => void;
}

interface NavItem {
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentRoute,
  onNavigate,
  cartCount,
  onLogout,
}) => {
  const retailerNavItems: NavItem[] = [
    { label: 'Home', route: '/retailer', icon: Home },
    { label: 'Marketplace', route: '/retailer/marketplace', icon: Store },
    { label: 'Categories', route: '/retailer/categories', icon: Grid },
    { label: 'Orders', route: '/retailer/orders', icon: ShoppingBag },
    { label: 'Cart', route: '/retailer/cart', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { label: 'Inventory', route: '/retailer/inventory', icon: Boxes },
    { label: 'Sales & Profit', route: '/retailer/sales', icon: TrendingUp },
    { label: 'AI Insights', route: '/retailer/ai-insights', icon: BrainCircuit, highlight: true },
    { label: 'Account', route: '/retailer/account', icon: User },
  ];

  const wholesalerNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/wholesaler', icon: LayoutDashboard },
    { label: 'Products', route: '/wholesaler/products', icon: PackagePlus },
    { label: 'Orders', route: '/wholesaler/orders', icon: ClipboardList },
    { label: 'Inventory', route: '/wholesaler/inventory', icon: Boxes },
    { label: 'Sales', route: '/wholesaler/sales', icon: TrendingUp },
    { label: 'Analytics', route: '/wholesaler/analytics', icon: BarChart3 },
    { label: 'AI Insights', route: '/wholesaler/ai-insights', icon: BrainCircuit, highlight: true },
    { label: 'Account', route: '/wholesaler/account', icon: User },
  ];

  const items = currentRole === 'retailer' ? retailerNavItems : wholesalerNavItems;

  return (
    <aside className="w-64 shrink-0 hidden md:block bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {currentRole === 'retailer' ? 'Retailer Portal' : 'Wholesaler Portal'}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route;

          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? item.highlight
                    ? 'bg-linear-to-r from-blue-600 to-[#102A56] text-white font-semibold shadow-xs'
                    : 'bg-blue-50 text-[#1769E0] font-semibold'
                  : item.highlight
                  ? 'text-[#1769E0] hover:bg-blue-50/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 ${
                    isActive
                      ? item.highlight
                        ? 'text-white'
                        : 'text-[#1769E0]'
                      : item.highlight
                      ? 'text-[#1769E0]'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="bg-[#1769E0] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}

              {item.highlight && !isActive && (
                <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-[#1769E0] uppercase">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Trust & Connection Badge at bottom of sidebar */}
      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Account</span>
          </button>
        )}

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-center">
          <p className="text-xs font-bold text-[#102A56]">VYRO B2B Network</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Connecting Wholesale with Retail India</p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Marketplace Active
          </div>
        </div>
      </div>
    </aside>
  );
};

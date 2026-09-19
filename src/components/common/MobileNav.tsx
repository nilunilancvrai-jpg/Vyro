import React from 'react';
import { Home, Store, ShoppingBag, ShoppingCart, User, BrainCircuit, LayoutDashboard, Boxes } from 'lucide-react';
import { UserRole } from '../../types';

interface MobileNavProps {
  currentRole: UserRole;
  currentRoute: string;
  onNavigate: (route: string) => void;
  cartCount: number;
}

interface MobileNavItem {
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentRole,
  currentRoute,
  onNavigate,
  cartCount,
}) => {
  const retailerNav: MobileNavItem[] = [
    { label: 'Home', route: '/retailer', icon: Home },
    { label: 'Market', route: '/retailer/marketplace', icon: Store },
    { label: 'Orders', route: '/retailer/orders', icon: ShoppingBag },
    { label: 'Cart', route: '/retailer/cart', icon: ShoppingCart, badge: cartCount },
    { label: 'AI', route: '/retailer/ai-insights', icon: BrainCircuit },
  ];

  const wholesalerNav: MobileNavItem[] = [
    { label: 'Home', route: '/wholesaler', icon: LayoutDashboard },
    { label: 'Products', route: '/wholesaler/products', icon: Store },
    { label: 'Orders', route: '/wholesaler/orders', icon: ShoppingBag },
    { label: 'Inventory', route: '/wholesaler/inventory', icon: Boxes },
    { label: 'AI', route: '/wholesaler/ai-insights', icon: BrainCircuit },
  ];

  const items = currentRole === 'retailer' ? retailerNav : wholesalerNav;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-1 px-2 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentRoute === item.route;

        return (
          <button
            key={item.route}
            onClick={() => onNavigate(item.route)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg relative transition-colors ${
              isActive ? 'text-[#1769E0]' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#1769E0] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

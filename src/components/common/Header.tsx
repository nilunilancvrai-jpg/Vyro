import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Bell,
  RotateCcw,
  CheckCircle2,
  Store,
  Building2,
  User,
  LogOut,
} from 'lucide-react';
import { VyroLogo } from '../VyroLogo';
import { vyroStore } from '../../services/store';
import { UserRole } from '../../types';

interface HeaderProps {
  currentRole: UserRole;
  currentRoute: string;
  onNavigate: (route: string) => void;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCart?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentRoute,
  onNavigate,
  cartCount,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const state = vyroStore.getState();
  const currentProfile = currentRole === 'retailer' ? state.retailerProfile : state.wholesalerProfile;
  const unreadNotifs = state.notifications.filter((n) => n.userId === currentProfile.id && !n.read);

  const handleResetData = () => {
    vyroStore.resetToDefault();
    setResetConfirm(false);
    onNavigate(currentRole === 'retailer' ? '/retailer' : '/wholesaler');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Role Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate(currentRole === 'retailer' ? '/retailer' : '/wholesaler')}
            className="focus:outline-hidden hover:opacity-95 transition-opacity"
          >
            <VyroLogo size="sm" />
          </button>

          {/* Connected Role Indicator Badge (Informational only - role switching disabled) */}
          <div className="hidden md:flex items-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                currentRole === 'retailer'
                  ? 'bg-blue-50 text-[#1769E0] border-blue-200'
                  : 'bg-teal-50 text-[#0EA5A4] border-teal-200'
              }`}
            >
              {currentRole === 'retailer' ? (
                <>
                  <Store className="w-3.5 h-3.5" />
                  <span>Retailer: {state.retailerProfile.businessName}</span>
                </>
              ) : (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Wholesaler: {state.wholesalerProfile.businessName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                currentRole === 'retailer'
                  ? 'Search products, brands, groceries, wholesalers...'
                  : 'Search catalog, retailer orders, SKU...'
              }
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentRole === 'retailer' && currentRoute !== '/retailer/marketplace') {
                  onNavigate('/retailer/marketplace');
                }
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1769E0]/20 focus:border-[#1769E0] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Notifications, Cart, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Retailer Cart Button */}
          {currentRole === 'retailer' && (
            <button
              onClick={onOpenCart || (() => onNavigate('/retailer/cart'))}
              className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1769E0] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F59E0B] rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-[#102A56]">Business Notifications</span>
                  <span className="text-xs text-slate-400">{unreadNotifs.length} new</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {state.notifications
                    .filter((n) => n.userId === currentProfile.id)
                    .map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          notif.read = true;
                          setShowNotifications(false);
                          if (notif.linkRoute) onNavigate(notif.linkRoute);
                        }}
                        className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-xs text-slate-900">{notif.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Account & Profile Settings Shortcut */}
          <button
            type="button"
            onClick={() => onNavigate(currentRole === 'retailer' ? '/retailer/account' : '/wholesaler/account')}
            title="Profile & Business Settings"
            className="p-2 rounded-lg text-slate-600 hover:text-[#1769E0] hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <User className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-bold">{currentProfile.name.split(' ')[0]}</span>
          </button>

          {/* Reset Demo State Button */}
          <button
            onClick={() => setResetConfirm(true)}
            title="Reset to clean Demo State"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sign Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out / Change Account"
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline text-xs font-bold text-slate-600">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Reset Demo Data?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              This will restore all default products (Tata Salt, Fortune Oil, etc.), orders, inventory, and sales to
              their pristine initial demo state for testing.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1769E0] hover:bg-[#102A56] rounded-lg transition-colors"
              >
                Yes, Reset Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

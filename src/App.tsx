import React, { useState, useEffect } from 'react';
import { vyroStore } from './services/store';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { CartDrawer } from './components/retailer/CartDrawer';
import { CheckoutModal } from './components/retailer/CheckoutModal';
import { ProductDetailModal } from './components/retailer/ProductDetailModal';
import { RetailerHome } from './components/retailer/RetailerHome';
import { MarketplaceView } from './components/retailer/MarketplaceView';
import { CategoriesView } from './components/retailer/CategoriesView';
import { RetailerOrdersView } from './components/retailer/RetailerOrdersView';
import { RetailerInventoryView } from './components/retailer/RetailerInventoryView';
import { RetailerSalesView } from './components/retailer/RetailerSalesView';
import { RetailerAIInsightsView } from './components/retailer/RetailerAIInsightsView';
import { WholesalerDashboard } from './components/wholesaler/WholesalerDashboard';
import { WholesalerOrdersView } from './components/wholesaler/WholesalerOrdersView';
import { WholesalerProductsView } from './components/wholesaler/WholesalerProductsView';
import { WholesalerAnalyticsView } from './components/wholesaler/WholesalerAnalyticsView';
import { AddProductModal } from './components/wholesaler/AddProductModal';
import { LoginPage } from './components/auth/LoginPage';
import { Product, Order, UserRole } from './types';

export default function App() {
  const [storeState, setStoreState] = useState(vyroStore.getState());
  const [currentRoute, setCurrentRoute] = useState<string>(
    storeState.currentRole === 'wholesaler' ? '/wholesaler' : '/retailer'
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Search & Category filter shared state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = vyroStore.subscribe(() => {
      setStoreState(vyroStore.getState());
    });
    return unsubscribe;
  }, []);

  const cartCount = Object.values(storeState.cart).reduce((sum, qty) => sum + qty, 0);

  const handleNavigate = (route: string) => {
    // If navigating to role selection or login page
    if (route === '/role-selection' || route === '/login') {
      setCurrentRoute(route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Strictly enforce role isolation: users cannot cross between Retailer and Wholesaler without signing out
    if (storeState.currentRole === 'wholesaler' && route.startsWith('/retailer')) {
      return;
    }
    if (storeState.currentRole === 'retailer' && route.startsWith('/wholesaler')) {
      return;
    }
    if (route === '/retailer/cart') {
      setIsCartOpen(true);
      return;
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProductDetailsById = (productId: string) => {
    const p = storeState.products.find((item) => item.id === productId);
    if (p) {
      setDetailProduct(p);
    }
  };

  // Role-based redirection handler:
  // If user selects Retailer: Redirect to the existing Retailer Dashboard/Home route ('/retailer').
  // If user selects Wholesaler: Redirect to the existing Wholesaler Dashboard route ('/wholesaler').
  const handleLoginSuccess = (selectedRole: UserRole, targetRoute?: string) => {
    const route = targetRoute || (selectedRole === 'retailer' ? '/retailer' : '/wholesaler');
    vyroStore.setRole(selectedRole);
    setCurrentRoute(route);
    setStoreState(vyroStore.getState());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    vyroStore.logout();
    setCurrentRoute('/role-selection');
    setStoreState(vyroStore.getState());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is not yet logged in or navigates to role-selection, render the clean VYRO Role Selection / Login Page
  if (!storeState.isAuthenticated || currentRoute === '/role-selection' || currentRoute === '/login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Header */}
      <Header
        currentRole={storeState.currentRole}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Body Layout */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 md:pb-12 gap-6">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentRole={storeState.currentRole}
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          cartCount={cartCount}
          onLogout={handleLogout}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 min-w-0">
          {storeState.currentRole === 'retailer' ? (
            <>
              {(currentRoute === '/retailer' || currentRoute === '/retailer/home') && (
                <RetailerHome
                  onNavigate={handleNavigate}
                  onOpenProductDetails={(p) => setDetailProduct(p)}
                  onCategorySelect={(catId) => {
                    setSelectedCategory(catId);
                    setCurrentRoute('/retailer/marketplace');
                  }}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              )}

              {currentRoute === '/retailer/marketplace' && (
                <MarketplaceView
                  onOpenProductDetails={(p) => setDetailProduct(p)}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              )}

              {currentRoute === '/retailer/categories' && (
                <CategoriesView
                  onCategorySelect={(catId) => {
                    setSelectedCategory(catId);
                    setCurrentRoute('/retailer/marketplace');
                  }}
                  onNavigateToMarketplace={() => setCurrentRoute('/retailer/marketplace')}
                />
              )}

              {currentRoute === '/retailer/orders' && (
                <RetailerOrdersView
                  onNavigateToMarketplace={() => setCurrentRoute('/retailer/marketplace')}
                />
              )}

              {currentRoute === '/retailer/inventory' && (
                <RetailerInventoryView
                  onNavigateToMarketplace={() => setCurrentRoute('/retailer/marketplace')}
                  onOpenProductDetailsById={handleOpenProductDetailsById}
                />
              )}

              {currentRoute === '/retailer/sales' && <RetailerSalesView />}

              {currentRoute === '/retailer/ai-insights' && (
                <RetailerAIInsightsView
                  onNavigateToMarketplace={() => setCurrentRoute('/retailer/marketplace')}
                  onNavigateToInventory={() => setCurrentRoute('/retailer/inventory')}
                  onOpenProductDetailsById={handleOpenProductDetailsById}
                />
              )}

              {currentRoute === '/retailer/account' && (
                <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs max-w-2xl">
                  <h2 className="text-xl font-black text-[#102A56]">Retailer Store Profile</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Store account and business details registered on VYRO
                  </p>

                  <div className="mt-6 space-y-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Business Name</span>
                      <span className="text-base font-extrabold text-[#102A56]">
                        {storeState.retailerProfile.businessName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">Proprietor Name</span>
                        <span className="font-bold text-slate-900">{storeState.retailerProfile.name}</span>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">Contact Phone</span>
                        <span className="font-bold text-slate-900">{storeState.retailerProfile.phone}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">GSTIN Registration</span>
                      <span className="font-mono font-bold text-[#1769E0]">{storeState.retailerProfile.gstin}</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Store Delivery Address</span>
                      <span className="text-slate-800 font-medium">{storeState.retailerProfile.address}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {(currentRoute === '/wholesaler' || currentRoute === '/wholesaler/dashboard') && (
                <WholesalerDashboard
                  onNavigate={handleNavigate}
                  onOpenAddProductModal={() => setIsAddProductOpen(true)}
                />
              )}

              {currentRoute === '/wholesaler/orders' && <WholesalerOrdersView />}

              {(currentRoute === '/wholesaler/products' || currentRoute === '/wholesaler/inventory') && (
                <WholesalerProductsView
                  onOpenAddModal={() => setIsAddProductOpen(true)}
                />
              )}

              {(currentRoute === '/wholesaler/analytics' || currentRoute === '/wholesaler/sales') && (
                <WholesalerAnalyticsView />
              )}

              {currentRoute === '/wholesaler/ai-insights' && (
                <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-4">
                  <h2 className="text-xl font-black text-[#102A56]">Wholesale Supply Intelligence</h2>
                  <p className="text-xs text-slate-500">
                    B2B demand forecasting and bulk procurement signals from local kirana networks
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
                      <span className="font-bold text-emerald-800 block text-sm">High Demand Alert</span>
                      <p className="text-slate-600 mt-1">
                        Sunflower Oil demand spiked 24% across Malleshwaram & Yeshwanthpur kiranas this week.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs">
                      <span className="font-bold text-blue-800 block text-sm">Optimal Reorder Point</span>
                      <p className="text-slate-600 mt-1">
                        Aashirvaad Atta stock at 320 bags. Suggested bulk mill order: 500 bags within 3 days.
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
                      <span className="font-bold text-amber-800 block text-sm">Credit Risk Assessment</span>
                      <p className="text-slate-600 mt-1">
                        100% of retail orders settled via UPI or verified COD on delivery. Zero bad debt.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentRoute === '/wholesaler/account' && (
                <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs max-w-2xl">
                  <h2 className="text-xl font-black text-[#102A56]">Wholesaler Terminal Profile</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    APMC Yard distributor registration and warehouse credentials
                  </p>

                  <div className="mt-6 space-y-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Business Name</span>
                      <span className="text-base font-extrabold text-[#102A56]">
                        {storeState.wholesalerProfile.businessName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">Manager</span>
                        <span className="font-bold text-slate-900">{storeState.wholesalerProfile.name}</span>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">Contact Phone</span>
                        <span className="font-bold text-slate-900">{storeState.wholesalerProfile.phone}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">APMC & GSTIN</span>
                      <span className="font-mono font-bold text-[#1769E0]">{storeState.wholesalerProfile.gstin}</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Warehouse Terminal Address</span>
                      <span className="text-slate-800 font-medium">{storeState.wholesalerProfile.address}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentRole={storeState.currentRole}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        cartCount={cartCount}
      />

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onNavigateToMarketplace={() => {
          setIsCartOpen(false);
          setCurrentRoute('/retailer/marketplace');
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={(order: Order) => {
          setIsCheckoutOpen(false);
          setCurrentRoute('/retailer/orders');
        }}
      />

      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onProceedToCheckout={(product: Product, quantity: number) => {
          setDetailProduct(null);
          setIsCheckoutOpen(true);
        }}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
}

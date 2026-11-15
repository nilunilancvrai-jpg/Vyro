import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { vyroStore } from './services/store';
import { auth, testFirestoreConnection } from './lib/firebase';
import {
  clearPendingAuthRole,
  resolveAuthenticatedAccount,
  signOutAccount,
} from './services/authService';
import { FullUserAccount } from './types/onboarding';
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
import { AuthFlow } from './components/auth/AuthFlow';
import { ProfileSettingsView } from './components/account/ProfileSettingsView';
import { Product, Order } from './types';

const PUBLIC_AUTH_ROUTES = new Set(['/', '/welcome', '/role-selection', '/login', '/auth', '/onboarding']);

const VALID_RETAILER_ROUTES = new Set([
  '/retailer',
  '/retailer/home',
  '/retailer/marketplace',
  '/retailer/categories',
  '/retailer/orders',
  '/retailer/inventory',
  '/retailer/sales',
  '/retailer/ai-insights',
  '/retailer/account',
]);

const VALID_WHOLESALER_ROUTES = new Set([
  '/wholesaler',
  '/wholesaler/dashboard',
  '/wholesaler/orders',
  '/wholesaler/products',
  '/wholesaler/inventory',
  '/wholesaler/analytics',
  '/wholesaler/sales',
  '/wholesaler/ai-insights',
  '/wholesaler/account',
]);

function normalizePath(pathname: string): string {
  const cleaned = pathname.replace(/\/+$/, '') || '/';
  return cleaned === '/' ? '/welcome' : cleaned;
}

function syncBrowserUrl(route: string, replace = false): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizePath(route);
  if (normalizePath(window.location.pathname) === normalized) return;
  if (replace) {
    window.history.replaceState(null, '', normalized);
  } else {
    window.history.pushState(null, '', normalized);
  }
}

export default function App() {
  const [storeState, setStoreState] = useState(vyroStore.getState());
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userAccount, setUserAccount] = useState<FullUserAccount | null>(null);
  const userAccountRef = useRef<FullUserAccount | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window === 'undefined') return '/welcome';
    // Never initialize directly into a dashboard route before Firebase authentication resolves
    const path = normalizePath(window.location.pathname);
    return PUBLIC_AUTH_ROUTES.has(path) ? path : '/welcome';
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Search & Category filter shared state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeStore = vyroStore.subscribe(() => {
      setStoreState(vyroStore.getState());
    });

    void testFirestoreConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        userAccountRef.current = null;
        setFirebaseUser(null);
        setUserAccount(null);
        vyroStore.logout();
        setCurrentRoute('/welcome');
        syncBrowserUrl('/welcome', true);
        setAuthChecking(false);
        return;
      }

      try {
        const account = await resolveAuthenticatedAccount(user);
        userAccountRef.current = account;
        setFirebaseUser(user);
        setUserAccount(account);

        if (account && account.profile.onboardingCompleted) {
          clearPendingAuthRole();
          vyroStore.syncAuthenticatedAccount(account);
          const roleHome = account.profile.role === 'wholesaler' ? '/wholesaler' : '/retailer';
          const requestedPath = normalizePath(window.location.pathname);
          const isAllowedPath =
            account.profile.role === 'wholesaler'
              ? VALID_WHOLESALER_ROUTES.has(requestedPath)
              : VALID_RETAILER_ROUTES.has(requestedPath);

          const nextRoute = isAllowedPath ? requestedPath : roleHome;
          setCurrentRoute(nextRoute);
          syncBrowserUrl(nextRoute, true);
        } else {
          vyroStore.logout();
          setCurrentRoute('/onboarding');
          syncBrowserUrl('/onboarding', true);
        }
      } catch {
        userAccountRef.current = null;
        setFirebaseUser(null);
        setUserAccount(null);
        vyroStore.logout();
        setCurrentRoute('/welcome');
        syncBrowserUrl('/welcome', true);
      } finally {
        setAuthChecking(false);
      }
    });

    const handlePopState = () => {
      const requested = normalizePath(window.location.pathname);
      const currentUser = auth.currentUser;
      const latestAccount = userAccountRef.current;
      setCurrentRoute((prev) => {
        if (!currentUser || !latestAccount?.profile.onboardingCompleted) {
          syncBrowserUrl('/welcome', true);
          return '/welcome';
        }
        const role = latestAccount.profile.role;
        const validSet = role === 'wholesaler' ? VALID_WHOLESALER_ROUTES : VALID_RETAILER_ROUTES;
        if (!validSet.has(requested)) {
          const fallback = role === 'wholesaler' ? '/wholesaler' : '/retailer';
          syncBrowserUrl(fallback, true);
          return fallback;
        }
        return requested || prev;
      });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubscribeStore();
      unsubscribeAuth();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const isFullyAuthenticated = Boolean(
    firebaseUser && userAccount && userAccount.profile.onboardingCompleted
  );
  const cartCount = Object.values(storeState.cart).reduce((sum, qty) => sum + qty, 0);
  const activeRole = userAccount?.profile.role || storeState.currentRole;

  const handleNavigate = (route: string) => {
    // Route guard: block all dashboard navigation if not authenticated and onboarded
    if (!isFullyAuthenticated) {
      setCurrentRoute('/welcome');
      syncBrowserUrl('/welcome', true);
      return;
    }

    // Strictly enforce permanent backend role isolation: users cannot cross between Retailer and Wholesaler
    if (activeRole === 'wholesaler' && !VALID_WHOLESALER_ROUTES.has(route)) {
      return;
    }
    if (activeRole === 'retailer' && route !== '/retailer/cart' && !VALID_RETAILER_ROUTES.has(route)) {
      return;
    }
    if (route === '/retailer/cart') {
      setIsCartOpen(true);
      return;
    }
    setCurrentRoute(route);
    syncBrowserUrl(route, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProductDetailsById = (productId: string) => {
    const p = storeState.products.find((item) => item.id === productId);
    if (p) {
      setDetailProduct(p);
    }
  };

  const handleAuthComplete = (user: User, account: FullUserAccount) => {
    clearPendingAuthRole();
    userAccountRef.current = account;
    setFirebaseUser(user);
    setUserAccount(account);
    vyroStore.syncAuthenticatedAccount(account);
    const targetRoute = account.profile.role === 'wholesaler' ? '/wholesaler' : '/retailer';
    setCurrentRoute(targetRoute);
    syncBrowserUrl(targetRoute, true);
    setStoreState(vyroStore.getState());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await signOutAccount();
    userAccountRef.current = null;
    vyroStore.logout();
    setFirebaseUser(null);
    setUserAccount(null);
    setCurrentRoute('/welcome');
    syncBrowserUrl('/welcome', true);
    setStoreState(vyroStore.getState());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <Loader2 className="w-8 h-8 text-[#1769E0] animate-spin mb-3" />
        <p className="text-sm font-bold text-[#102A56]">Loading VYRO Platform...</p>
      </div>
    );
  }

  // Protected Route Guard: require Firebase session + completed business registration
  if (
    !isFullyAuthenticated ||
    !firebaseUser ||
    !userAccount ||
    PUBLIC_AUTH_ROUTES.has(currentRoute)
  ) {
    return (
      <AuthFlow
        existingFirebaseUser={firebaseUser}
        existingAccount={userAccount}
        onAuthComplete={handleAuthComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Header */}
      <Header
        currentRole={activeRole}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onLogout={() => void handleLogout()}
      />

      {/* Main Body Layout */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 md:pb-12 gap-6">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentRole={activeRole}
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          cartCount={cartCount}
          onLogout={() => void handleLogout()}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 min-w-0">
          {activeRole === 'retailer' ? (
            <>
              {(currentRoute === '/retailer' || currentRoute === '/retailer/home') && (
                <RetailerHome
                  onNavigate={handleNavigate}
                  onOpenProductDetails={(p) => setDetailProduct(p)}
                  onCategorySelect={(catId) => {
                    setSelectedCategory(catId);
                    handleNavigate('/retailer/marketplace');
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
                    handleNavigate('/retailer/marketplace');
                  }}
                  onNavigateToMarketplace={() => handleNavigate('/retailer/marketplace')}
                />
              )}

              {currentRoute === '/retailer/orders' && (
                <RetailerOrdersView
                  onNavigateToMarketplace={() => handleNavigate('/retailer/marketplace')}
                />
              )}

              {currentRoute === '/retailer/inventory' && (
                <RetailerInventoryView
                  onNavigateToMarketplace={() => handleNavigate('/retailer/marketplace')}
                  onOpenProductDetailsById={handleOpenProductDetailsById}
                />
              )}

              {currentRoute === '/retailer/sales' && <RetailerSalesView />}

              {currentRoute === '/retailer/ai-insights' && (
                <RetailerAIInsightsView
                  onNavigateToMarketplace={() => handleNavigate('/retailer/marketplace')}
                  onNavigateToInventory={() => handleNavigate('/retailer/inventory')}
                  onOpenProductDetailsById={handleOpenProductDetailsById}
                />
              )}

              {currentRoute === '/retailer/account' && (
                <ProfileSettingsView
                  firebaseUser={firebaseUser}
                  account={userAccount}
                  onAccountUpdated={(updated) => {
                    userAccountRef.current = updated;
                    setUserAccount(updated);
                    vyroStore.syncAuthenticatedAccount(updated);
                  }}
                  onLogout={handleLogout}
                />
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
                <ProfileSettingsView
                  firebaseUser={firebaseUser}
                  account={userAccount}
                  onAccountUpdated={(updated) => {
                    userAccountRef.current = updated;
                    setUserAccount(updated);
                    vyroStore.syncAuthenticatedAccount(updated);
                  }}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentRole={activeRole}
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
          handleNavigate('/retailer/marketplace');
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={(order: Order) => {
          setIsCheckoutOpen(false);
          handleNavigate('/retailer/orders');
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

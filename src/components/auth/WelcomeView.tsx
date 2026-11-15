import React from 'react';
import { ArrowRight, Store, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';
import { VyroLogo } from '../VyroLogo';

interface WelcomeViewProps {
  onContinueWithMobile: () => void;
  onSelectRole?: (role: UserRole) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onContinueWithMobile,
  onSelectRole,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Clean 3-Zone Top Bar */}
      <header className="w-full bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center shrink-0">
            <VyroLogo size="sm" showTagline={false} />
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#wholesalers" className="hover:text-[#102A56] transition-colors whitespace-nowrap shrink-0">
              For Wholesalers
            </a>
            <a href="#retailers" className="hover:text-[#102A56] transition-colors whitespace-nowrap shrink-0">
              For Retailers
            </a>
            <a href="#security" className="hover:text-[#102A56] transition-colors whitespace-nowrap shrink-0">
              Security &amp; Compliance
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onContinueWithMobile}
              className="px-4 py-2 bg-[#102A56] hover:bg-[#1769E0] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-14">
        {/* Hero 2-Column Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Value Proposition & Primary Action */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1769E0]">
                <span>Smart B2B Commerce Platform</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500">Wholesale-to-Retail India</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A56] tracking-tight leading-[1.12] text-balance">
                Direct wholesale supply and store intelligence, connected.
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                VYRO links APMC distributors and bulk wholesalers directly with neighbourhood kirana stores and
                supermarkets. Sign in with your Google account to manage procurement, live shelf inventory, and
                real-time profit analytics.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  id="welcome-continue-btn"
                  onClick={onContinueWithMobile}
                  className="px-6 py-3.5 bg-[#1769E0] hover:bg-[#102A56] text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2.5 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <span>Continue with Google</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                <span>Google Account Verified</span>
                <span aria-hidden="true">·</span>
                <span>GSTIN &amp; APMC Ready</span>
                <span aria-hidden="true">·</span>
                <span>Role-Protected Workspaces</span>
              </div>
            </div>

            {/* Wholesaler & Retailer Introduction (selecting either routes to Mobile Auth with role preserved) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <button
                type="button"
                id="wholesalers"
                onClick={() => (onSelectRole ? onSelectRole('wholesaler') : onContinueWithMobile())}
                className="pt-4 text-left space-y-1.5 group cursor-pointer rounded-xl p-2 -mx-2 hover:bg-teal-50/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]"
              >
                <div className="flex items-center justify-between text-[#0EA5A4]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <h2 className="text-sm font-bold text-[#102A56] group-hover:text-[#0EA5A4] transition-colors">
                      Wholesaler Terminal
                    </h2>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Publish bulk SKUs with MOQ tiers, confirm incoming kirana orders, dispatch stock, and monitor
                  wholesale revenue.
                </p>
              </button>

              <button
                type="button"
                id="retailers"
                onClick={() => (onSelectRole ? onSelectRole('retailer') : onContinueWithMobile())}
                className="pt-4 text-left space-y-1.5 group cursor-pointer rounded-xl p-2 -mx-2 hover:bg-blue-50/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
              >
                <div className="flex items-center justify-between text-[#1769E0]">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 shrink-0" />
                    <h2 className="text-sm font-bold text-[#102A56] group-hover:text-[#1769E0] transition-colors">
                      Retailer Store Portal
                    </h2>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Order staples at mandi rates, auto-restock shelf inventory on delivery, and track daily gross profit
                  margins.
                </p>
              </button>
            </div>
          </div>

          {/* Right Column: Editorial B2B Photography + Supply Network Visual */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative flex-1 min-h-[280px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src="/src/assets/images/vyro_b2b_commerce_1794721796235.jpg"
                alt="Indian wholesale distribution warehouse connected to modern retail kirana shelves"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <p className="text-xs font-semibold text-teal-300">APMC Distributors · Kirana Merchants</p>
                  <p className="text-sm sm:text-base font-bold leading-snug">
                    One verified network from warehouse dispatch to retail shelf.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4">
              <img
                src="/src/assets/images/vyro_indian_supply_1794721795682.jpg"
                alt="Isometric illustration of wholesale warehouse connected to retail store"
                referrerPolicy="no-referrer"
                className="w-24 h-18 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#102A56]">Verified Merchant Onboarding</h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Five-step business setup with Indian PIN code validation, GSTIN support, and consent-based tax
                  verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Proof & Security Strip */}
        <section
          id="security"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-slate-200"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#102A56] font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#1769E0]" />
              <span>Verified Google Sign-In</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Firebase Google authentication with verified session token checks on every API call.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#102A56] font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#0EA5A4]" />
              <span>Permanent Role Isolation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Wholesaler and Retailer permissions are locked in database rules to prevent unauthorized cross-access.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#102A56] font-bold text-sm">
              <Building2 className="w-4 h-4 text-[#1769E0]" />
              <span>Indian B2B Address Standard</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All 28 States and 8 Union Territories with 6-digit PIN validation and residential-to-shop sync.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#102A56] font-bold text-sm">
              <Store className="w-4 h-4 text-[#0EA5A4]" />
              <span>Privacy-First KYC</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              PAN is masked and hashed server-side; optional Aadhaar verification never stores full numbers locally.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

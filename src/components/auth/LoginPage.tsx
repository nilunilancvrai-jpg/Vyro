import React, { useState } from 'react';
import { UserRole } from '../../types';
import { vyroStore } from '../../services/store';
import { VyroLogo } from '../VyroLogo';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole, targetRoute?: string) => void;
  onNavigate?: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCustomLogin, setShowCustomLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Direct role selection and router navigation:
  // "Open Retailer Dashboard" -> navigates to '/retailer' (existing Retailer Dashboard/Home route)
  // "Open Wholesaler Dashboard" -> navigates to '/wholesaler' (existing Wholesaler Dashboard route)
  const handleSelectRole = (selectedRole: UserRole) => {
    setErrorMessage(null);
    const targetRoute = selectedRole === 'retailer' ? '/retailer' : '/wholesaler';

    const defaultIdentifier =
      selectedRole === 'retailer' ? 'kirana@rameshstores.in' : 'distributor@shreelakshmi.in';
    const finalIdentifier = emailOrId.trim() || defaultIdentifier;

    // Synchronously login in the store
    vyroStore.login(finalIdentifier, selectedRole);

    // Synchronously trigger navigation callback
    onLoginSuccess(selectedRole, targetRoute);
    if (onNavigate) {
      onNavigate(targetRoute);
    }
  };

  // Helper demo fill
  const handleFillDemo = (demoType: 'retailer' | 'wholesaler') => {
    if (demoType === 'retailer') {
      setEmailOrId('kirana@rameshstores.in');
      setPassword('kirana123');
    } else {
      setEmailOrId('distributor@shreelakshmi.in');
      setPassword('mandi123');
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F1F5F9] via-[#F8FAFC] to-[#EFF6FF] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* Decorative ambient background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Main Authentication Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-900/5 p-6 sm:p-8 backdrop-blur-sm">
          <div className="space-y-6">
            {/* VYRO Official Logo & Branding Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative p-2 rounded-full bg-white shadow-xs border border-slate-100 mb-3 hover:scale-105 transition-transform">
                <VyroLogo size="xl" variant="symbol" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
                VY<span className="text-[#1769E0]">R</span><span className="text-[#0EA5A4]">O</span>
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-[#64748B] mt-0.5">
                Business, Connected.
              </p>
              <div className="mt-3">
                <h2 className="text-lg sm:text-xl font-black text-[#102A56] tracking-tight">
                  What type of account do you have?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your account type to open your dedicated terminal
                </p>
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Two Prominent Role Options */}
            <div className="grid grid-cols-1 gap-3.5">
              {/* OPTION 1: Retailer */}
              <button
                id="open-retailer-dashboard-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectRole('retailer');
                }}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-[#1769E0] bg-white hover:bg-blue-50/40 transition-all group focus:outline-none focus:ring-2 focus:ring-[#1769E0] focus:ring-offset-2 shadow-xs cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-[#102A56] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-[#102A56] group-hover:text-[#1769E0] transition-colors">
                        Retailer
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1769E0] text-[10px] font-black uppercase tracking-wider">
                        Buyer
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      For Kirana stores, supermarkets & retail merchants buying wholesale stock.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-[#1769E0]">
                      <span>Open Retailer Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>

              {/* OPTION 2: Wholesaler */}
              <button
                id="open-wholesaler-dashboard-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectRole('wholesaler');
                }}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-[#0EA5A4] bg-white hover:bg-teal-50/40 transition-all group focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] focus:ring-offset-2 shadow-xs cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0EA5A4] to-[#0A6B6A] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-[#102A56] group-hover:text-[#0EA5A4] transition-colors">
                        Wholesaler
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0EA5A4] text-[10px] font-black uppercase tracking-wider">
                        Supplier
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      For Stockists, APMC distributors & bulk suppliers managing inventory and orders.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-[#0EA5A4]">
                      <span>Open Wholesaler Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Optional Custom Credentials Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCustomLogin(!showCustomLogin)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800 py-1 transition-colors"
              >
                <span>Custom Merchant ID / Login (Optional)</span>
                {showCustomLogin ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showCustomLogin && (
                <div className="mt-3 space-y-3 pt-1">
                  <div>
                    <label
                      htmlFor="customEmailOrId"
                      className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1"
                    >
                      Email or Phone ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="customEmailOrId"
                        type="text"
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        placeholder="e.g. kirana@rameshstores.in"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="customPassword"
                      className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="customPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Demo Credentials Quick Fill */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Fill Demo Credentials:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleFillDemo('retailer')}
                        className="py-1 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-[10px] font-bold text-[#1769E0] truncate transition-colors flex items-center gap-1"
                      >
                        <Store className="w-3 h-3 shrink-0" />
                        <span className="truncate">Kirana Retailer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillDemo('wholesaler')}
                        className="py-1 px-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-[10px] font-bold text-[#0EA5A4] truncate transition-colors flex items-center gap-1"
                      >
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">APMC Wholesaler</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-[11px] text-slate-400 font-medium pt-1">
              Clicking a terminal option opens that dashboard directly.
            </div>
          </div>
        </div>

        {/* Security / Quality Trust Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Verified B2B Network
          </span>
          <span>•</span>
          <span>APMC & GST Compliant</span>
          <span>•</span>
          <span>256-Bit SSL Secure</span>
        </div>
      </div>
    </div>
  );
};


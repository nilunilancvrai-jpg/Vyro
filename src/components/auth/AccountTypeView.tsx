import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Store, Check } from 'lucide-react';
import { UserRole } from '../../types';
import { VyroLogo } from '../VyroLogo';

interface AccountTypeViewProps {
  initialRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onBack: () => void;
}

export const AccountTypeView: React.FC<AccountTypeViewProps> = ({
  initialRole,
  onSelectRole,
  onBack,
}) => {
  const [selected, setSelected] = useState<UserRole>(initialRole);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#102A56] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Welcome</span>
          </button>
          <VyroLogo size="xs" showTagline={false} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#1769E0]">Step 1 of Login · Account Type</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A56] tracking-tight text-balance">
            Select your VYRO business account type
          </h1>
          <p className="text-sm text-slate-600">
            Your account role is permanently assigned upon registration and enforced across all dashboards and API
            permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Wholesaler Card */}
          <button
            type="button"
            id="select-wholesaler-role-btn"
            onClick={() => setSelected('wholesaler')}
            className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
              selected === 'wholesaler'
                ? 'border-[#0EA5A4] bg-teal-50/40'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#0EA5A4] text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <span
                  className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                    selected === 'wholesaler'
                      ? 'bg-[#0EA5A4] border-[#0EA5A4] text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {selected === 'wholesaler' && <Check className="w-3.5 h-3.5" />}
                </span>
              </div>

              <div>
                <h2 className="text-base font-extrabold text-[#102A56]">WHOLESALER</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  For businesses selling products in bulk to retailers.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <p>· Publish bulk catalog &amp; MOQ pricing</p>
              <p>· Fulfill &amp; dispatch kirana orders</p>
              <p>· Warehouse &amp; APMC analytics</p>
            </div>
          </button>

          {/* Retailer Card */}
          <button
            type="button"
            id="select-retailer-role-btn"
            onClick={() => setSelected('retailer')}
            className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
              selected === 'retailer'
                ? 'border-[#1769E0] bg-blue-50/40'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#1769E0] text-white flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <span
                  className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                    selected === 'retailer'
                      ? 'bg-[#1769E0] border-[#1769E0] text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {selected === 'retailer' && <Check className="w-3.5 h-3.5" />}
                </span>
              </div>

              <div>
                <h2 className="text-base font-extrabold text-[#102A56]">RETAILER</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  For shops purchasing products from wholesalers and selling to customers.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <p>· Direct wholesale marketplace ordering</p>
              <p>· Automatic shelf inventory restocking</p>
              <p>· Profit margin &amp; AI reorder insights</p>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Selected role: <strong className="text-[#102A56] capitalize">{selected}</strong>
          </p>

          <button
            type="button"
            id="continue-to-google-btn"
            onClick={() => onSelectRole(selected)}
            className="px-6 py-3 bg-[#102A56] hover:bg-[#1769E0] text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Continue with Google</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

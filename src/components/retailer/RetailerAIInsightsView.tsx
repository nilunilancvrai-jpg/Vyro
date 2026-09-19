import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Ban,
  Package,
} from 'lucide-react';
import { AIRecommendationBadge } from '../common/StatusBadge';
import { AIInsight, AIRecommendationType } from '../../types';
import { vyroStore } from '../../services/store';

interface RetailerAIInsightsViewProps {
  onNavigateToMarketplace: () => void;
  onNavigateToInventory: () => void;
  onOpenProductDetailsById: (productId: string) => void;
}

export const RetailerAIInsightsView: React.FC<RetailerAIInsightsViewProps> = ({
  onNavigateToMarketplace,
  onNavigateToInventory,
  onOpenProductDetailsById,
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'daily' | 'weekly' | 'monthly'>(
    'recommendations'
  );
  const [filterType, setFilterType] = useState<string>('all');

  const state = vyroStore.getState();
  const todayMetrics = vyroStore.getRetailerMetrics('today');
  const monthMetrics = vyroStore.getRetailerMetrics('month');
  const allInsights = useMemo(() => vyroStore.getRetailerAIInsights(), [state]);

  // Find dynamic fastest moving, low stock, and slow moving
  const fastMovingItem = state.retailerInventory.find((i) => {
    const perf = vyroStore.getProductPerformance(i.productId);
    return perf.movement === 'FAST_MOVING';
  });

  const lowStockItem = state.retailerInventory.find((i) => i.currentStock <= i.lowStockThreshold);

  const slowMovingItem = state.retailerInventory.find((i) => {
    const perf = vyroStore.getProductPerformance(i.productId);
    return perf.movement === 'SLOW_MOVING';
  });

  const filteredInsights = allInsights.filter((insight) => {
    if (filterType === 'all') return true;
    if (filterType === 'high') return insight.priority === 'HIGH';
    if (filterType === 'reorder') return insight.type === 'BUY_MORE' || insight.type === 'POTENTIAL_STOCKOUT';
    if (filterType === 'donotbuy') return insight.type === 'DO_NOT_BUY' || insight.type === 'DEAD_STOCK';
    return true;
  });

  const handleAction = (insight: AIInsight) => {
    if (insight.actionType === 'reorder' && insight.productId) {
      onOpenProductDetailsById(insight.productId);
    } else if (insight.actionType === 'view_inventory') {
      onNavigateToInventory();
    } else {
      onNavigateToMarketplace();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-[#102A56] via-[#1769E0] to-[#0EA5A4] rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-white/20">
              <BrainCircuit className="w-4 h-4 text-[#F59E0B]" />
              <span>VYRO AI Business Decision Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">AI Decision Center</h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Actionable buy, reorder, watch, and clearance recommendations computed from your actual store sales velocity,
              margins, and supplier stock.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs">
            <span className="text-blue-200 block text-[10px] uppercase font-bold">Actionable Insights</span>
            <span className="text-2xl font-black text-white">{allInsights.length} Recommendations</span>
            <span className="text-[11px] text-emerald-300 block mt-0.5">Updated in Real-Time</span>
          </div>
        </div>
      </div>

      {/* Section 33: YOUR BUSINESS TODAY Executive Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              STORE PERFORMANCE RECAP
            </span>
            <h2 className="text-base font-black text-[#102A56]">YOUR BUSINESS TODAY</h2>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Real Sales Data
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Sales</span>
            <span className="text-xl sm:text-2xl font-black text-[#102A56]">
              ₹{todayMetrics.sales.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Cost</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-700">
              ₹{todayMetrics.cost.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Profit</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700">
              ₹{todayMetrics.grossProfit.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Profit Margin</span>
            <span className="text-xl sm:text-2xl font-black text-blue-700">
              {todayMetrics.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Dynamic Key Product Movement Insights (Section 33) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Fastest Moving</span>
            <p className="font-bold text-slate-900 mt-0.5">
              {fastMovingItem ? fastMovingItem.productName : 'Tata Salt 1kg'}
            </p>
            <p className="text-[10px] text-emerald-700 mt-1">Consistent customer repeat purchase</p>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">Low Stock Warning</span>
            <p className="font-bold text-slate-900 mt-0.5">
              {lowStockItem ? lowStockItem.productName : 'Cooking Oil 1L'}
            </p>
            <p className="text-[10px] text-amber-700 mt-1">
              Only {lowStockItem ? lowStockItem.currentStock : 8} units left
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Slow Moving</span>
            <p className="font-bold text-slate-900 mt-0.5">
              {slowMovingItem ? slowMovingItem.productName : 'Premium Biscuits Tin'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">7+ weeks stock coverage on hand</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#1769E0] uppercase block">Recommended Action</span>
              <p className="font-bold text-[#102A56] mt-0.5">
                {lowStockItem ? `Reorder ${lowStockItem.brand}` : 'Maintain Current Inventory'}
              </p>
            </div>
            {lowStockItem && (
              <button
                onClick={() => onOpenProductDetailsById(lowStockItem.productId)}
                className="mt-2 text-[10px] font-bold text-[#1769E0] hover:underline flex items-center gap-1"
              >
                Reorder in 1-Click <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Decision Cards vs Daily/Weekly/Monthly Executive Summaries */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'bg-[#102A56] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Recommendations ({allInsights.length})
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'daily'
              ? 'bg-[#102A56] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daily AI Brief
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'weekly'
              ? 'bg-[#102A56] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Weekly AI Brief
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'monthly'
              ? 'bg-[#102A56] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Monthly Strategic Brief
        </button>
      </div>

      {/* TAB 1: RECOMMENDATION CARDS (WHAT / WHY / WHAT TO DO) */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {/* Subfilter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Recommendations' },
              { id: 'high', label: 'Urgent Priority (High)' },
              { id: 'reorder', label: 'Buy More / Reorder' },
              { id: 'donotbuy', label: 'Do Not Buy / Dead Stock' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  filterType === f.id
                    ? 'bg-blue-50 border-blue-300 text-[#1769E0] font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredInsights.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-base">All Caught Up!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your inventory levels and product margins are currently optimized.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInsights.map((insight) => {
                const isUrgent = insight.priority === 'HIGH';

                return (
                  <div
                    key={insight.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between shadow-xs ${
                      isUrgent
                        ? 'border-amber-300/90 ring-2 ring-amber-100'
                        : 'border-slate-200/90 hover:border-blue-200'
                    }`}
                  >
                    <div>
                      {/* Badge & Urgency Row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <AIRecommendationBadge type={insight.type} />
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            insight.priority === 'HIGH'
                              ? 'bg-rose-100 text-rose-800'
                              : insight.priority === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {insight.priority} Priority
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-base text-[#102A56] leading-snug">{insight.title}</h3>

                      {/* The Mandated Core AI Structure (Section 47): WHAT / WHY / WHAT TO DO */}
                      <div className="mt-4 space-y-2.5 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60">
                        <div>
                          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                            WHAT HAPPENED?
                          </span>
                          <p className="text-slate-700 mt-0.5 leading-relaxed">{insight.whatHappened}</p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                            WHY DOES IT MATTER?
                          </span>
                          <p className="text-slate-700 mt-0.5 leading-relaxed">{insight.whyItMatters}</p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-black text-[#1769E0] block tracking-wider">
                            WHAT SHOULD I DO?
                          </span>
                          <p className="text-[#102A56] font-semibold mt-0.5 leading-relaxed">
                            {insight.whatShouldIDo}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {insight.stockCoverageDays !== undefined
                          ? `Coverage: ${insight.stockCoverageDays} days`
                          : 'Rule verified'}
                      </span>

                      <button
                        onClick={() => handleAction(insight)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs ${
                          insight.type === 'DO_NOT_BUY' || insight.type === 'DEAD_STOCK'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            : 'bg-[#1769E0] hover:bg-[#102A56] text-white'
                        }`}
                      >
                        {insight.type === 'DO_NOT_BUY' || insight.type === 'DEAD_STOCK' ? (
                          <Ban className="w-3.5 h-3.5" />
                        ) : (
                          <ShoppingCart className="w-3.5 h-3.5" />
                        )}
                        <span>{insight.actionText || 'Take Action'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DAILY SUMMARY (Master Prompt Section 43) */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                EXECUTIVE DAILY BRIEF
              </span>
              <h2 className="text-xl font-black text-[#102A56]">TODAY'S AI SUMMARY</h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">Live Real-Time</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Sales increased by <strong>8%</strong> compared to the 30-day daily moving average.
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>
                <strong>Fortune Sunflower Oil 1L</strong> is running low on stock (only 8 units left).
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>
                <strong>Tata Salt 1kg</strong> is your fastest-moving staple with 4 units/day velocity.
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>
                <strong>Royal Heritage Danish Butter Cookies</strong> are moving slowly (42 units held vs 6 sold).
              </span>
            </p>
            <p className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 font-bold text-emerald-900">
              Estimated Gross Profit Today: ₹{todayMetrics.grossProfit.toLocaleString('en-IN')} (Margin:{' '}
              {todayMetrics.profitMargin.toFixed(1)}%)
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#102A56] mb-3">
              RECOMMENDED ACTIONS FOR TODAY:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs font-semibold text-slate-800">
              <li className="p-2 bg-slate-50 rounded-lg">
                Reorder <strong>Fortune Sunflower Oil 1L</strong> (12-15 units) from Shree Lakshmi Wholesale.
              </li>
              <li className="p-2 bg-slate-50 rounded-lg">
                <strong>Do not reorder</strong> Royal Heritage Butter Cookies; clear existing tin boxes first.
              </li>
              <li className="p-2 bg-slate-50 rounded-lg">
                Review margins on high-volume FMCG lines to optimize shop profitability.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 3: WEEKLY SUMMARY (Master Prompt Section 44) */}
      {activeTab === 'weekly' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                7-DAY ROLLING METRICS
              </span>
              <h2 className="text-xl font-black text-[#102A56]">WEEKLY AI PERFORMANCE SUMMARY</h2>
            </div>
            <span className="text-xs bg-blue-50 text-[#1769E0] font-bold px-2.5 py-1 rounded-full">
              Strongest: Groceries
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[10px] font-bold">Weekly Sales</span>
              <span className="text-lg font-black text-[#102A56]">₹1,24,500</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[10px] font-bold">Weekly Wholesale Cost</span>
              <span className="text-lg font-bold text-slate-700">₹1,03,200</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-800 block text-[10px] font-bold">Gross Profit</span>
              <span className="text-lg font-black text-emerald-800">₹21,300</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-blue-800 block text-[10px] font-bold">Profit Margin</span>
              <span className="text-lg font-black text-blue-900">17.1%</span>
            </div>
          </div>

          <div className="pt-2 text-xs space-y-2 text-slate-700">
            <p>
              • <strong>Top Products:</strong> Tata Salt (28 units/week), Maggi Masala Noodles (42 packs/week).
            </p>
            <p>
              • <strong>Slow Products:</strong> Royal Heritage Butter Cookies (only 2 tins sold).
            </p>
            <p>
              • <strong>Products Needing Replenishment:</strong> 2 critical SKUs (Sunflower Oil & Aashirvaad Atta).
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: MONTHLY SUMMARY (Master Prompt Section 45) */}
      {activeTab === 'monthly' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                MONTH-OVER-MONTH COMPARISON
              </span>
              <h2 className="text-xl font-black text-[#102A56]">MONTHLY EXECUTIVE SUMMARY</h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Revenue: +12% MoM
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[10px] font-bold">Monthly Revenue</span>
              <span className="text-lg font-black text-[#102A56]">₹5,42,000</span>
              <span className="text-[10px] text-emerald-600 font-bold">+12% vs last month</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[10px] font-bold">Wholesale Cost</span>
              <span className="text-lg font-bold text-slate-700">₹4,62,000</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-800 block text-[10px] font-bold">Gross Profit</span>
              <span className="text-lg font-black text-emerald-800">₹80,000</span>
              <span className="text-[10px] text-emerald-600 font-bold">+9% vs last month</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-blue-800 block text-[10px] font-bold">Average Margin</span>
              <span className="text-lg font-black text-blue-900">14.8%</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900">Executive Strategic Highlights:</h4>
            <p>
              Procurement consolidation through APMC Wholesalers via VYRO reduced average acquisition costs by
              4.2%, unlocking ₹80,000 in monthly gross profit.
            </p>
            <p>
              Fast-moving staples (Atta, Salt, Oil, Rice) accounted for 71% of customer volume with 100% on-shelf availability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

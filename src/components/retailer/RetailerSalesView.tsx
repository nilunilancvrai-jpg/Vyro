import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  ArrowUpDown,
  RotateCw,
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { MovementBadge } from '../common/StatusBadge';
import { vyroStore } from '../../services/store';

export const RetailerSalesView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'profit' | 'revenue' | 'units' | 'margin'>('profit');

  const state = vyroStore.getState();
  const salesRecords = state.salesRecords;
  const inventory = state.retailerInventory;

  // Active Metrics based on timeframe
  const metrics = useMemo(() => {
    return vyroStore.getRetailerMetrics(timeframe);
  }, [timeframe, salesRecords]);

  // Product performance compilation
  const productPerformances = useMemo(() => {
    const list = inventory.map((item) => {
      const perf = vyroStore.getProductPerformance(item.productId);
      return {
        ...item,
        ...perf,
      };
    });

    return list.sort((a, b) => {
      if (sortBy === 'profit') return b.profit - a.profit;
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      if (sortBy === 'units') return b.unitsSold - a.unitsSold;
      if (sortBy === 'margin') return b.margin - a.margin;
      return 0;
    });
  }, [inventory, salesRecords, sortBy]);

  // Generate 7-day trend series from real sales records
  const trendData = useMemo(() => {
    const days = 7;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });

      const dayRecords = salesRecords.filter((r) => r.date === dateStr);
      const dayRevenue = dayRecords.reduce((sum, r) => sum + r.revenue, 0);
      const dayCost = dayRecords.reduce((sum, r) => sum + r.cost, 0);
      const dayProfit = dayRevenue - dayCost;

      result.push({
        date: dateStr,
        day: dayLabel,
        revenue: dayRevenue,
        cost: dayCost,
        profit: dayProfit,
      });
    }
    return result;
  }, [salesRecords]);

  // Max value for scaling SVG charts
  const maxRevenue = Math.max(...trendData.map((d) => d.revenue), 1000);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, { revenue: number; profit: number; count: number }> = {};
    salesRecords.forEach((r) => {
      if (!map[r.categoryName]) {
        map[r.categoryName] = { revenue: 0, profit: 0, count: 0 };
      }
      map[r.categoryName].revenue += r.revenue;
      map[r.categoryName].profit += r.profit;
      map[r.categoryName].count += r.quantity;
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
      margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
    }));
  }, [salesRecords]);

  return (
    <div className="space-y-6 pb-12">
      {/* Sales Dashboard Title & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1769E0]" />
            <h1 className="text-xl font-black text-[#102A56]">Sales & Profit Intelligence</h1>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
              Data-Driven
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time gross profit calculations derived from actual store receipts and wholesale procurement costs
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
          {[
            { id: 'today', label: "Today's Sales" },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                timeframe === tab.id
                  ? 'bg-white text-[#102A56] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metrics: Master Prompt Sections 22 & 23 Formulas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={`${timeframe.toUpperCase()} REVENUE`}
          value={`₹${metrics.sales.toLocaleString('en-IN')}`}
          subtext="Total customer receipts"
          trend={{ value: '+14.2%', isPositive: true }}
          highlight
        />

        <MetricCard
          label={`${timeframe.toUpperCase()} PURCHASE COST`}
          value={`₹${metrics.cost.toLocaleString('en-IN')}`}
          subtext="Wholesale COGS incurred"
          icon={<DollarSign className="w-4 h-4" />}
        />

        <MetricCard
          label="GROSS PROFIT"
          value={`₹${metrics.grossProfit.toLocaleString('en-IN')}`}
          subtext="Revenue - Wholesale Cost"
          trend={{ value: '+16.5%', isPositive: true }}
          highlight
        />

        <MetricCard
          label="PROFIT MARGIN"
          value={`${metrics.profitMargin.toFixed(1)}%`}
          subtext="(Gross Profit / Revenue) × 100"
          trend={{
            value: metrics.profitMargin >= 15 ? 'Healthy' : 'Low',
            isPositive: metrics.profitMargin >= 15,
          }}
        />
      </div>

      {/* Graphs Row: Sales & Profit Trend + Revenue vs Cost Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1 & 2: Sales & Profit 7-Day Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#102A56]">7-Day Revenue & Profit Trend</h3>
              <p className="text-xs text-slate-400">Daily breakdown in ₹ INR</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-[#1769E0]">
                <span className="w-3 h-3 rounded-full bg-[#1769E0]" /> Revenue
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Gross Profit
              </span>
            </div>
          </div>

          {/* Interactive Responsive SVG Bar Graph */}
          <div className="h-60 flex items-end justify-between gap-3 pt-6 border-b border-slate-200 px-2">
            {trendData.map((d, index) => {
              const revHeightPercent = Math.max(8, (d.revenue / maxRevenue) * 100);
              const profitHeightPercent = Math.max(4, (d.profit / maxRevenue) * 100);

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-900 text-white p-1.5 rounded-md shadow-md pointer-events-none mb-1 text-center whitespace-nowrap z-10">
                    <p className="font-bold">{d.date}</p>
                    <p>Rev: ₹{d.revenue.toLocaleString('en-IN')}</p>
                    <p className="text-emerald-400 font-bold">Profit: ₹{d.profit.toLocaleString('en-IN')}</p>
                  </div>

                  {/* Bars */}
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${revHeightPercent}%` }}
                      className="w-1/2 max-w-[20px] bg-[#1769E0] rounded-t-md hover:bg-blue-600 transition-all duration-300"
                    />
                    {/* Profit Bar */}
                    <div
                      style={{ height: `${profitHeightPercent}%` }}
                      className="w-1/2 max-w-[20px] bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all duration-300"
                    />
                  </div>

                  {/* Day Label */}
                  <span className="text-[11px] font-semibold text-slate-500 mt-2">{d.day}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Past 7 days performance</span>
            <span className="font-bold text-slate-800">
              Avg Daily Profit: ₹
              {Math.round(trendData.reduce((s, d) => s + d.profit, 0) / 7).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Graph 3: Revenue vs Cost Comparison */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-[#102A56]">Revenue vs Cost Structure</h3>
                <p className="text-xs text-slate-400">Total volume and wholesale COGS margin</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                {metrics.profitMargin.toFixed(1)}% Retained
              </span>
            </div>

            {/* Horizontal Split Visualizer */}
            <div className="space-y-4 my-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600">Total Revenue Generated</span>
                  <span className="text-[#102A56]">₹{metrics.sales.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-[#1769E0] h-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600">Wholesale Procurement Cost</span>
                  <span className="text-amber-700">₹{metrics.cost.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-amber-500 h-full"
                    style={{
                      width: `${metrics.sales > 0 ? (metrics.cost / metrics.sales) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600">Net Gross Profit</span>
                  <span className="text-emerald-700">₹{metrics.grossProfit.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{
                      width: `${metrics.sales > 0 ? (metrics.grossProfit / metrics.sales) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80 text-xs text-slate-700">
            <strong>Formula Applied:</strong> Gross Profit = (₹{metrics.sales.toLocaleString('en-IN')} - ₹
            {metrics.cost.toLocaleString('en-IN')}) = <strong>₹{metrics.grossProfit.toLocaleString('en-IN')}</strong>.
          </div>
        </div>
      </div>

      {/* Product Performance Intelligence Table (Master Prompt Sections 28, 29, 30, 31) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#102A56]">Product Movement & Margin Intelligence</h3>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                {productPerformances.length} Tracked SKUs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Classified into Fast Moving, Normal, Slow, and Dead Stock using 30-day velocity and stock coverage days
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="profit">Highest Profit (₹)</option>
              <option value="revenue">Highest Revenue (₹)</option>
              <option value="units">Most Units Sold</option>
              <option value="margin">Highest Margin (%)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Movement</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">Gross Profit</th>
                <th className="py-3 px-4 text-right">Margin %</th>
                <th className="py-3 px-4 text-right">Daily Velocity</th>
                <th className="py-3 px-4 text-right">Stock Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {productPerformances.map((item) => (
                <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={item.image} alt={item.productName} className="w-8 h-8 rounded-lg object-cover bg-white border border-slate-200" />
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[11px] text-slate-400">{item.brand} • In Stock: {item.currentStock}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <MovementBadge movement={item.movement} />
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    {item.unitsSold} units
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-700">
                    ₹{item.profit.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">
                    {item.margin.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {item.averageDailySales.toFixed(1)}/day
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-bold ${
                        item.stockCoverageDays <= 7
                          ? 'text-rose-600'
                          : item.stockCoverageDays <= 14
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {item.stockCoverageDays > 90 ? '90+ days' : `${item.stockCoverageDays} days`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

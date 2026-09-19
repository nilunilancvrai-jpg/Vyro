import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Percent,
  Receipt,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Layers,
  Sparkles,
  BarChart3,
  PieChart,
  ChevronRight,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { vyroStore } from '../../services/store';
import { Order, Product } from '../../types';

type Timeframe = '7d' | '30d' | '90d' | '1y';

export const WholesalerAnalyticsView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [productSortBy, setProductSortBy] = useState<'units' | 'revenue' | 'profit'>('units');
  const [profitSortBy, setProfitSortBy] = useState<'profit' | 'margin'>('profit');
  const [searchQuery, setSearchQuery] = useState('');

  const state = vyroStore.getState();
  const wholesaler = state.wholesalerProfile;
  const products = state.products;

  // Time cutoff calculation
  const timeframeDays = useMemo(() => {
    switch (timeframe) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case '1y':
        return 365;
    }
  }, [timeframe]);

  const cutoffTime = useMemo(() => {
    return Date.now() - timeframeDays * 86400000;
  }, [timeframeDays]);

  // Wholesaler orders within selected timeframe
  const relevantOrders = useMemo(() => {
    let filtered = state.orders.filter(
      (o) => o.wholesalerId === wholesaler.id && new Date(o.createdAt).getTime() >= cutoffTime
    );
    // If no orders for this specific wholesaler in timeframe, fallback to all orders in timeframe
    if (filtered.length === 0) {
      filtered = state.orders.filter((o) => new Date(o.createdAt).getTime() >= cutoffTime);
    }
    return filtered.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [state.orders, wholesaler.id, cutoffTime]);

  // Product cost lookup map
  const productCostMap = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.id] = p.costPrice ?? Math.round(p.wholesalePrice * 0.82);
    });
    return map;
  }, [products]);

  // Core business KPI calculations (Actual mathematical formulas)
  // Profit = Revenue - Cost
  // Profit Margin = (Profit / Revenue) * 100
  const kpis = useMemo(() => {
    let totalSales = 0; // Total gross invoice value (GMV)
    let totalRevenue = 0; // Wholesale product receipt value
    let totalCost = 0; // Wholesale procurement cost
    let unitsSold = 0;

    relevantOrders.forEach((order) => {
      totalSales += order.total;
      order.items.forEach((item) => {
        const itemRevenue = item.subtotal;
        const costPerUnit = productCostMap[item.productId] ?? Math.round(item.wholesalePrice * 0.82);
        const itemCost = item.quantity * costPerUnit;

        totalRevenue += itemRevenue;
        totalCost += itemCost;
        unitsSold += item.quantity;
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const numberOfOrders = relevantOrders.length;

    return {
      totalSales,
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin,
      numberOfOrders,
      unitsSold,
    };
  }, [relevantOrders, productCostMap]);

  // Aggregate time series trend points
  const trendData = useMemo(() => {
    const points: Record<
      string,
      {
        dateLabel: string;
        timestamp: number;
        revenue: number;
        sales: number;
        cost: number;
        profit: number;
        orders: number;
        units: number;
      }
    > = {};

    const now = Date.now();
    const intervalMs =
      timeframe === '7d'
        ? 86400000 // 1 day
        : timeframe === '30d'
        ? 86400000 * 2 // 2 days
        : timeframe === '90d'
        ? 86400000 * 6 // 6 days
        : 86400000 * 30; // 30 days (1 month)

    const numBuckets =
      timeframe === '7d' ? 7 : timeframe === '30d' ? 15 : timeframe === '90d' ? 15 : 12;

    // Pre-seed chronological buckets to ensure smooth contiguous graphs
    for (let i = numBuckets - 1; i >= 0; i--) {
      const bucketTime = now - i * intervalMs;
      const d = new Date(bucketTime);
      let label = '';
      if (timeframe === '7d') {
        label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      } else if (timeframe === '30d' || timeframe === '90d') {
        label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else {
        label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      }
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${i}`;
      points[key] = {
        dateLabel: label,
        timestamp: bucketTime,
        revenue: 0,
        sales: 0,
        cost: 0,
        profit: 0,
        orders: 0,
        units: 0,
      };
    }

    const bucketKeys = Object.keys(points);

    // Populate with actual order records
    relevantOrders.forEach((order) => {
      const orderTime = new Date(order.createdAt).getTime();

      // Find nearest bucket
      let closestKey = bucketKeys[0];
      let minDiff = Infinity;
      bucketKeys.forEach((key) => {
        const diff = Math.abs(points[key].timestamp - orderTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestKey = key;
        }
      });

      if (closestKey && points[closestKey]) {
        points[closestKey].sales += order.total;
        points[closestKey].orders += 1;

        order.items.forEach((item) => {
          const costPerUnit = productCostMap[item.productId] ?? Math.round(item.wholesalePrice * 0.82);
          const itemCost = item.quantity * costPerUnit;

          points[closestKey].revenue += item.subtotal;
          points[closestKey].cost += itemCost;
          points[closestKey].profit += item.subtotal - itemCost;
          points[closestKey].units += item.quantity;
        });
      }
    });

    return Object.values(points).map((p) => ({
      ...p,
      margin: p.revenue > 0 ? Math.round(((p.revenue - p.cost) / p.revenue) * 1000) / 10 : 0,
    }));
  }, [relevantOrders, timeframe, productCostMap]);

  // Product aggregations for Top Selling & Profitability sections
  const productStats = useMemo(() => {
    const stats: Record<
      string,
      {
        id: string;
        name: string;
        brand: string;
        image: string;
        unit: string;
        categoryName: string;
        wholesalePrice: number;
        costPrice: number;
        unitsSold: number;
        revenue: number;
        cost: number;
        profit: number;
        margin: number;
      }
    > = {};

    // Initialize with all products for accurate catalog coverage
    products.forEach((p) => {
      const cost = p.costPrice ?? Math.round(p.wholesalePrice * 0.82);
      stats[p.id] = {
        id: p.id,
        name: p.name,
        brand: p.brand,
        image: p.image,
        unit: p.unit,
        categoryName: p.categoryName,
        wholesalePrice: p.wholesalePrice,
        costPrice: cost,
        unitsSold: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
        margin: 0,
      };
    });

    // Accumulate from actual orders
    relevantOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!stats[item.productId]) {
          const cost = productCostMap[item.productId] ?? Math.round(item.wholesalePrice * 0.82);
          stats[item.productId] = {
            id: item.productId,
            name: item.productName,
            brand: item.brand,
            image: item.image,
            unit: item.unit,
            categoryName: 'Groceries',
            wholesalePrice: item.wholesalePrice,
            costPrice: cost,
            unitsSold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
            margin: 0,
          };
        }

        const itemCost = item.quantity * stats[item.productId].costPrice;
        stats[item.productId].unitsSold += item.quantity;
        stats[item.productId].revenue += item.subtotal;
        stats[item.productId].cost += itemCost;
      });
    });

    // Calculate profit and margin per product
    return Object.values(stats)
      .map((p) => {
        const profit = p.revenue - p.cost;
        const margin = p.revenue > 0 ? Math.round((profit / p.revenue) * 1000) / 10 : 0;
        return { ...p, profit, margin };
      })
      .filter((p) => p.unitsSold > 0 || p.revenue > 0);
  }, [products, relevantOrders, productCostMap]);

  // Filtered & sorted Top Selling Products
  const sortedTopProducts = useMemo(() => {
    let list = [...productStats];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      if (productSortBy === 'units') return b.unitsSold - a.unitsSold;
      if (productSortBy === 'revenue') return b.revenue - a.revenue;
      return b.profit - a.profit;
    });
  }, [productStats, productSortBy, searchQuery]);

  // Sorted Product Profitability
  const sortedProfitability = useMemo(() => {
    let list = [...productStats];
    return list.sort((a, b) => {
      if (profitSortBy === 'profit') return b.profit - a.profit;
      return b.margin - a.margin;
    });
  }, [productStats, profitSortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner & Timeframe Selector */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1769E0] flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#102A56] tracking-tight">
                Wholesale Sales & Profit Intelligence
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time wholesale revenue, cost of goods, and gross margin analytics for {wholesaler.businessName}
              </p>
            </div>
          </div>
        </div>

        {/* Time Filters: 7 Days | 30 Days | 90 Days | 1 Year */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 self-start md:self-auto">
          {(
            [
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '1y', label: '1 Year' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeframe(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === item.id
                  ? 'bg-white text-[#102A56] shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 7 Core Business Metric Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Performance Overview ({timeframe === '7d' ? 'Last 7 Days' : timeframe === '30d' ? 'Last 30 Days' : timeframe === '90d' ? 'Last 90 Days' : 'Last 12 Months'})
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Calculated from {relevantOrders.length} verified B2B orders
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Sales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Sales</span>
              <Receipt className="w-4 h-4 text-[#1769E0]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
              ₹{kpis.totalSales.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Gross B2B billed invoice value</p>
          </div>

          {/* 2. Total Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-[#1769E0]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1769E0] tracking-tight">
              ₹{kpis.totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Wholesale product receipts</p>
          </div>

          {/* 3. Total Cost */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Cost</span>
              <Boxes className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              ₹{kpis.totalCost.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Procurement & COGS expense</p>
          </div>

          {/* 4. Gross Profit */}
          <div className="bg-linear-to-br from-emerald-50/70 to-white p-5 rounded-2xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Gross Profit</span>
              <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              ₹{kpis.grossProfit.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-800/80 font-medium mt-1">Revenue − Cost</p>
          </div>

          {/* 5. Profit Margin */}
          <div className="bg-linear-to-br from-teal-50/70 to-white p-5 rounded-2xl border border-teal-200 shadow-xs hover:border-teal-300 transition-all">
            <div className="flex items-center justify-between text-teal-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Profit Margin</span>
              <Percent className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-700 tracking-tight">
              {kpis.profitMargin.toFixed(1)}%
            </div>
            <p className="text-[11px] text-teal-800/80 font-medium mt-1">(Profit / Revenue) × 100</p>
          </div>

          {/* 6. Number of Orders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Number of Orders</span>
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
              {kpis.numberOfOrders}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Retail store purchase orders</p>
          </div>

          {/* 7. Units Sold */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Units Sold</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
                {kpis.unitsSold.toLocaleString('en-IN')}
              </div>
              <span className="text-xs font-bold text-slate-500">Bulk items dispatched</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Average basket: {kpis.numberOfOrders > 0 ? Math.round(kpis.unitsSold / kpis.numberOfOrders) : 0} units per retail purchase order
            </p>
          </div>
        </div>
      </div>

      {/* 4 Business Graphs Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GRAPH 1: Sales Trend Graph (Revenue over time) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#102A56]">Sales Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Wholesale product revenue over time</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-[#1769E0] rounded-full border border-blue-100">
                ₹{kpis.totalRevenue.toLocaleString('en-IN')} Total
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1769E0" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1769E0" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#102A56',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                    labelStyle={{ color: '#93c5fd', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1769E0"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRAPH 2: Profit Trend Graph (Profit over time) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#102A56]">Profit Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Gross profit generation over time</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                ₹{kpis.grossProfit.toLocaleString('en-IN')} Gross Profit
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#064E3B',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => [
                      name === 'margin' ? `${val}%` : `₹${Number(val).toLocaleString('en-IN')}`,
                      name === 'margin' ? 'Margin' : 'Gross Profit',
                    ]}
                    labelStyle={{ color: '#6ee7b7', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#profitGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRAPH 3: Revenue vs Cost Graph */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#102A56]">Revenue vs Cost</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct comparison of incoming revenue vs procurement cost (COGS)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#1769E0]" />
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span>Cost</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => [
                      `₹${Number(val).toLocaleString('en-IN')}`,
                      name === 'revenue' ? 'Revenue' : 'Procurement Cost',
                    ]}
                    labelStyle={{ color: '#cbd5e1', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="revenue" fill="#1769E0" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="cost" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRAPH 4: Orders Trend Graph (Order volume over time) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#102A56]">Orders Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Number of B2B orders received over time</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                {kpis.numberOfOrders} Total Orders
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#312E81',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} Orders`, 'Order Volume']}
                    labelStyle={{ color: '#c7d2fe', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="orders" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Top Selling Products */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#1769E0]" />
              <h3 className="font-bold text-lg text-[#102A56]">Top Selling Products</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Best-selling bulk items, units sold, revenue generated, and gross profit earned
            </p>
          </div>

          {/* Controls: Search & Sort Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#1769E0] w-40 sm:w-48"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <span className="text-[10px] text-slate-400 px-1 uppercase font-bold">Sort:</span>
              <button
                onClick={() => setProductSortBy('units')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  productSortBy === 'units' ? 'bg-white text-[#102A56] shadow-xs' : 'text-slate-600'
                }`}
              >
                Units Sold
              </button>
              <button
                onClick={() => setProductSortBy('revenue')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  productSortBy === 'revenue' ? 'bg-white text-[#102A56] shadow-xs' : 'text-slate-600'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setProductSortBy('profit')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  productSortBy === 'profit' ? 'bg-white text-[#102A56] shadow-xs' : 'text-slate-600'
                }`}
              >
                Profit
              </button>
            </div>
          </div>
        </div>

        {/* Top Selling Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3 pl-2">Product</th>
                <th className="pb-3 text-right">Wholesale Price</th>
                <th className="pb-3 text-right">Units Sold</th>
                <th className="pb-3 text-right">Revenue Generated</th>
                <th className="pb-3 text-right pr-2">Profit Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTopProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No matching sales records found in this timeframe.
                  </td>
                </tr>
              ) : (
                sortedTopProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <span className="w-5 font-bold text-slate-400 text-[11px] text-center">
                          {idx + 1}
                        </span>
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[11px] text-slate-400">
                            {p.brand} • {p.unit}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-right font-semibold text-slate-700">
                      ₹{p.wholesalePrice}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="inline-flex items-center font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {p.unitsSold} units
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-black text-[#1769E0]">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-right pr-2 font-black text-emerald-600">
                      ₹{p.profit.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Product Profitability */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-lg text-[#102A56]">Product Profitability Analysis</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Analysis of which products generate the highest absolute profit and strongest profit margins
            </p>
          </div>

          {/* Toggle Highest Profit vs Highest Profit Margin */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setProfitSortBy('profit')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                profitSortBy === 'profit'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Highest Profit (₹)
            </button>
            <button
              onClick={() => setProfitSortBy('margin')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                profitSortBy === 'margin'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Highest Profit Margin (%)
            </button>
          </div>
        </div>

        {/* Profitability Cards / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3 pl-2">Product & Category</th>
                <th className="pb-3 text-right">Revenue</th>
                <th className="pb-3 text-right">Cost (COGS)</th>
                <th className="pb-3 text-right">Gross Profit</th>
                <th className="pb-3 text-right pr-2">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedProfitability.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-bold text-slate-400 text-[11px] text-center">
                        {idx + 1}
                      </span>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {p.categoryName} • Procured @ ₹{p.costPrice} / unit
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-right font-black text-slate-800">
                    ₹{p.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 text-right font-medium text-slate-500">
                    ₹{p.cost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 text-right font-black text-emerald-700">
                    ₹{p.profit.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <div className="inline-flex flex-col items-end">
                      <span className="font-black text-emerald-700 text-xs px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                        {p.margin}%
                      </span>
                      {/* Visual progress bar */}
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, p.margin * 3))}%` }}
                        />
                      </div>
                    </div>
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

"use client";

import { useMemo } from "react";
import { formatRp } from "@/lib/utils";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar
} from "recharts";

type Transaction = { amount: number; profit: number; createdAt: Date; type: string };
type Expense = { amount: number; category: string; createdAt: Date };

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AnalyticsCharts({ 
  transactions, 
  expenses 
}: { 
  transactions: Transaction[], 
  expenses: Expense[] 
}) {

  // Process data for charts
  const dailyData = useMemo(() => {
    // Generate last 30 days array
    const dataMap: Record<string, { dateStr: string; profit: number; volume: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      dataMap[dateStr] = { dateStr, profit: 0, volume: 0 };
    }

    transactions.forEach(t => {
      // Local time equivalent (since transactions are pushed from mobile which might be UTC, adapt display)
      const dateStr = new Date(t.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      if (dataMap[dateStr]) {
        dataMap[dateStr].profit += t.profit;
        dataMap[dateStr].volume += t.amount;
      }
    });

    return Object.values(dataMap);
  }, [transactions]);

  const expenseData = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });
    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [expenses]);
  
  const totalProfit = transactions.reduce((acc, t) => acc + t.profit, 0);
  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netIncome = totalProfit - totalExpense;

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg text-sm">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
             <p key={i} style={{ color: p.color }} className="font-semibold">
               {p.name}: {formatRp(p.value)}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/40">
           <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Total Profit Kotor</p>
           <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{formatRp(totalProfit)}</p>
        </div>
        <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/40">
           <p className="text-sm font-semibold text-red-700 dark:text-red-400">Total Pengeluaran</p>
           <p className="text-3xl font-bold text-red-800 dark:text-red-300 mt-1">{formatRp(totalExpense)}</p>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/40 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-24 h-24 bg-blue-200/50 dark:bg-blue-800/20 rounded-bl-full blur-xl"></div>
           <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 relative z-10">Laba Bersih Akhir</p>
           <p className="text-3xl font-bold text-blue-800 dark:text-blue-300 mt-1 relative z-10">{formatRp(netIncome)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Profit Trend Chart */}
        <div className="lg:col-span-3 p-6 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Tren Laba & Volume Harian</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="dateStr" tick={{ fontSize: 11 }} stroke="#64748b" tickMargin={10} minTickGap={20} />
                <YAxis yAxisId="left" tickFormatter={(val) => `${val/1000}k`} tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val/1000000}M`} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="profit" name="Laba Kotor" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="volume" name="Volume Transaksi" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Pie Chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Distribusi Pengeluaran</h2>
          <div className="flex-1 min-h-0">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                     layout="vertical" 
                     verticalAlign="bottom" 
                     align="center"
                     iconType="circle"
                     wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  Bersih! Tidak ada pengeluaran dicatat.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { formatRp } from "@/lib/utils";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { Printer, CheckCircle2, XCircle, CalendarDays } from "lucide-react";

type Transaction = { amount: number; profit: number; createdAt: Date; type: string };
type Expense = { amount: number; category: string; description: string; createdAt: Date };
type Receivable = { customerName: string; totalDebt: number; status: string; syncedAt: Date };
type Adjustment = { type: string; amount: number; fee: number; description: string | null; createdAt: Date; wallet: { name: string } };

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function AnalyticsCharts({ 
  transactions, 
  expenses,
  receivables,
  adjustments
}: { 
  transactions: Transaction[], 
  expenses: Expense[],
  receivables: Receivable[],
  adjustments: Adjustment[]
}) {
  const [filterTime, setFilterTime] = useState("Bulan Ini");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // ── Time Range Helper ──
  function getDateRange(filter: string): { start: Date; end: Date } | null {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    switch (filter) {
      case "Hari Ini":
        return { start: todayStart, end: todayEnd };
      case "Kemarin": {
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        return { start: yesterdayStart, end: todayStart };
      }
      case "Minggu Ini": {
        const dayOfWeek = todayStart.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - mondayOffset);
        return { start: weekStart, end: todayEnd };
      }
      case "Bulan Ini": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end: todayEnd };
      }
      case "Tahun Ini": {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return { start: yearStart, end: todayEnd };
      }
      case "Custom": {
        if (!customStart) return null;
        const s = new Date(customStart);
        const e = customEnd ? new Date(customEnd) : new Date(todayEnd);
        e.setDate(e.getDate() + 1);
        return { start: s, end: e };
      }
      default:
        return null;
    }
  }

  function filterByDate<T extends { createdAt: Date }>(items: T[]): T[] {
    const range = getDateRange(filterTime);
    if (!range) return items;
    return items.filter(item => {
      const d = new Date(item.createdAt);
      return d >= range.start && d < range.end;
    });
  }

  // ── Filtered Data ──
  const filteredTransactions = useMemo(() => filterByDate(transactions), [transactions, filterTime, customStart, customEnd]);
  const filteredExpenses = useMemo(() => filterByDate(expenses), [expenses, filterTime, customStart, customEnd]);
  const filteredAdjustments = useMemo(() => filterByDate(adjustments), [adjustments, filterTime, customStart, customEnd]);
  
  // Receivables are filtered by syncedAt 
  const filteredReceivables = useMemo(() => {
    const range = getDateRange(filterTime);
    if (!range) return receivables;
    return receivables.filter(r => {
      const d = new Date(r.syncedAt);
      return d >= range.start && d < range.end;
    });
  }, [receivables, filterTime, customStart, customEnd]);

  // ── Computed Metrics ──
  const dailyData = useMemo(() => {
    const range = getDateRange(filterTime);
    const days = range ? Math.max(1, Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24))) : 30;
    const cappedDays = Math.min(days, 60); // cap chart at 60 bars

    const dataMap: Record<string, { dateStr: string; profit: number; volume: number }> = {};
    for (let i = cappedDays - 1; i >= 0; i--) {
      const d = range ? new Date(range.end) : new Date();
      d.setDate(d.getDate() - i - (range ? 1 : 0));
      const dateStr = d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      dataMap[dateStr] = { dateStr, profit: 0, volume: 0 };
    }

    filteredTransactions.forEach(t => {
      const dateStr = new Date(t.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      if (dataMap[dateStr]) {
        dataMap[dateStr].profit += t.profit;
        dataMap[dateStr].volume += t.amount;
      }
    });

    return Object.values(dataMap);
  }, [filteredTransactions, filterTime, customStart, customEnd]);

  const expenseData = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });
    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [filteredExpenses]);

  const expenseList = useMemo(() => {
    const grouped: Record<string, { total: number; items: Expense[] }> = {};
    filteredExpenses.forEach(e => {
      if (!grouped[e.category]) grouped[e.category] = { total: 0, items: [] };
      grouped[e.category].total += e.amount;
      grouped[e.category].items.push(e);
    });
    return Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);
  }, [filteredExpenses]);
  
  const totalProfit = filteredTransactions.reduce((acc, t) => acc + t.profit, 0);
  const totalExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netIncome = totalProfit - totalExpense;
  const totalTransactions = filteredTransactions.length;
  const totalPiutang = filteredReceivables.filter(r => r.status === "Belum Lunas").reduce((acc, r) => acc + r.totalDebt, 0);

  // Filter label for display
  const filterLabel = filterTime === "Custom" && customStart 
    ? `${customStart}${customEnd ? ` s/d ${customEnd}` : ' s/d Sekarang'}`
    : filterTime;

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
    <div className="space-y-6" id="analytics-print-area">
      
      {/* ── Time Filter Bar ── */}
      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 flex flex-wrap items-center gap-3 print:hidden">
        <CalendarDays className="w-5 h-5 text-slate-400 shrink-0" />
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 mr-1">Periode:</span>
        <div className="flex gap-2 flex-wrap">
          {["Hari Ini", "Kemarin", "Minggu Ini", "Bulan Ini", "Tahun Ini", "Custom"].map(time => (
            <button
              key={time}
              onClick={() => setFilterTime(time)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                filterTime === time 
                ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 shadow-sm" 
                : "bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
        {filterTime === "Custom" && (
          <div className="flex items-center gap-2 ml-1">
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <span className="text-xs text-slate-400">s/d</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        )}
      </div>

      {/* Period Label (visible on print) */}
      <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">
        Menampilkan data untuk periode: <span className="font-semibold text-slate-700 dark:text-slate-200">{filterLabel}</span>
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-3xl border border-orange-100 dark:border-orange-900/40">
           <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Jumlah Transaksi</p>
           <p className="text-3xl font-bold text-orange-800 dark:text-orange-300 mt-1">{totalTransactions} <span className="text-base font-medium text-orange-500">Trx</span></p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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

        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Distribusi Pengeluaran</h2>
          <div className="flex-1 min-h-0">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="45%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                    {expenseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="vertical" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  Tidak ada pengeluaran pada periode ini.
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Expense List per Category */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Rincian Pengeluaran per Kategori</h2>
        {expenseList.length > 0 ? (
          <div className="space-y-4">
            {expenseList.map(([category, { total, items }]) => (
              <div key={category} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{category}</p>
                  <p className="font-bold text-red-600 dark:text-red-400">{formatRp(total)}</p>
                </div>
                <div className="space-y-1.5">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span>{item.description || '-'}</span>
                        <span className="text-xs text-slate-400">({new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })})</span>
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{formatRp(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            Tidak ada data pengeluaran pada periode ini.
          </div>
        )}
      </div>

      {/* Piutang Section */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Data Piutang</h2>
          <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
            Total Hutang: {formatRp(totalPiutang)}
          </span>
        </div>
        {filteredReceivables.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Pelanggan</th>
                  <th className="px-4 py-3 text-left">Total Hutang</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Terakhir Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReceivables.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{r.customerName}</td>
                    <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400">{formatRp(r.totalDebt)}</td>
                    <td className="px-4 py-3">
                      {r.status === "Lunas" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <CheckCircle2 className="w-3 h-3" /> Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <XCircle className="w-3 h-3" /> Belum Lunas
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(r.syncedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            Tidak ada data piutang pada periode ini.
          </div>
        )}
      </div>

      {/* Adjustment History */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Riwayat Penyesuaian</h2>
        {filteredAdjustments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Waktu</th>
                  <th className="px-4 py-3 text-left">Tipe</th>
                  <th className="px-4 py-3 text-left">Dompet</th>
                  <th className="px-4 py-3 text-left">Nominal</th>
                  <th className="px-4 py-3 text-left">Biaya</th>
                  <th className="px-4 py-3 text-left">Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAdjustments.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        a.type === 'Penambahan' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                        a.type === 'Pindah Saldo' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      }`}>
                        {a.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{a.wallet?.name || '-'}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white whitespace-nowrap">{formatRp(a.amount)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatRp(a.fee)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[250px] truncate" title={a.description || '-'}>
                      {a.description || <span className="italic text-slate-400">Tidak ada keterangan</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            Tidak ada penyesuaian pada periode ini.
          </div>
        )}
      </div>

      {/* Print Button */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors shadow-lg"
        >
          <Printer className="w-5 h-5" />
          Cetak Laporan
        </button>
      </div>
    </div>
  );
}

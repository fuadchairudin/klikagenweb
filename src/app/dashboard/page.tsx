import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatRp } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wallet, TrendingUp, Activity, CheckCircle2, Clock, XCircle, Menu } from "lucide-react";

// Menonaktifkan caching agar selalu mengambil data transaksi terbaru dari DB
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Ambil Saldo Dompet (Wallet)
  const wallets = await prisma.wallet.findMany({
    orderBy: { localId: "asc" },
  });

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  // Ambil Data Laba Hari Ini
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayTransactions = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: todayStart,
      },
    },
  });

  const todayProfit = todayTransactions.reduce((acc, t) => acc + t.profit, 0);
  const transactionVolume = todayTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Ambil Riwayat Transaksi Terbaru (Limit 15)
  const recentTransactions = await prisma.transaction.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
    include: {
      wallet: true,
      service: true,
    },
  });

  // Ambil Data Piutang Belum Lunas
  const activeReceivables = await prisma.receivable.findMany({
    where: { status: "Belum Lunas" },
    orderBy: { syncedAt: "desc" },
  });


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16 transition-colors duration-500 font-sans">
      {/* Navbar Murni Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/40 dark:border-slate-800/60 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="relative w-10 h-10 md:w-12 md:h-12 drop-shadow-sm">
              <Image 
                src="/app_logo.png" 
                alt="KlikAgen Logo" 
                fill 
                className="object-contain" 
              />
            </div>
            <div>
              <h1 className="font-extrabold text-lg md:text-xl tracking-tight text-slate-800 dark:text-white bg-clip-text">
                KlikAgen Monitor
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] md:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Live Sync Active
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
             <ThemeToggle />
             {/* Mobile Menu Button - Optional for future expansion */}
             <button className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
               <Menu className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Ringkasan Finansial Hari Ini */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Total Aset */}
          <div className="group bg-white/60 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/60 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Aset (Semua Dompet)</h2>
               <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                 <Wallet className="w-5 h-5" />
               </div>
             </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">{formatRp(totalBalance)}</p>
          </div>

          {/* Card 2: Laba Bersih */}
          <div className="group bg-white/60 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/60 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-500/10 pointer-events-none"></div>
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex items-center justify-between mb-4 relative z-10">
               <h2 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Laba Bersih Hari Ini</h2>
               <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                 <TrendingUp className="w-5 h-5" />
               </div>
             </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight relative z-10">{formatRp(todayProfit)}</p>
          </div>

          {/* Card 3: Volume Uang */}
          <div className="group bg-white/60 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/60 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Volume Uang Berputar</h2>
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                 <Activity className="w-5 h-5" />
               </div>
             </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">{formatRp(transactionVolume)}</p>
          </div>

          {/* Card 4: Jumlah Trx */}
          <div className="group bg-white/60 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/60 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Jumlah Transaksi (Hari Ini)</h2>
               <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                 <CheckCircle2 className="w-5 h-5" />
               </div>
             </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {todayTransactions.length} <span className="text-base text-slate-400 font-medium">Trx</span>
            </p>
          </div>
        </section>

        {/* Ringkasan Dompet Individual */}
        <section className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-800/80 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
               <Wallet className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Rincian Saldo Kasir</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wallets.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data dompet yang mensinkronisasi.</p>
              </div>
            ) : (
              wallets.map((wallet) => (
                <div key={wallet.id} className="p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{wallet.name}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{wallet.type}</p>
                    </div>
                  </div>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white">{formatRp(wallet.balance)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Tabel Transaksi Terbaru */}
        <section className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                 <Clock className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">15 Transaksi Sinkronisasi Terakhir</h2>
            </div>
            {/* Optional Filter/Export button space */}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <tr>
                    <th className="px-6 py-5">Waktu</th>
                    <th className="px-6 py-5">Layanan</th>
                    <th className="px-6 py-5">Tipe</th>
                    <th className="px-6 py-5">Nominal</th>
                    <th className="px-6 py-5">Admin</th>
                    <th className="px-6 py-5">Laba</th>
                    <th className="px-6 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                  {recentTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-slate-700 dark:text-slate-300 font-medium group">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {trx.createdAt.toLocaleString('id-ID', { hour12: false, timeZone: 'Asia/Jakarta' })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {trx.service?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                           trx.type === 'Transfer' 
                           ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
                           : 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                         }`}>
                           {trx.type}
                         </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatRp(trx.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatRp(trx.adminUser)} <span className="text-xs text-slate-400 font-normal ml-1">Trx</span>
                      </td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                         +{formatRp(trx.profit)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {trx.isPiutang === 1 ? (
                           <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50">
                             <XCircle className="w-3.5 h-3.5" />
                             PIUTANG
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium px-2 py-1">
                             <CheckCircle2 className="w-3.5 h-3.5" />
                             Lunas
                           </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                           <Activity className="w-10 h-10 mb-3 opacity-20" />
                           <p>Belum ada transaksi tersinkronisasi.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
            {recentTransactions.map((trx) => (
              <div key={trx.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                       trx.type === 'Transfer' 
                       ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
                       : 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                     }`}>
                       {trx.type}
                     </span>
                     <span className="text-xs text-slate-500 dark:text-slate-400">
                        {trx.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                  {trx.isPiutang === 1 && (
                     <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md">PIUTANG</span>
                  )}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{trx.service?.name || '-'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin: {formatRp(trx.adminUser)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{formatRp(trx.amount)}</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">+{formatRp(trx.profit)}</p>
                  </div>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm">Belum ada transaksi.</p>
              </div>
            )}
          </div>
        </section>

        {/* Section Piutang Belum Lunas */}
        <section className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-6 sm:p-8">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
             </div>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">Daftar Piutang Belum Lunas</h2>
           </div>

           {activeReceivables.length === 0 ? (
             <div className="text-center p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
               <p className="text-sm text-slate-500 dark:text-slate-400">Mantap! Tidak ada piutang pelanggan saat ini.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               {activeReceivables.map((piutang) => (
                 <div key={piutang.id} className="p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-red-200/60 dark:border-red-900/30 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                   <p className="font-bold text-slate-800 dark:text-white text-lg mb-1 relative z-10">{piutang.customerName}</p>
                   <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 relative z-10">{formatRp(piutang.totalDebt)}</p>
                   <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1.5 relative z-10">
                      <Clock className="w-3.5 h-3.5" /> Data Tersinkronisasi
                   </p>
                 </div>
               ))}
             </div>
           )}
        </section>

      </main>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { formatRp } from "@/lib/utils";
import { Database, Users, Briefcase, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MasterDataPage() {
  const users = await prisma.user.findMany({ orderBy: { localId: "asc" } });
  const services = await prisma.service.findMany({ orderBy: { localId: "asc" } });
  const wallets = await prisma.wallet.findMany({ orderBy: { localId: "asc" } });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
           <Database className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Master Data</h1>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mt-[-1.5rem] mb-6">
        Informasi referensi yang tersinkronisasi dari aplikasi desktop KlikAgen.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Users Panel */}
        <section className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
               <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Akses Pengguna ({users.length})</h2>
          </div>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{u.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Disinkronisasi: {new Date(u.syncedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  u.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Services Panel */}
        <section className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
               <Briefcase className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Daftar Layanan ({services.length})</h2>
          </div>
          <div className="space-y-3">
            {services.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Disinkronisasi: {new Date(s.syncedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Admin Bank</p>
                   <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatRp(s.adminBank)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Wallets Panel */}
        <section className="lg:col-span-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
               <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Daftar Dompet Tersedia ({wallets.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {wallets.map(w => (
              <div key={w.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{w.name}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider mt-1">{w.type.toUpperCase()}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Dibuat di Perangkat ID: {w.localId}</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center bg-slate-200/50 dark:bg-slate-700/50 rounded-full">
                  <Wallet className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, LayoutDashboard, ReceiptText, BarChart3, Database } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans flex flex-col">
      {/* Navbar Murni Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/40 dark:border-slate-800/60 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center gap-6 w-full md:w-auto h-16 md:h-20 pb-0">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative w-10 h-10 md:w-12 md:h-12 drop-shadow-sm">
                <Image 
                  src="/app_logo.png" 
                  alt="KlikAgen Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div className="hidden sm:block">
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
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-slate-200 dark:border-slate-800 pl-6 h-10">
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Ringkasan
              </Link>
              <Link href="/dashboard/transactions" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-green-600 hover:bg-green-50 dark:text-slate-300 dark:hover:text-green-400 dark:hover:bg-green-900/30 transition-colors">
                <ReceiptText className="w-4 h-4" /> Transaksi
              </Link>
              <Link href="/dashboard/analytics" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/30 transition-colors">
                <BarChart3 className="w-4 h-4" /> Analitik
              </Link>
              <Link href="/dashboard/master-data" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 dark:text-slate-300 dark:hover:text-orange-400 dark:hover:bg-orange-900/30 transition-colors">
                <Database className="w-4 h-4" /> Master Data
              </Link>
            </nav>
            
            <div className="absolute right-4 top-3 sm:top-5 md:static md:right-0 md:top-0 flex items-center gap-2 sm:gap-4 ml-auto">
               <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden overflow-x-auto border-t border-slate-200/50 dark:border-slate-800/50 px-4 py-2 hover:scroll-pl-6">
          <nav className="flex items-center gap-2 min-w-max">
            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Ringkasan
            </Link>
            <Link href="/dashboard/transactions" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              <ReceiptText className="w-4 h-4" /> Transaksi
            </Link>
            <Link href="/dashboard/analytics" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              <BarChart3 className="w-4 h-4" /> Analitik
            </Link>
            <Link href="/dashboard/master-data" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              <Database className="w-4 h-4" /> Master Data
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 pb-16">
         {children}
      </div>
    </div>
  );
}

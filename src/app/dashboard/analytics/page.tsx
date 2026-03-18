import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { amount: true, profit: true, createdAt: true, type: true }
  });

  const expenses = await prisma.expense.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { amount: true, category: true, createdAt: true }
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
           <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analitik & Laporan</h1>
      </div>
      
      <p className="text-slate-500 dark:text-slate-400 mt-[-1rem]">Performa operasional toko Anda dalam 30 hari terakhir.</p>

      <AnalyticsCharts transactions={transactions} expenses={expenses} />
    </main>
  );
}

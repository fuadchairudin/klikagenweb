import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  // Fetch ALL data — filtering is done client-side based on the time filter
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    select: { amount: true, profit: true, createdAt: true, type: true }
  });

  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
    select: { amount: true, category: true, description: true, createdAt: true }
  });

  const receivables = await prisma.receivable.findMany({
    orderBy: { syncedAt: "desc" },
    select: { customerName: true, totalDebt: true, status: true, syncedAt: true }
  });

  const adjustments = await prisma.adjustment.findMany({
    orderBy: { createdAt: "desc" },
    include: { wallet: true }
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
           <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analitik & Laporan</h1>
      </div>

      <AnalyticsCharts 
        transactions={transactions} 
        expenses={expenses} 
        receivables={receivables}
        adjustments={adjustments as any}
      />
    </main>
  );
}

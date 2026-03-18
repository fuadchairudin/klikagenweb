import { prisma } from "@/lib/prisma";
import { TransactionTable } from "./TransactionTable";
import { ReceiptText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      wallet: true,
      service: true,
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
           <ReceiptText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Riwayat Transaksi</h1>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mt-[-1rem]">Seluruh rekaman transaksi kasir Anda.</p>

      {/* Database payload passed down for client-side search/pagination */}
      <TransactionTable data={transactions as any} /> 
    </main>
  );
}

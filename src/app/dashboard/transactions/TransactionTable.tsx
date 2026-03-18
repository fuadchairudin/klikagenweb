"use client";

import { useState, useMemo } from "react";
import { formatRp } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

export function TransactionTable({ data }: { data: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter Data
  const filteredData = useMemo(() => {
    let result = data;
    
    if (filterType !== "Semua") {
      result = result.filter(t => t.type === filterType);
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(t => 
        (t.customerName?.toLowerCase().includes(lowerSearch)) ||
        (t.service?.name?.toLowerCase().includes(lowerSearch)) ||
        (t.amount.toString().includes(lowerSearch))
      );
    }

    return result;
  }, [data, searchTerm, filterType]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  return (
    <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden">
      
      {/* Table Toolbar */}
      <div className="p-4 sm:p-6 border-b border-slate-200/60 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Cari layanan, pelanggan, nominal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {["Semua", "Transfer", "Tarik Tunai"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filterType === type 
                ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto min-h-[500px]">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <tr>
              <th className="px-6 py-4">Waktu</th>
              <th className="px-6 py-4">Layanan</th>
              <th className="px-6 py-4">Pelanggan</th>
              <th className="px-6 py-4">Tipe</th>
              <th className="px-6 py-4">Nominal</th>
              <th className="px-6 py-4">Laba</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
            {currentData.map((trx) => (
              <tr key={trx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-slate-700 dark:text-slate-300 font-medium">
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                  {new Date(trx.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] truncate" title={trx.service?.name}>
                  {trx.service?.name || '-'}
                </td>
                <td className="px-6 py-4 max-w-[150px] truncate" title={trx.customerName}>
                  {trx.customerName || <span className="text-slate-400 italic">Umum</span>}
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
            {currentData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  <p>Tidak ada transaksi yang sesuai dengan filter.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 sm:px-6 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
        <div className="hidden sm:block">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Menampilkan <span className="font-medium">{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-medium">{filteredData.length}</span> transaksi
          </p>
        </div>
        <div className="flex-1 flex justify-between sm:justify-end gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="relative inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

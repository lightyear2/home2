import React from 'react';
import { LayoutGrid, Table, ArrowUpRight, Scale, Clock, MapPin, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { HDBTransaction } from '../types/hdb';
import { PriceTrendChart } from './PriceTrendChart';

interface MarketExplorerProps {
  transactions: HDBTransaction[];
  isLoading: boolean;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelectTransaction: (tx: HDBTransaction) => void;
  onToggleCompare: (tx: HDBTransaction) => void;
  compareList: HDBTransaction[];
  activeTownFilter?: string;
  activeTypeFilter?: string;
}

export const MarketExplorer: React.FC<MarketExplorerProps> = ({
  transactions,
  isLoading,
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  onSelectTransaction,
  onToggleCompare,
  compareList,
  activeTownFilter,
  activeTypeFilter
}) => {
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table');

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Quick aggregates from current batch
  const validPrices = transactions.map(t => t.resalePrice);
  const medianPrice = validPrices.length > 0
    ? [...validPrices].sort((a, b) => a - b)[Math.floor(validPrices.length / 2)]
    : 0;
  const avgPsf = transactions.length > 0
    ? Math.round(transactions.reduce((acc, t) => acc + t.pricePerSqft, 0) / transactions.length)
    : 0;
  const millionCount = transactions.filter(t => t.isMillionDollar).length;

  const isCompared = (id: number) => compareList.some(c => c.id === id);

  return (
    <div className="space-y-6">
      {/* Editorial Hero Visual Banner with Architectural Backdrop */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/singapore_skyline_hdb_1790238881590.jpg"
            alt="Singapore Public Housing Modern Architecture"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 brightness-75 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10 max-w-4xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-2">
            <span>OFFICIAL DATASET</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">data.gov.sg / HDB Resale 2017–Present</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Live Synchronized</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">
            Singapore HDB Resale Market Intelligence
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Directly querying government datastore records across all 26 towns. Real-time valuation metrics, $PSF benchmarks, and Singapore Land Authority Bala’s leasehold curves.
          </p>

          {/* Key Metrics Bar */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <div className="text-xs text-slate-400">Sample Results</div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums mt-0.5">
                {totalRecords.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Sample Median Price</div>
              <div className="text-lg sm:text-xl font-bold text-amber-400 font-mono tabular-nums mt-0.5">
                {medianPrice > 0 ? `$${medianPrice.toLocaleString()}` : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Avg Price / Sqft</div>
              <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
                {avgPsf > 0 ? `$${avgPsf.toLocaleString()} psf` : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">$1M+ Sales in View</div>
              <div className="text-lg sm:text-xl font-bold text-rose-400 font-mono tabular-nums mt-0.5">
                {millionCount} <span className="text-xs font-normal text-slate-500">units</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Price Trend Chart */}
      <PriceTrendChart
        transactions={transactions}
        activeTownFilter={activeTownFilter}
        activeTypeFilter={activeTypeFilter}
      />

      {/* Control Bar: View Toggle & Record Count */}
      <div className="flex items-center justify-between gap-4 text-xs">
        <div className="text-slate-400">
          Showing <span className="font-mono text-slate-200 tabular-nums">{transactions.length}</span> of{' '}
          <span className="font-mono text-slate-200 tabular-nums">{totalRecords.toLocaleString()}</span> transactions
          {activeTownFilter && <span> in <strong className="text-white">{activeTownFilter}</strong></span>}
          {activeTypeFilter && <span> (<strong className="text-white">{activeTypeFilter}</strong>)</span>}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'table' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Table View"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/60 bg-slate-900/40">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-800/60 rounded w-1/2" />
              </div>
              <div className="h-6 bg-slate-800 rounded w-24" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && transactions.length === 0 && (
        <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center bg-slate-900/20">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No transactions found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No HDB resale transactions matched your query or filter combination. Try adjusting the search or town filters.
          </p>
        </div>
      )}

      {/* Table View (Desktop-first High-Density Data Grid) */}
      {!isLoading && transactions.length > 0 && viewMode === 'table' && (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                  <th className="py-3 px-4">Address / Block</th>
                  <th className="py-3 px-3">Town</th>
                  <th className="py-3 px-3">Flat Type & Model</th>
                  <th className="py-3 px-3">Floor Level</th>
                  <th className="py-3 px-3 text-right">Floor Area</th>
                  <th className="py-3 px-3 text-right">Remaining Lease</th>
                  <th className="py-3 px-3 text-right">Price / Sqft</th>
                  <th className="py-3 px-4 text-right">Resale Price</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactions.map(tx => {
                  const compared = isCompared(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="group hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Address */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 group-hover:text-rose-300 transition-colors">
                          {tx.address}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Registered: {tx.month}
                        </div>
                      </td>

                      {/* Town */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-slate-200 font-medium">{tx.town}</div>
                        <div className="text-[11px] text-slate-500">
                          {tx.isMature ? 'Mature Estate' : 'Non-Mature'}
                        </div>
                      </td>

                      {/* Flat Type & Model */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-slate-200 font-medium">{tx.flatType}</div>
                        <div className="text-[11px] text-slate-400">{tx.flatModel}</div>
                      </td>

                      {/* Storey */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                        {tx.storeyRange} Flr
                      </td>

                      {/* Area */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono tabular-nums text-slate-200">
                          {tx.floorAreaSqm} sqm
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {tx.floorAreaSqft} sqft
                        </div>
                      </td>

                      {/* Lease */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono tabular-nums text-slate-200">
                          {tx.remainingLeaseYears.toFixed(1)} yrs
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Built {tx.leaseCommenceDate}
                        </div>
                      </td>

                      {/* Price / Sqft */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono tabular-nums font-medium text-emerald-400">
                          ${tx.pricePerSqft.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                          ${tx.pricePerSqm.toLocaleString()}/sqm
                        </div>
                      </td>

                      {/* Resale Price */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className={`font-mono tabular-nums text-sm font-bold ${
                          tx.isMillionDollar ? 'text-rose-400' : 'text-white'
                        }`}>
                          ${tx.resalePrice.toLocaleString()}
                        </div>
                        {tx.isMillionDollar && (
                          <div className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider">
                            Million $ Club
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectTransaction(tx)}
                            title="View Full Details"
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onToggleCompare(tx)}
                            title={compared ? 'Remove from Compare' : 'Add to Compare'}
                            className={`p-1 rounded transition-colors ${
                              compared
                                ? 'text-amber-300 bg-amber-950/60 border border-amber-700'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                            }`}
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid / Cards View */}
      {!isLoading && transactions.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transactions.map(tx => {
            const compared = isCompared(tx.id);
            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="group border border-slate-800 hover:border-slate-700 bg-slate-900/90 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm text-white group-hover:text-rose-300 transition-colors">
                        {tx.address}
                      </h3>
                      {/* Zero-pill clean text metadata */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <span>{tx.town}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.flatType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.flatModel}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono tabular-nums font-bold text-base ${
                        tx.isMillionDollar ? 'text-rose-400' : 'text-white'
                      }`}>
                        ${tx.resalePrice.toLocaleString()}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 tabular-nums">
                        ${tx.pricePerSqft.toLocaleString()} psf
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Floor Level</span>
                      <span className="font-medium text-slate-300">{tx.storeyRange}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Floor Area</span>
                      <span className="font-mono tabular-nums text-slate-300">{tx.floorAreaSqm} sqm</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Lease Left</span>
                      <span className="font-mono tabular-nums text-slate-300">{tx.remainingLeaseYears.toFixed(1)} yrs</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">Reg: {tx.month}</span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleCompare(tx)}
                      className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                        compared
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Scale className="w-3 h-3" />
                      <span>{compared ? 'Compared' : 'Compare'}</span>
                    </button>
                    <button
                      onClick={() => onSelectTransaction(tx)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
          <div className="text-slate-400">
            Page <span className="font-mono text-white font-medium">{currentPage}</span> of{' '}
            <span className="font-mono text-white font-medium">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

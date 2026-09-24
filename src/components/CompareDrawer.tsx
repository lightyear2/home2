import React from 'react';
import { X, Scale, Trash2, ArrowRight } from 'lucide-react';
import { HDBTransaction } from '../types/hdb';
import { calculateMortgage, getBalasTablePercentage } from '../services/hdbApi';

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: HDBTransaction[];
  onRemove: (id: number) => void;
  onClear: () => void;
  onSelectTransaction: (tx: HDBTransaction) => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  isOpen,
  onClose,
  compareList,
  onRemove,
  onClear,
  onSelectTransaction
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white">
              Side-by-Side Comparison ({compareList.length}/3)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {compareList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No flats added to compare list yet. Click the &ldquo;Compare&rdquo; button on any transaction to compare them side-by-side.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {compareList.map(tx => {
              const mortgage = calculateMortgage({ price: tx.resalePrice, loanType: 'HDB' });
              const balas = getBalasTablePercentage(tx.remainingLeaseYears);

              return (
                <div
                  key={tx.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-sm hover:text-rose-300 cursor-pointer" onClick={() => onSelectTransaction(tx)}>
                          {tx.address}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {tx.town} · {tx.flatType}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemove(tx.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-slate-400 text-[11px]">Resale Price</div>
                      <div className="text-xl font-bold font-mono text-white tabular-nums">
                        ${tx.resalePrice.toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Price / Sqft</span>
                        <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                          ${tx.pricePerSqft.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Floor Area</span>
                        <span className="font-mono text-slate-200 tabular-nums">
                          {tx.floorAreaSqm} sqm ({tx.floorAreaSqft} sqft)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Floor Level</span>
                        <span className="text-slate-200">{tx.storeyRange}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lease Left</span>
                        <span className="font-mono text-slate-200 tabular-nums">
                          {tx.remainingLeaseYears.toFixed(1)} yrs
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bala’s Value %</span>
                        <span className="font-mono text-amber-300 tabular-nums">
                          {balas}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. HDB Loan / mo</span>
                        <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                          ${mortgage.monthlyInstallment.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTransaction(tx)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

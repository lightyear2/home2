import React from 'react';
import { Calculator, ArrowRight, ShieldCheck, TrendingUp, CheckCircle, HelpCircle } from 'lucide-react';
import { HDB_TOWNS, FLAT_TYPES, estimateValuation, calculateMortgage } from '../services/hdbApi';
import { ValuationEstimate, HDBTransaction } from '../types/hdb';

interface ValuationEstimatorProps {
  onSelectTransaction: (tx: HDBTransaction) => void;
}

export const ValuationEstimator: React.FC<ValuationEstimatorProps> = ({ onSelectTransaction }) => {
  const [town, setTown] = React.useState('TAMPINES');
  const [flatType, setFlatType] = React.useState('4 ROOM');
  const [floorAreaSqm, setFloorAreaSqm] = React.useState(93);
  const [storeyTier, setStoreyTier] = React.useState<'Low (01-06)' | 'Mid (07-15)' | 'High (16-25)' | 'Very High (26+)'>('Mid (07-15)');
  const [remainingLeaseYears, setRemainingLeaseYears] = React.useState(75);

  const [estimate, setEstimate] = React.useState<ValuationEstimate | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);

  const runCalculation = React.useCallback(async () => {
    setIsCalculating(true);
    try {
      const res = await estimateValuation({
        town,
        flatType,
        floorAreaSqm,
        storeyTier,
        remainingLeaseYears
      });
      setEstimate(res);
    } catch (err) {
      console.error('Valuation error:', err);
    } finally {
      setIsCalculating(false);
    }
  }, [town, flatType, floorAreaSqm, storeyTier, remainingLeaseYears]);

  React.useEffect(() => {
    runCalculation();
  }, [runCalculation]);

  const floorAreaSqft = Math.round(floorAreaSqm * 10.7639);
  const mortgageHdb = estimate ? calculateMortgage({ price: estimate.estimatedPrice, loanType: 'HDB' }) : null;
  const mortgageBank = estimate ? calculateMortgage({ price: estimate.estimatedPrice, loanType: 'Bank' }) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Calculator className="w-4 h-4" />
          <span>Automated Valuation Model (AVM)</span>
          <span aria-hidden="true">·</span>
          <span>Comparative Market Analysis</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          HDB Resale Fair Value Estimator
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Input your flat specifications to generate an econometric fair market valuation range, derived directly from recent Data.gov.sg comparable resale transactions, storey premiums, and lease depreciation factors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls (Left Column) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <h3 className="font-semibold text-sm text-white border-b border-slate-800 pb-3">
            Flat Specifications
          </h3>

          {/* Town */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Town / Estate</label>
            <select
              value={town}
              onChange={(e) => setTown(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              {HDB_TOWNS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Flat Type */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Flat Type</label>
            <select
              value={flatType}
              onChange={(e) => setFlatType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              {FLAT_TYPES.map(ft => (
                <option key={ft} value={ft}>{ft}</option>
              ))}
            </select>
          </div>

          {/* Floor Area Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Floor Area</span>
              <span className="font-mono text-white tabular-nums">
                {floorAreaSqm} sqm <span className="text-slate-500">({floorAreaSqft} sqft)</span>
              </span>
            </div>
            <input
              type="range"
              min="35"
              max="160"
              step="1"
              value={floorAreaSqm}
              onChange={(e) => setFloorAreaSqm(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Storey Tier */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Floor Level Tier</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['Low (01-06)', 'Mid (07-15)', 'High (16-25)', 'Very High (26+)'] as const).map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setStoreyTier(tier)}
                  className={`px-3 py-2 rounded-lg border text-left font-medium transition-colors ${
                    storeyTier === tier
                      ? 'bg-rose-950/40 border-rose-600 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Remaining Lease Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Remaining Lease</span>
              <span className="font-mono text-white tabular-nums">{remainingLeaseYears} years left</span>
            </div>
            <input
              type="range"
              min="30"
              max="99"
              step="1"
              value={remainingLeaseYears}
              onChange={(e) => setRemainingLeaseYears(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Valuation Results (Right Column) */}
        <div className="lg:col-span-7 space-y-6">
          {estimate && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                    Estimated Resale Fair Value
                  </span>
                  <span className="text-xs text-slate-400">
                    Confidence: <strong className="text-emerald-400 font-mono">{estimate.confidenceScore}%</strong>
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
                    ${estimate.estimatedPrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-mono text-emerald-400 tabular-nums font-semibold">
                    ~${estimate.estimatedPsf.toLocaleString()} psf
                  </span>
                </div>

                {/* Range bar */}
                <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="text-slate-400">
                    Lower Bound: <strong className="text-slate-200 tabular-nums">${estimate.minRange.toLocaleString()}</strong>
                  </div>
                  <div className="text-slate-400">
                    Upper Bound: <strong className="text-slate-200 tabular-nums">${estimate.maxRange.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Economic Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block text-[11px]">Price / Sqm</span>
                  <span className="font-mono tabular-nums text-sm font-bold text-white mt-0.5 block">
                    ${estimate.estimatedPsm.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block text-[11px]">Bala’s Curve Value</span>
                  <span className="font-mono tabular-nums text-sm font-bold text-amber-400 mt-0.5 block">
                    {estimate.balaResidualPct}% of freehold
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[11px]">Est. Monthly (HDB Loan)</span>
                  <span className="font-mono tabular-nums text-sm font-bold text-emerald-400 mt-0.5 block">
                    {mortgageHdb ? `$${mortgageHdb.monthlyInstallment.toLocaleString()}/mo` : '—'}
                  </span>
                </div>
              </div>

              {/* Recent Comparables */}
              {estimate.comparables.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Recent Benchmark Comparables ({town} · {flatType})
                  </h4>
                  <div className="space-y-2">
                    {estimate.comparables.map(comp => (
                      <div
                        key={comp.id}
                        onClick={() => onSelectTransaction(comp)}
                        className="p-3 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-200 hover:text-rose-300">
                            {comp.address}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {comp.storeyRange} Flr · {comp.floorAreaSqm} sqm · {comp.month}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-white tabular-nums">
                            ${comp.resalePrice.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-emerald-400 font-mono tabular-nums">
                            ${comp.pricePerSqft.toLocaleString()} psf
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

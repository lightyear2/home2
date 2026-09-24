import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, AlertTriangle, Info, TrendingDown } from 'lucide-react';
import { getBalasTablePercentage } from '../services/hdbApi';

export const LeaseDecayCalculator: React.FC = () => {
  const [remainingYears, setRemainingYears] = React.useState<number>(65);
  const [youngestBuyerAge, setYoungestBuyerAge] = React.useState<number>(32);
  const [flatPurchasePrice, setFlatPurchasePrice] = React.useState<number>(550000);

  const balaPct = getBalasTablePercentage(remainingYears);
  const projectedAgeAtLeaseEnd = youngestBuyerAge + remainingYears;
  const coversTo95 = projectedAgeAtLeaseEnd >= 95;

  // Pro-rated CPF usage factor if lease does not cover to 95:
  // Formula: (Remaining lease / (95 - Age)) capped at 100%
  const cpfAllowanceFactor = coversTo95
    ? 1.0
    : Math.max(0, Math.min(1.0, remainingYears / (95 - youngestBuyerAge)));

  const maxCpfAllowed = Math.round(flatPurchasePrice * cpfAllowanceFactor);

  // SLA Table Milestone Points for visual table & graph
  const milestones = [
    { years: 99, pct: 96.0, desc: 'Brand new 99-year flat' },
    { years: 80, pct: 90.7, desc: 'Prime mature period' },
    { years: 60, pct: 80.0, desc: 'Decay begins accelerating' },
    { years: 50, pct: 72.5, desc: 'Bank loan tenures restricted' },
    { years: 40, pct: 63.4, desc: 'Steep depreciation curve' },
    { years: 30, pct: 51.5, desc: 'Significant CPF withdrawal limits' },
    { years: 20, pct: 38.5, desc: 'Minimum lease for CPF usage' },
    { years: 10, pct: 21.0, desc: 'Terminal value stage' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Clock className="w-4 h-4" />
          <span>Singapore Land Authority (SLA) Model</span>
          <span aria-hidden="true">·</span>
          <span>Leasehold Valuation & CPF Rules</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Bala’s Curve & Lease Decay Calculator
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-3xl leading-relaxed">
          The Singapore Land Authority (SLA) Bala’s Table sets the benchmark for leasehold depreciation. Check how remaining lease impacts your flat’s residual value, CPF withdrawal allowance, and the Singapore “Rule of 95”.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulator Controls (Left Column) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <h3 className="font-semibold text-sm text-white border-b border-slate-800 pb-3">
            Lease & Buyer Parameters
          </h3>

          {/* Remaining Lease Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Flat Remaining Lease</span>
              <span className="font-mono text-white tabular-nums font-bold text-sm">
                {remainingYears} years
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="99"
              step="1"
              value={remainingYears}
              onChange={(e) => setRemainingYears(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>15 yrs (Critical)</span>
              <span>60 yrs (Tipping Pt)</span>
              <span>99 yrs (New)</span>
            </div>
          </div>

          {/* Youngest Buyer Age */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Youngest Buyer’s Current Age</span>
              <span className="font-mono text-white tabular-nums font-bold text-sm">
                {youngestBuyerAge} years old
              </span>
            </div>
            <input
              type="range"
              min="21"
              max="70"
              step="1"
              value={youngestBuyerAge}
              onChange={(e) => setYoungestBuyerAge(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Target Flat Price */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Estimated Flat Price (SGD)</label>
            <input
              type="number"
              step="10000"
              value={flatPurchasePrice}
              onChange={(e) => setFlatPurchasePrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono"
            />
          </div>

          {/* Rule of 95 Status Box */}
          <div className={`p-4 rounded-xl border ${
            coversTo95
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
              : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
          }`}>
            <div className="flex items-start gap-2.5">
              {coversTo95 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-semibold text-xs text-white">
                  {coversTo95 ? 'Covers Buyer to Age 95' : 'Does Not Cover to Age 95'}
                </div>
                <div className="text-[11px] leading-relaxed text-slate-300">
                  {coversTo95 ? (
                    <>The flat lease will last until the youngest buyer reaches age <strong className="text-white font-mono">{projectedAgeAtLeaseEnd}</strong>. Full 100% CPF Valuation Limit allowance applies.</>
                  ) : (
                    <>The flat expires when the buyer is age <strong className="text-amber-200 font-mono">{projectedAgeAtLeaseEnd}</strong>. CPF OA usage is pro-rated to <strong className="text-amber-200 font-mono">{(cpfAllowanceFactor * 100).toFixed(1)}%</strong> of property valuation.</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results & Visual Curve (Right Column) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Output Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 block text-xs">Bala’s Table Factor</span>
              <span className="font-mono tabular-nums text-2xl font-bold text-amber-400 mt-1 block">
                {balaPct}%
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Relative to freehold benchmark
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 block text-xs">CPF OA Limit</span>
              <span className="font-mono tabular-nums text-2xl font-bold text-emerald-400 mt-1 block">
                ${maxCpfAllowed.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {(cpfAllowanceFactor * 100).toFixed(0)}% of purchase price
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 block text-xs">Buyer Age at Expiry</span>
              <span className="font-mono tabular-nums text-2xl font-bold text-white mt-1 block">
                Age {projectedAgeAtLeaseEnd}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Target: &ge; 95 years
              </span>
            </div>
          </div>

          {/* Interactive Bala's Curve Representation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
                Official SLA Bala’s Curve Milestones
              </h4>
              <span className="text-[11px] text-slate-400">Singapore Land Authority Benchmark</span>
            </div>

            <div className="space-y-2">
              {milestones.map(m => {
                const isSelected = Math.abs(remainingYears - m.years) <= 5;
                return (
                  <div
                    key={m.years}
                    onClick={() => setRemainingYears(m.years)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-600 text-rose-200'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold w-14 text-white tabular-nums">
                        {m.years} yrs
                      </span>
                      <div className="w-24 sm:w-36 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-amber-400 h-full"
                          style={{ width: `${m.pct}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-amber-300 text-xs">
                        {m.pct}%
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
                      {m.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

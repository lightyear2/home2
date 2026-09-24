import React from 'react';
import { DollarSign, ShieldCheck, PieChart, FileText, CheckCircle } from 'lucide-react';
import { calculateMortgage } from '../services/hdbApi';

export const MortgageCalculator: React.FC = () => {
  const [propertyPrice, setPropertyPrice] = React.useState<number>(650000);
  const [loanType, setLoanType] = React.useState<'HDB' | 'Bank'>('HDB');
  const [tenureYears, setTenureYears] = React.useState<number>(25);
  const [interestRate, setInterestRate] = React.useState<number>(2.6);

  // Sync interest rate default when toggling loan type
  const handleLoanTypeToggle = (type: 'HDB' | 'Bank') => {
    setLoanType(type);
    if (type === 'HDB') {
      setInterestRate(2.6);
      if (tenureYears > 25) setTenureYears(25);
    } else {
      setInterestRate(3.0);
    }
  };

  const calc = calculateMortgage({
    price: propertyPrice,
    loanType,
    tenureYears,
    interestRate
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <DollarSign className="w-4 h-4" />
          <span>Singapore Housing Finance</span>
          <span aria-hidden="true">·</span>
          <span>CPF & MSR Affordability Engine</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          HDB Resale Mortgage & CPF Affordability
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Accurate calculations complying with Singapore MAS and HDB regulations: 30% Mortgage Servicing Ratio (MSR), IRAS residential Buyer’s Stamp Duty (BSD), and CPF Ordinary Account downpayment allocations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls (Left Column) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <h3 className="font-semibold text-sm text-white border-b border-slate-800 pb-3">
            Financing Options
          </h3>

          {/* Property Price */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Flat Purchase Price (SGD)</span>
              <span className="font-mono text-white tabular-nums font-bold text-sm">
                ${propertyPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="number"
              step="10000"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Math.max(100000, Number(e.target.value)))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Loan Type Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Loan Financing Type</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleLoanTypeToggle('HDB')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  loanType === 'HDB'
                    ? 'bg-rose-950/40 border-rose-600 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-white text-xs">HDB Housing Loan</div>
                <div className="text-[11px] text-slate-400 mt-0.5">80% LTV · 2.6% p.a.</div>
                <div className="text-[10px] text-emerald-400 mt-1">Zero cash downpayment</div>
              </button>

              <button
                type="button"
                onClick={() => handleLoanTypeToggle('Bank')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  loanType === 'Bank'
                    ? 'bg-rose-950/40 border-rose-600 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-white text-xs">Commercial Bank</div>
                <div className="text-[11px] text-slate-400 mt-0.5">75% LTV · Floating/Fixed</div>
                <div className="text-[10px] text-amber-400 mt-1">Min 5% cash required</div>
              </button>
            </div>
          </div>

          {/* Loan Tenure Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Loan Tenure</span>
              <span className="font-mono text-white tabular-nums font-bold">
                {tenureYears} years
              </span>
            </div>
            <input
              type="range"
              min="5"
              max={loanType === 'HDB' ? 25 : 30}
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>5 yrs</span>
              <span>{loanType === 'HDB' ? '25 yrs (HDB Max)' : '30 yrs (Bank Max)'}</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Interest Rate (% p.a.)</span>
              <span className="font-mono text-white tabular-nums font-bold">
                {interestRate}%
              </span>
            </div>
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="6.0"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Results Overview (Right Column) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Monthly Payment Hero Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                Monthly Repayment Estimate
              </span>
              <span className="text-xs text-slate-400">
                {loanType === 'HDB' ? 'CPF OA or Cash' : 'Commercial Rate'}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
                ${calc.monthlyInstallment.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / month for {calc.tenureYears} years
              </span>
            </div>

            {/* Income required by MSR */}
            <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Min. Gross Household Income Required (30% MSR cap):
              </span>
              <span className="font-mono tabular-nums font-bold text-amber-300">
                ${calc.minMonthlyIncomeRequired.toLocaleString()} / mo
              </span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Downpayment & Cash */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-xs border-b border-slate-800 pb-2">
                Upfront Capital Required
              </h4>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Downpayment ({100 - calc.ltvPct}%)</span>
                <span className="font-mono text-white tabular-nums font-bold">
                  ${calc.downpaymentTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pl-2">
                <span>· Cash Downpayment (min 5% if Bank)</span>
                <span className="font-mono tabular-nums text-amber-300">
                  ${calc.downpaymentCash.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pl-2">
                <span>· CPF Ordinary Account (OA)</span>
                <span className="font-mono tabular-nums text-emerald-400">
                  ${calc.downpaymentCpf.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Buyer’s Stamp Duty (BSD)</span>
                <span className="font-mono tabular-nums text-rose-300 font-bold">
                  ${calc.bsdAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Loan Principal & Interest */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-xs border-b border-slate-800 pb-2">
                Loan Structure
              </h4>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Loan Principal ({calc.ltvPct}%)</span>
                <span className="font-mono text-white tabular-nums font-bold">
                  ${calc.loanAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Interest over {calc.tenureYears} yrs</span>
                <span className="font-mono text-slate-300 tabular-nums">
                  ${calc.totalInterest.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Total Lifetime Payments</span>
                <span className="font-mono tabular-nums text-amber-400 font-bold">
                  ${(calc.loanAmount + calc.totalInterest).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

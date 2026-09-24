import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart2, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { HDBTransaction } from '../types/hdb';

interface PriceTrendChartProps {
  transactions: HDBTransaction[];
  activeTownFilter?: string;
  activeTypeFilter?: string;
}

interface MonthlyTrendPoint {
  month: string; // "YYYY-MM"
  displayMonth: string; // "Jan '24"
  medianPrice: number;
  avgPrice: number;
  avgPsf: number;
  minPrice: number;
  maxPrice: number;
  volume: number;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  transactions,
  activeTownFilter,
  activeTypeFilter
}) => {
  const [metric, setMetric] = React.useState<'price' | 'psf'>('price');
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Group transactions by month and compute statistical aggregations
  const trendData: MonthlyTrendPoint[] = React.useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const grouped = new Map<string, { prices: number[]; psfs: number[] }>();

    transactions.forEach(t => {
      if (!t.month) return;
      if (!grouped.has(t.month)) {
        grouped.set(t.month, { prices: [], psfs: [] });
      }
      const entry = grouped.get(t.month)!;
      entry.prices.push(t.resalePrice);
      entry.psfs.push(t.pricePerSqft);
    });

    // Sort chronologically (oldest -> newest)
    const sortedMonths = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));

    return sortedMonths.map(month => {
      const { prices, psfs } = grouped.get(month)!;
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
      const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
      const avgPsf = Math.round(psfs.reduce((sum, p) => sum + p, 0) / psfs.length);
      const minPrice = sortedPrices[0];
      const maxPrice = sortedPrices[sortedPrices.length - 1];

      // Format display month: "2024-05" -> "May '24"
      const [year, m] = month.split('-');
      const date = new Date(parseInt(year, 10), parseInt(m, 10) - 1);
      const displayMonth = isNaN(date.getTime())
        ? month
        : date.toLocaleDateString('en-SG', { month: 'short', year: '2-digit' });

      return {
        month,
        displayMonth,
        medianPrice,
        avgPrice,
        avgPsf,
        minPrice,
        maxPrice,
        volume: prices.length
      };
    });
  }, [transactions]);

  // Overall trend change calculation
  const trendMetrics = React.useMemo(() => {
    if (trendData.length < 2) return null;
    const first = trendData[0];
    const last = trendData[trendData.length - 1];

    const priceChangePct = ((last.medianPrice - first.medianPrice) / first.medianPrice) * 100;
    const psfChangePct = ((last.avgPsf - first.avgPsf) / first.avgPsf) * 100;

    return {
      firstMonth: first.displayMonth,
      lastMonth: last.displayMonth,
      priceChangePct,
      psfChangePct,
      isPricePositive: priceChangePct >= 0,
      isPsfPositive: psfChangePct >= 0
    };
  }, [trendData]);

  if (trendData.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-900/60 text-rose-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                Resale Price Trend Analysis
              </h3>
              {trendMetrics && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                    (metric === 'price' ? trendMetrics.isPricePositive : trendMetrics.isPsfPositive)
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60'
                      : 'text-rose-400 bg-rose-950/40 border border-rose-800/60'
                  }`}
                >
                  {(metric === 'price' ? trendMetrics.isPricePositive : trendMetrics.isPsfPositive) ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(metric === 'price' ? trendMetrics.priceChangePct : trendMetrics.psfChangePct).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {activeTownFilter ? `${activeTownFilter} · ` : 'All Singapore Estates · '}
              {activeTypeFilter ? `${activeTypeFilter} · ` : 'All Flat Types · '}
              Chronological distribution across {trendData.length} active periods
            </p>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Metric toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMetric('price')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                metric === 'price'
                  ? 'bg-slate-800 text-rose-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Median Price ($)
            </button>
            <button
              onClick={() => setMetric('psf')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                metric === 'psf'
                  ? 'bg-slate-800 text-rose-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Avg Rate ($PSF)
            </button>
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand Chart' : 'Collapse Chart'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {!isCollapsed && (
        <div className="space-y-3 pt-2">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={trendData}
                margin={{ top: 12, right: 16, left: 10, bottom: 4 }}
              >
                <defs>
                  {/* Linear gradient fill under trendline */}
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="psfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />

                <XAxis
                  dataKey="displayMonth"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val: number) =>
                    metric === 'price'
                      ? `$${val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : Math.round(val / 1000) + 'k'}`
                      : `$${val}`
                  }
                  domain={['auto', 'auto']}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as MonthlyTrendPoint;
                      return (
                        <div className="bg-slate-950/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="font-semibold text-white">{data.month}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {data.volume} transacted
                            </span>
                          </div>

                          <div className="space-y-1 font-mono">
                            <div className="flex justify-between items-center text-rose-300">
                              <span className="text-slate-400 font-sans">Median Resale:</span>
                              <span className="font-bold tabular-nums">
                                ${data.medianPrice.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-emerald-400">
                              <span className="text-slate-400 font-sans">Avg Price/Sqft:</span>
                              <span className="font-semibold tabular-nums">
                                ${data.avgPsf.toLocaleString()} psf
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-300 text-[11px] pt-1 border-t border-slate-800/80">
                              <span className="text-slate-400 font-sans">Price Range:</span>
                              <span className="tabular-nums">
                                ${Math.round(data.minPrice / 1000)}k – ${Math.round(data.maxPrice / 1000)}k
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {metric === 'price' ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="medianPrice"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#priceGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="medianPrice"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#f43f5e', stroke: '#0f172a', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#fb7185', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </>
                ) : (
                  <>
                    <Area
                      type="monotone"
                      dataKey="avgPsf"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#psfGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="avgPsf"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#10b981', stroke: '#0f172a', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Summary Footnote */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-3 font-mono">
              <span>Earliest in batch: <strong className="text-slate-300">{trendData[0]?.displayMonth}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Latest: <strong className="text-slate-300">{trendData[trendData.length - 1]?.displayMonth}</strong></span>
            </div>
            <div className="text-slate-500">
              Aggregated from live Data.gov.sg resale records
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

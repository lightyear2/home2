import React from 'react';
import { TrendingUp, Award, Building, Sparkles, Flame, Eye, Scale } from 'lucide-react';
import { HDBTransaction } from '../types/hdb';
import { fetchMillionDollarTransactions } from '../services/hdbApi';

interface MillionDollarClubProps {
  onSelectTransaction: (tx: HDBTransaction) => void;
  onToggleCompare: (tx: HDBTransaction) => void;
  compareList: HDBTransaction[];
}

export const MillionDollarClub: React.FC<MillionDollarClubProps> = ({
  onSelectTransaction,
  onToggleCompare,
  compareList
}) => {
  const [records, setRecords] = React.useState<HDBTransaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filterTown, setFilterTown] = React.useState<string>('ALL');

  React.useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetchMillionDollarTransactions(100)
      .then(data => {
        if (mounted) {
          setRecords(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const highestTx = records.length > 0 ? records[0] : null;
  const highestPsf = records.length > 0
    ? [...records].sort((a, b) => b.pricePerSqft - a.pricePerSqft)[0]
    : null;

  // Town frequencies
  const townCounts: Record<string, number> = {};
  records.forEach(r => {
    townCounts[r.town] = (townCounts[r.town] || 0) + 1;
  });
  const sortedTowns = Object.entries(townCounts).sort((a, b) => b[1] - a[1]);

  const filteredRecords = filterTown === 'ALL'
    ? records
    : records.filter(r => r.town === filterTown);

  const isCompared = (id: number) => compareList.some(c => c.id === id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-rose-900/60 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Flame className="w-4 h-4 text-rose-500" />
          <span>Singapore HDB Premier Tier</span>
          <span aria-hidden="true">·</span>
          <span>&ge; SGD $1,000,000 Resale Transactions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          The Million-Dollar HDB Club
        </h2>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Tracking the historic surge of seven-figure public housing in Singapore. Analysis of trophy HDB units at Pinnacle@Duxton, Dawson Skyville/SkyTerrace, Henderson Road, and DBSS Natura Loft.
        </p>

        {/* High-Water Mark Stat Grid */}
        <div className="mt-6 pt-6 border-t border-rose-900/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-rose-900/40 rounded-xl p-4">
            <div className="text-xs text-rose-400/80 font-medium">All-Time Peak Price</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
              {highestTx ? `$${highestTx.resalePrice.toLocaleString()}` : '—'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {highestTx ? `${highestTx.address} (${highestTx.month})` : 'Loading...'}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium">Record Price / Sqft</div>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
              {highestPsf ? `$${highestPsf.pricePerSqft.toLocaleString()} psf` : '—'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {highestPsf ? `${highestPsf.address}` : 'Loading...'}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium">Leading Town</div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {sortedTowns[0] ? sortedTowns[0][0] : '—'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {sortedTowns[0] ? `${sortedTowns[0][1]} million-dollar units in sample` : ''}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium">Top Flat Model</div>
            <div className="text-xl font-bold text-white mt-1">
              Type S2 & Loft
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Storey 30+ skyline premium
            </div>
          </div>
        </div>
      </div>

      {/* Town Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 font-medium shrink-0 mr-1">Filter by Town:</span>
        <button
          onClick={() => setFilterTown('ALL')}
          className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
            filterTown === 'ALL'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All ({records.length})
        </button>
        {sortedTowns.map(([t, count]) => (
          <button
            key={t}
            onClick={() => setFilterTown(t)}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              filterTown === t
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {t} ({count})
          </button>
        ))}
      </div>

      {/* Million Dollar Transactions List */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          Loading million-dollar transaction database...
        </div>
      ) : (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium">
                  <th className="py-3 px-4">Rank</th>
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
                {filteredRecords.map((tx, idx) => {
                  const compared = isCompared(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="group hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        #{idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-rose-300 transition-colors">
                          {tx.address}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Registered {tx.month}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-300 font-medium">
                        {tx.town}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-slate-200">{tx.flatType}</span>
                        <span className="text-slate-500 block text-[11px]">{tx.flatModel}</span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-amber-300 font-medium">
                        {tx.storeyRange} Flr
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono tabular-nums text-slate-200">{tx.floorAreaSqm} sqm</div>
                        <div className="text-[11px] text-slate-500 font-mono">{tx.floorAreaSqft} sqft</div>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono tabular-nums text-slate-200">{tx.remainingLeaseYears.toFixed(1)} yrs</div>
                        <div className="text-[11px] text-slate-500">Built {tx.leaseCommenceDate}</div>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono tabular-nums font-bold text-emerald-400">
                          ${tx.pricePerSqft.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">${tx.pricePerSqm.toLocaleString()}/sqm</div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-mono tabular-nums text-sm font-extrabold text-rose-400">
                          ${tx.resalePrice.toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectTransaction(tx)}
                            title="Inspect details"
                            className="p-1 text-slate-400 hover:text-white rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onToggleCompare(tx)}
                            title={compared ? 'Remove compare' : 'Add to compare'}
                            className={`p-1 rounded ${compared ? 'text-amber-300 bg-amber-950/60' : 'text-slate-400 hover:text-white'}`}
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
    </div>
  );
};

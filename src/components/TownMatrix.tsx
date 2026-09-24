import React from 'react';
import { Building2, ArrowRight, TrendingUp, ShieldCheck, MapPin } from 'lucide-react';
import { HDB_TOWNS, MATURE_ESTATES, TOWN_REGIONS } from '../services/hdbApi';

interface TownMatrixProps {
  onSelectTown: (town: string) => void;
}

// Representative Singapore HDB town statistics benchmark based on recent historical market data
const TOWN_BENCHMARKS: Record<string, {
  medianPrice: number;
  avgPsf: number;
  avgPsm: number;
  hasMillionDollar: boolean;
  popularTypes: string;
  avgRemainingLease: number;
  highlight: string;
}> = {
  'CENTRAL AREA': { medianPrice: 880000, avgPsf: 980, avgPsm: 10550, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 83, highlight: 'Pinnacle@Duxton trophy asset' },
  'BUKIT MERAH': { medianPrice: 780000, avgPsf: 820, avgPsm: 8820, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 74, highlight: 'Henderson Rd & Telok Blangah' },
  'QUEENSTOWN': { medianPrice: 790000, avgPsf: 830, avgPsm: 8930, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 78, highlight: 'Dawson Skyville & Strathmore' },
  'BISHAN': { medianPrice: 770000, avgPsf: 760, avgPsm: 8180, hasMillionDollar: true, popularTypes: '4-Room, Executive', avgRemainingLease: 67, highlight: 'Natura Loft DBSS hub' },
  'TOA PAYOH': { medianPrice: 720000, avgPsf: 740, avgPsm: 7960, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 68, highlight: 'Prime central connectivity' },
  'KALLANG/WHAMPOA': { medianPrice: 740000, avgPsf: 770, avgPsm: 8280, hasMillionDollar: true, popularTypes: '3-Room, 4-Room', avgRemainingLease: 73, highlight: 'Boon Keng & Saint George' },
  'CLEMENTI': { medianPrice: 690000, avgPsf: 710, avgPsm: 7640, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 69, highlight: 'Tertiary education belt' },
  'BUKIT TIMAH': { medianPrice: 760000, avgPsf: 750, avgPsm: 8070, hasMillionDollar: true, popularTypes: 'Executive, 5-Room', avgRemainingLease: 62, highlight: 'Exclusive low-density estate' },
  'MARINE PARADE': { medianPrice: 650000, avgPsf: 690, avgPsm: 7420, hasMillionDollar: true, popularTypes: '3-Room, 4-Room', avgRemainingLease: 51, highlight: 'East Coast proximity' },
  'GEYLANG': { medianPrice: 620000, avgPsf: 660, avgPsm: 7100, hasMillionDollar: true, popularTypes: '3-Room, 4-Room', avgRemainingLease: 64, highlight: 'City fringe value' },
  'TAMPINES': { medianPrice: 605000, avgPsf: 590, avgPsm: 6350, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 70, highlight: 'East regional center' },
  'BEDOK': { medianPrice: 560000, avgPsf: 560, avgPsm: 6020, hasMillionDollar: true, popularTypes: '3-Room, 4-Room', avgRemainingLease: 62, highlight: 'Established food & MRT belt' },
  'PASIR RIS': { medianPrice: 620000, avgPsf: 540, avgPsm: 5810, hasMillionDollar: true, popularTypes: '5-Room, Executive', avgRemainingLease: 68, highlight: 'Coastal living & spacious layouts' },
  'ANG MO KIO': { medianPrice: 540000, avgPsf: 580, avgPsm: 6240, hasMillionDollar: true, popularTypes: '3-Room, 4-Room', avgRemainingLease: 61, highlight: 'North-East mature hub' },
  'SERANGOON': { medianPrice: 650000, avgPsf: 630, avgPsm: 6780, hasMillionDollar: true, popularTypes: '4-Room, Executive', avgRemainingLease: 65, highlight: 'NEX interchange hub' },
  'HOUGANG': { medianPrice: 550000, avgPsf: 540, avgPsm: 5810, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 66, highlight: 'Cross Island Line growth' },
  'PUNGGOL': { medianPrice: 610000, avgPsf: 610, avgPsm: 6560, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 88, highlight: 'Digital District & young flats' },
  'SENGKANG': { medianPrice: 590000, avgPsf: 580, avgPsm: 6240, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 84, highlight: 'High density family housing' },
  'JURONG EAST': { medianPrice: 580000, avgPsf: 570, avgPsm: 6130, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 64, highlight: 'Jurong Lake District 2nd CBD' },
  'JURONG WEST': { medianPrice: 510000, avgPsf: 490, avgPsm: 5270, hasMillionDollar: false, popularTypes: '4-Room, 5-Room', avgRemainingLease: 66, highlight: 'Affordable value & NTU belt' },
  'BUKIT BATOK': { medianPrice: 530000, avgPsf: 520, avgPsm: 5590, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 67, highlight: 'Nature reserves & quiet enclave' },
  'BUKIT PANJANG': { medianPrice: 535000, avgPsf: 510, avgPsm: 5480, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 72, highlight: 'Downtown Line accessibility' },
  'CHOA CHU KANG': { medianPrice: 540000, avgPsf: 500, avgPsm: 5380, hasMillionDollar: true, popularTypes: '4-Room, Executive', avgRemainingLease: 68, highlight: 'North-South & Jurong Region Line' },
  'WOODLANDS': { medianPrice: 520000, avgPsf: 490, avgPsm: 5270, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 70, highlight: 'RTS Link & Northern Gateway' },
  'YISHUN': { medianPrice: 515000, avgPsf: 500, avgPsm: 5380, hasMillionDollar: true, popularTypes: '4-Room, 5-Room', avgRemainingLease: 68, highlight: 'Northpoint City medical hub' },
  'SEMBAWANG': { medianPrice: 525000, avgPsf: 495, avgPsm: 5320, hasMillionDollar: false, popularTypes: '4-Room, 5-Room', avgRemainingLease: 77, highlight: 'Bukit Canberra community sports hub' }
};

export const TownMatrix: React.FC<TownMatrixProps> = ({ onSelectTown }) => {
  const [selectedRegion, setSelectedRegion] = React.useState<string>('ALL');
  const [selectedMaturity, setSelectedMaturity] = React.useState<'ALL' | 'MATURE' | 'NON_MATURE'>('ALL');
  const [sortBy, setSortBy] = React.useState<'medianPrice' | 'avgPsf' | 'avgRemainingLease'>('medianPrice');

  const filteredTowns = HDB_TOWNS.filter(town => {
    const region = TOWN_REGIONS[town];
    const isMature = MATURE_ESTATES.has(town);

    if (selectedRegion !== 'ALL' && region !== selectedRegion) return false;
    if (selectedMaturity === 'MATURE' && !isMature) return false;
    if (selectedMaturity === 'NON_MATURE' && isMature) return false;
    return true;
  }).sort((a, b) => {
    const dataA = TOWN_BENCHMARKS[a] || { medianPrice: 0, avgPsf: 0, avgRemainingLease: 0 };
    const dataB = TOWN_BENCHMARKS[b] || { medianPrice: 0, avgPsf: 0, avgRemainingLease: 0 };
    return dataB[sortBy] - dataA[sortBy];
  });

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Building2 className="w-4 h-4" />
          <span>Singapore 26 Estates Benchmark</span>
          <span aria-hidden="true">·</span>
          <span>Market Pricing Matrix</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Town Comparative Matrix
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Compare median resale values, price per square foot ($PSF), lease profile, and mature vs non-mature estate premiums across all 26 public housing towns.
        </p>

        {/* Filter Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Region Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {['ALL', 'Central', 'East', 'North-East', 'North', 'West'].map(reg => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedRegion === reg
                    ? 'bg-slate-800 text-rose-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {reg === 'ALL' ? 'All Regions' : reg}
              </button>
            ))}
          </div>

          {/* Maturity & Sort */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMaturity}
              onChange={(e) => setSelectedMaturity(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs"
            >
              <option value="ALL">All Maturity Types</option>
              <option value="MATURE">Mature Estates (15)</option>
              <option value="NON_MATURE">Non-Mature Estates (11)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs"
            >
              <option value="medianPrice">Sort by Median Price</option>
              <option value="avgPsf">Sort by Price / Sqft</option>
              <option value="avgRemainingLease">Sort by Remaining Lease</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Towns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTowns.map(town => {
          const isMature = MATURE_ESTATES.has(town);
          const region = TOWN_REGIONS[town];
          const data = TOWN_BENCHMARKS[town] || {
            medianPrice: 550000,
            avgPsf: 550,
            avgPsm: 5900,
            hasMillionDollar: false,
            popularTypes: '4-Room',
            avgRemainingLease: 70,
            highlight: 'Standard HDB town'
          };

          return (
            <div
              key={town}
              onClick={() => onSelectTown(town)}
              className="group bg-slate-900/90 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between hover:shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-rose-300 transition-colors">
                      {town}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <span>{region}</span>
                      <span aria-hidden="true">·</span>
                      <span>{isMature ? 'Mature' : 'Non-Mature'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono tabular-nums font-bold text-base text-amber-400">
                      ${data.medianPrice.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500">Median Resale</div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400 line-clamp-1">
                  {data.highlight}
                </p>

                {/* Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Avg $PSF</span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-400">
                      ${data.avgPsf.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Avg Lease</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {data.avgRemainingLease} yrs
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">$1M Club?</span>
                    <span className={`font-semibold ${data.hasMillionDollar ? 'text-rose-400' : 'text-slate-500'}`}>
                      {data.hasMillionDollar ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 group-hover:text-rose-300 transition-colors">
                <span>View live transactions</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

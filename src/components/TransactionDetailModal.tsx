import React from 'react';
import { X, Building, MapPin, Clock, DollarSign, Scale, ExternalLink, Calendar, Compass, Shield, Train, Navigation, Footprints } from 'lucide-react';
import { HDBTransaction } from '../types/hdb';
import { calculateBSD, calculateMortgage, getBalasTablePercentage } from '../services/hdbApi';
import { searchOneMapAddress, findNearestMRT, getOneMapRoute, OneMapGeocodeResult } from '../services/onemapApi';

interface TransactionDetailModalProps {
  transaction: HDBTransaction | null;
  onClose: () => void;
  onToggleCompare: (tx: HDBTransaction) => void;
  isCompared: boolean;
  onFilterByStreet?: (street: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onToggleCompare,
  isCompared,
  onFilterByStreet
}) => {
  const [geocode, setGeocode] = React.useState<OneMapGeocodeResult | null>(null);
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  const [routeType, setRouteType] = React.useState<'walk' | 'pt' | 'cycle' | 'drive'>('walk');
  const [routeInfo, setRouteInfo] = React.useState<{ distanceMeters: number; durationMinutes: number; source: string } | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Geocode address via OneMap API
  React.useEffect(() => {
    if (!transaction) return;
    setIsGeocoding(true);
    setGeocode(null);
    setRouteInfo(null);

    searchOneMapAddress(`${transaction.block} ${transaction.streetName}`)
      .then(res => {
        setGeocode(res);
        setIsGeocoding(false);
        if (res && res.LATITUDE && res.LONGITUDE) {
          const lat = parseFloat(res.LATITUDE);
          const lng = parseFloat(res.LONGITUDE);
          const nearest = findNearestMRT(lat, lng);
          // Calculate route to nearest MRT
          getOneMapRoute(lat, lng, nearest.station.lat, nearest.station.lng, routeType)
            .then(route => setRouteInfo(route));
        }
      })
      .catch(() => setIsGeocoding(false));
  }, [transaction, routeType]);

  if (!transaction) return null;

  const bsd = calculateBSD(transaction.resalePrice);
  const mortgageHdb = calculateMortgage({ price: transaction.resalePrice, loanType: 'HDB' });
  const mortgageBank = calculateMortgage({ price: transaction.resalePrice, loanType: 'Bank' });
  const balasFactor = getBalasTablePercentage(transaction.remainingLeaseYears);

  const nearestMrt = geocode && geocode.LATITUDE && geocode.LONGITUDE
    ? findNearestMRT(parseFloat(geocode.LATITUDE), parseFloat(geocode.LONGITUDE))
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
              <span>HDB RESALE RECORD</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">ID #{transaction.id}</span>
              <span aria-hidden="true">·</span>
              <span>{transaction.month}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {transaction.address}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="text-slate-200 font-medium">{transaction.town}</span>
              <span aria-hidden="true">·</span>
              <span>{transaction.isMature ? 'Mature Estate' : 'Non-Mature Estate'}</span>
              <span aria-hidden="true">·</span>
              <span>{transaction.flatType} ({transaction.flatModel})</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Banner */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">Transacted Resale Price</div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-white mt-0.5">
              ${transaction.resalePrice.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Rate per Unit Area</div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
              ${transaction.pricePerSqft.toLocaleString()} psf
            </div>
            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
              ${transaction.pricePerSqm.toLocaleString()} / sqm
            </div>
          </div>
        </div>

        {/* OneMap Geocoding & Transit Connectivity */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-semibold uppercase tracking-wider text-[11px]">
              <Compass className="w-3.5 h-3.5" />
              <span>Singapore OneMap Intelligence</span>
            </div>
            <span className="text-[11px] text-slate-500">SLA Official Geocoding</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-slate-400 text-[11px]">Official Building Identifier:</div>
              <div className="font-semibold text-slate-100 text-sm mt-0.5">
                {isGeocoding ? 'Querying OneMap...' : geocode?.BUILDING || transaction.address}
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5 font-mono">
                Postal: <span className="text-slate-300">{geocode?.POSTAL || 'Singapore'}</span> · SVY21 X/Y: {geocode?.X ? `${Math.round(Number(geocode.X))}, ${Math.round(Number(geocode.Y))}` : '—'}
              </div>
            </div>

            {nearestMrt && (
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-sky-400 font-medium">
                  <Train className="w-3.5 h-3.5" />
                  <span>Nearest: {nearestMrt.station.name}</span>
                </div>
                <div className="text-slate-300 mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold font-mono text-white">
                    {routeInfo ? `${routeInfo.durationMinutes} min` : `${nearestMrt.walkingMinutes} min`}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    ({routeInfo ? routeInfo.distanceMeters : nearestMrt.distanceMeters} meters)
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Route mode: <strong className="text-slate-400 uppercase">{routeType}</strong> {routeInfo?.source === 'onemap_api' ? '(OneMap Routing API)' : '(Geodesic)'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Floor Area</span>
            <span className="font-mono tabular-nums font-bold text-slate-100 text-sm mt-0.5 block">
              {transaction.floorAreaSqm} sqm
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              {transaction.floorAreaSqft} sqft
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Storey Level</span>
            <span className="font-semibold text-slate-100 text-sm mt-0.5 block">
              {transaction.storeyRange}
            </span>
            <span className="text-slate-500 text-[10px]">
              Storey band
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Remaining Lease</span>
            <span className="font-mono tabular-nums font-bold text-slate-100 text-sm mt-0.5 block">
              {transaction.remainingLeaseYears.toFixed(1)} yrs
            </span>
            <span className="text-slate-500 text-[10px]">
              Commenced {transaction.leaseCommenceDate}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Bala’s Residual</span>
            <span className="font-mono tabular-nums font-bold text-amber-400 text-sm mt-0.5 block">
              {balasFactor}%
            </span>
            <span className="text-slate-500 text-[10px]">
              SLA leasehold ratio
            </span>
          </div>
        </div>

        {/* Financial Estimates */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Financing & Stamp Duty Estimates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Buyer’s Stamp Duty (BSD)</span>
              <span className="font-mono tabular-nums font-bold text-rose-300 text-base mt-1 block">
                ${bsd.toLocaleString()}
              </span>
              <span className="text-slate-500 text-[10px]">IRAS Tiered Schedule</span>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-slate-400 block text-[11px]">HDB Loan (80% LTV, 2.6%)</span>
              <span className="font-mono tabular-nums font-bold text-emerald-400 text-base mt-1 block">
                ${mortgageHdb.monthlyInstallment.toLocaleString()} / mo
              </span>
              <span className="text-slate-500 text-[10px]">25 yr tenure</span>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Bank Loan (75% LTV, 3.0%)</span>
              <span className="font-mono tabular-nums font-bold text-slate-200 text-base mt-1 block">
                ${mortgageBank.monthlyInstallment.toLocaleString()} / mo
              </span>
              <span className="text-slate-500 text-[10px]">25 yr tenure</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          {onFilterByStreet && (
            <button
              onClick={() => {
                onFilterByStreet(transaction.streetName);
                onClose();
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Search other units on {transaction.streetName}</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onToggleCompare(transaction)}
              className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                isCompared
                  ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'In Compare List' : 'Add to Compare'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

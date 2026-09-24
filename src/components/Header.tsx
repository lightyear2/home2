import React from 'react';
import { Layers, TrendingUp, Building2, Calculator, Clock, DollarSign, Download, RefreshCw, MapPin, Key } from 'lucide-react';
import { getStoredOneMapToken } from '../services/onemapApi';

export type NavTab = 'explorer' | 'map' | 'million' | 'towns' | 'valuation' | 'lease' | 'mortgage';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  compareCount: number;
  onOpenCompare: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onExportCsv: () => void;
  onOpenTokenModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  compareCount,
  onOpenCompare,
  onRefresh,
  isRefreshing,
  onExportCsv,
  onOpenTokenModal
}) => {
  const hasToken = Boolean(getStoredOneMapToken());

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'explorer', label: 'Live Transactions', icon: Layers },
    { id: 'map', label: 'OneMap Geo-Explorer', icon: MapPin },
    { id: 'million', label: 'Million-Dollar Club', icon: TrendingUp },
    { id: 'towns', label: 'Town Matrix', icon: Building2 },
    { id: 'valuation', label: 'Valuation Estimator', icon: Calculator },
    { id: 'lease', label: 'Bala’s Lease Decay', icon: Clock },
    { id: 'mortgage', label: 'CPF & Affordability', icon: DollarSign }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('explorer')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-rose-950/50">
              SG
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors">
                SG FlatPulse
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400 ml-2">
                HDB &amp; OneMap Intelligence
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Nav Links - clean single-line controls */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-rose-400 border border-slate-700/80 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenTokenModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              hasToken
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="OneMap SLA API Token Settings"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{hasToken ? 'OneMap Active' : 'OneMap Token'}</span>
          </button>

          {compareCount > 0 && (
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded-md hover:bg-amber-900/40 transition-colors"
            >
              <span>Compare</span>
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {compareCount}
              </span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data.gov.sg feed"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-md border border-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
          </button>

          <button
            onClick={onExportCsv}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Mobile nav sub-bar */}
      <div className="lg:hidden border-t border-slate-800/60 px-4 py-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-slate-800 text-rose-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

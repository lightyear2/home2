import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { SearchFilters, SortField, SortOrder } from '../types/hdb';
import { HDB_TOWNS, FLAT_TYPES, POPULAR_FLAT_MODELS } from '../services/hdbApi';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (newFilters: Partial<SearchFilters>) => void;
  onReset: () => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  totalRecords: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  sortField,
  sortOrder,
  onSortChange,
  totalRecords
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const presets = [
    {
      label: 'All Transactions',
      isActive: !filters.town && !filters.flatType && !filters.onlyMillionDollar && !filters.query,
      action: () => onReset()
    },
    {
      label: 'Tampines 4-Room',
      isActive: filters.town === 'TAMPINES' && filters.flatType === '4 ROOM',
      action: () => onFilterChange({ town: 'TAMPINES', flatType: '4 ROOM', onlyMillionDollar: false })
    },
    {
      label: 'Million-Dollar Club',
      isActive: filters.onlyMillionDollar || filters.minPrice === 1000000,
      action: () => onFilterChange({ onlyMillionDollar: true, minPrice: 1000000 })
    },
    {
      label: 'Central Area',
      isActive: filters.town === 'CENTRAL AREA',
      action: () => onFilterChange({ town: 'CENTRAL AREA', onlyMillionDollar: false })
    },
    {
      label: '5-Room / Executive',
      isActive: filters.flatType === '5 ROOM',
      action: () => onFilterChange({ flatType: '5 ROOM' })
    },
    {
      label: 'Punggol Waterfront',
      isActive: filters.town === 'PUNGGOL',
      action: () => onFilterChange({ town: 'PUNGGOL' })
    }
  ];

  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const [field, order] = val.split(':') as [SortField, SortOrder];
    onSortChange(field, order);
  };

  const hasActiveFilters = Boolean(
    filters.town ||
    filters.flatType ||
    filters.flatModel ||
    filters.query ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minArea ||
    filters.onlyMillionDollar
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Search and primary filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search block, street name, or town (e.g. Tampines St 41, Cantonment Rd, 406)..."
            value={filters.query}
            onChange={(e) => onFilterChange({ query: e.target.value })}
            className="w-full pl-10 pr-9 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
          />
          {filters.query && (
            <button
              onClick={() => onFilterChange({ query: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Primary Selects */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          {/* Town Select */}
          <select
            value={filters.town || ''}
            onChange={(e) => onFilterChange({ town: e.target.value })}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="">All Towns (26)</option>
            {HDB_TOWNS.map(town => (
              <option key={town} value={town}>{town}</option>
            ))}
          </select>

          {/* Flat Type Select */}
          <select
            value={filters.flatType || ''}
            onChange={(e) => onFilterChange({ flatType: e.target.value })}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="">All Flat Types</option>
            {FLAT_TYPES.map(ft => (
              <option key={ft} value={ft}>{ft}</option>
            ))}
          </select>

          {/* Sort Select */}
          <div className="relative">
            <select
              value={`${sortField}:${sortOrder}`}
              onChange={handleSortSelect}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-rose-500 pr-7"
            >
              <option value="month:desc">Latest Transactions</option>
              <option value="resale_price:desc">Price: High to Low</option>
              <option value="resale_price:asc">Price: Low to High</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Advanced toggle button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 border rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showAdvanced || filters.minPrice || filters.maxPrice || filters.flatModel
                ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Quick Preset Segmented Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 text-xs font-medium shrink-0 mr-1">Presets:</span>
        {presets.map(p => (
          <button
            key={p.label}
            onClick={p.action}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              p.isActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            {p.label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-2 py-1 text-slate-400 hover:text-rose-400 text-xs ml-auto shrink-0 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Flat Model */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Flat Model</label>
            <select
              value={filters.flatModel || ''}
              onChange={(e) => onFilterChange({ flatModel: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200"
            >
              <option value="">All Models</option>
              {POPULAR_FLAT_MODELS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Min Price (SGD)</label>
            <input
              type="number"
              placeholder="e.g. 400000"
              step="50000"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 font-mono"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Max Price (SGD)</label>
            <input
              type="number"
              placeholder="e.g. 1200000"
              step="50000"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 font-mono"
            />
          </div>

          {/* Min Remaining Lease */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Min Lease (Years)</label>
            <input
              type="number"
              placeholder="e.g. 70"
              min="20"
              max="99"
              value={filters.minLeaseYears || ''}
              onChange={(e) => onFilterChange({ minLeaseYears: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
};

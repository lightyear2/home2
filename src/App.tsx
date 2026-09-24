import React from 'react';
import { Header, NavTab } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { MarketExplorer } from './components/MarketExplorer';
import { OneMapInteractiveViewer } from './components/OneMapInteractiveViewer';
import { MillionDollarClub } from './components/MillionDollarClub';
import { TownMatrix } from './components/TownMatrix';
import { ValuationEstimator } from './components/ValuationEstimator';
import { LeaseDecayCalculator } from './components/LeaseDecayCalculator';
import { MortgageCalculator } from './components/MortgageCalculator';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { CompareDrawer } from './components/CompareDrawer';
import { OneMapTokenModal } from './components/OneMapTokenModal';
import { SearchFilters, SortField, SortOrder, HDBTransaction } from './types/hdb';
import { fetchTransactions } from './services/hdbApi';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<NavTab>('explorer');
  const [transactions, setTransactions] = React.useState<HDBTransaction[]>([]);
  const [totalRecords, setTotalRecords] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const pageSize = 50;

  const [sortField, setSortField] = React.useState<SortField>('month');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');

  const [filters, setFilters] = React.useState<SearchFilters>({
    town: '',
    flatType: '',
    flatModel: '',
    query: ''
  });

  const [selectedTx, setSelectedTx] = React.useState<HDBTransaction | null>(null);
  const [compareList, setCompareList] = React.useState<HDBTransaction[]>([]);
  const [isCompareOpen, setIsCompareOpen] = React.useState<boolean>(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = React.useState<boolean>(false);
  const [tokenVersion, setTokenVersion] = React.useState<number>(0);

  // Load transactions whenever page, sort, or filters change
  const loadData = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const sortParam = `${sortField} ${sortOrder}`;
      const offset = (currentPage - 1) * pageSize;
      const res = await fetchTransactions({
        limit: pageSize,
        offset,
        sort: sortParam,
        filters
      });
      setTransactions(res.records);
      setTotalRecords(res.total);
    } catch (err) {
      console.error('Failed to load HDB data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, sortField, sortOrder, filters]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      town: '',
      flatType: '',
      flatModel: '',
      query: ''
    });
    setCurrentPage(1);
    setSortField('month');
    setSortOrder('desc');
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleToggleCompare = (tx: HDBTransaction) => {
    setCompareList(prev => {
      const exists = prev.some(item => item.id === tx.id);
      if (exists) {
        return prev.filter(item => item.id !== tx.id);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], tx];
      }
      return [...prev, tx];
    });
  };

  const handleSelectTownFromMatrix = (town: string) => {
    handleFilterChange({ town });
    setActiveTab('explorer');
  };

  const handleFilterByStreet = (street: string) => {
    handleFilterChange({ query: street });
    setActiveTab('explorer');
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) return;
    const headers = [
      'Transaction ID',
      'Registration Month',
      'Town',
      'Flat Type',
      'Block',
      'Street Name',
      'Storey Range',
      'Floor Area (sqm)',
      'Floor Area (sqft)',
      'Flat Model',
      'Lease Commencement Year',
      'Remaining Lease',
      'Resale Price (SGD)',
      'Price per Sqft (SGD)',
      'Price per Sqm (SGD)'
    ];

    const rows = transactions.map(t => [
      t.id,
      t.month,
      `"${t.town}"`,
      `"${t.flatType}"`,
      `"${t.block}"`,
      `"${t.streetName}"`,
      `"${t.storeyRange}"`,
      t.floorAreaSqm,
      t.floorAreaSqft,
      `"${t.flatModel}"`,
      t.leaseCommenceDate,
      `"${t.remainingLease}"`,
      t.resalePrice,
      t.pricePerSqft,
      t.pricePerSqm
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hdb_resale_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Universal Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        compareCount={compareList.length}
        onOpenCompare={() => setIsCompareOpen(true)}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        onExportCsv={handleExportCsv}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              totalRecords={totalRecords}
            />

            <MarketExplorer
              transactions={transactions}
              isLoading={isLoading}
              totalRecords={totalRecords}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onSelectTransaction={setSelectedTx}
              onToggleCompare={handleToggleCompare}
              compareList={compareList}
              activeTownFilter={filters.town}
              activeTypeFilter={filters.flatType}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              totalRecords={totalRecords}
            />

            <OneMapInteractiveViewer
              key={tokenVersion}
              transactions={transactions}
              onSelectTransaction={setSelectedTx}
              activeTownFilter={filters.town}
              onOpenTokenModal={() => setIsTokenModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'million' && (
          <MillionDollarClub
            onSelectTransaction={setSelectedTx}
            onToggleCompare={handleToggleCompare}
            compareList={compareList}
          />
        )}

        {activeTab === 'towns' && (
          <TownMatrix onSelectTown={handleSelectTownFromMatrix} />
        )}

        {activeTab === 'valuation' && (
          <ValuationEstimator onSelectTransaction={setSelectedTx} />
        )}

        {activeTab === 'lease' && (
          <LeaseDecayCalculator />
        )}

        {activeTab === 'mortgage' && (
          <MortgageCalculator />
        )}
      </main>

      {/* Modals & Drawers */}
      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onToggleCompare={handleToggleCompare}
        isCompared={selectedTx ? compareList.some(c => c.id === selectedTx.id) : false}
        onFilterByStreet={handleFilterByStreet}
      />

      <CompareDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        compareList={compareList}
        onRemove={(id) => setCompareList(prev => prev.filter(t => t.id !== id))}
        onClear={() => setCompareList([])}
        onSelectTransaction={(tx) => {
          setIsCompareOpen(false);
          setSelectedTx(tx);
        }}
      />

      <OneMapTokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onTokenUpdated={() => {
          setTokenVersion(v => v + 1);
        }}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Data sourced from <a href="https://data.gov.sg" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white underline">data.gov.sg</a> HDB Resale Flat Prices Dataset (Jan 2017 &ndash; Present).
          </div>
          <div className="flex items-center gap-4">
            <span>OneMap Singapore SLA Geocoding &amp; Routing</span>
            <span aria-hidden="true">&middot;</span>
            <span>Bala’s Table compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

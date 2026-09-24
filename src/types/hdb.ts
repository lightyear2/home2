export interface RawHDBRecord {
  _id: number;
  month: string; // YYYY-MM
  town: string;
  flat_type: string;
  block: string;
  street_name: string;
  storey_range: string;
  floor_area_sqm: string;
  flat_model: string;
  lease_commence_date: string;
  remaining_lease: string;
  resale_price: string;
}

export interface HDBTransaction {
  id: number;
  month: string; // YYYY-MM
  town: string;
  flatType: string;
  block: string;
  streetName: string;
  address: string;
  storeyRange: string;
  floorAreaSqm: number;
  floorAreaSqft: number;
  flatModel: string;
  leaseCommenceDate: number;
  remainingLease: string;
  remainingLeaseYears: number;
  resalePrice: number;
  pricePerSqm: number;
  pricePerSqft: number;
  isMature: boolean;
  isMillionDollar: boolean;
}

export interface SearchFilters {
  town: string;
  flatType: string;
  flatModel: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  storeyRange?: string;
  minLeaseYears?: number;
  query: string;
  onlyMillionDollar?: boolean;
}

export type SortField = 'month' | 'resale_price' | 'price_psm' | 'floor_area_sqm' | 'remaining_lease';
export type SortOrder = 'asc' | 'desc';

export interface TownStat {
  town: string;
  isMature: boolean;
  region: 'Central' | 'East' | 'North-East' | 'North' | 'West';
  medianPrice: number;
  avgPsf: number;
  avgPsm: number;
  totalTransactions: number;
  millionCount: number;
  popularType: string;
  avgRemainingLease: number;
}

export interface ValuationEstimate {
  estimatedPrice: number;
  minRange: number;
  maxRange: number;
  estimatedPsf: number;
  estimatedPsm: number;
  balaResidualPct: number;
  confidenceScore: number;
  comparables: HDBTransaction[];
}

export interface MortgageResult {
  propertyPrice: number;
  loanType: 'HDB' | 'Bank';
  ltvPct: number;
  loanAmount: number;
  downpaymentTotal: number;
  downpaymentCpf: number;
  downpaymentCash: number;
  bsdAmount: number;
  monthlyInstallment: number;
  totalInterest: number;
  minMonthlyIncomeRequired: number; // Based on 30% MSR
  tenureYears: number;
  interestRate: number;
}

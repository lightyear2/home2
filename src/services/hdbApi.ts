import { HDBTransaction, RawHDBRecord, SearchFilters, TownStat, ValuationEstimate, MortgageResult } from '../types/hdb';

export const DATASET_RESOURCE_ID = 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc';
export const BASE_API_URL = 'https://data.gov.sg/api/action/datastore_search';

export const HDB_TOWNS = [
  'ANG MO KIO',
  'BEDOK',
  'BISHAN',
  'BUKIT BATOK',
  'BUKIT MERAH',
  'BUKIT PANJANG',
  'BUKIT TIMAH',
  'CENTRAL AREA',
  'CHOA CHU KANG',
  'CLEMENTI',
  'GEYLANG',
  'HOUGANG',
  'JURONG EAST',
  'JURONG WEST',
  'KALLANG/WHAMPOA',
  'MARINE PARADE',
  'PASIR RIS',
  'PUNGGOL',
  'QUEENSTOWN',
  'SEMBAWANG',
  'SENGKANG',
  'SERANGOON',
  'TAMPINES',
  'TOA PAYOH',
  'WOODLANDS',
  'YISHUN'
] as const;

export const MATURE_ESTATES = new Set([
  'ANG MO KIO',
  'BEDOK',
  'BISHAN',
  'BUKIT MERAH',
  'BUKIT TIMAH',
  'CENTRAL AREA',
  'CLEMENTI',
  'GEYLANG',
  'KALLANG/WHAMPOA',
  'MARINE PARADE',
  'PASIR RIS',
  'QUEENSTOWN',
  'SERANGOON',
  'TAMPINES',
  'TOA PAYOH'
]);

export const TOWN_REGIONS: Record<string, 'Central' | 'East' | 'North-East' | 'North' | 'West'> = {
  'CENTRAL AREA': 'Central',
  'BUKIT MERAH': 'Central',
  'QUEENSTOWN': 'Central',
  'BISHAN': 'Central',
  'TOA PAYOH': 'Central',
  'BUKIT TIMAH': 'Central',
  'KALLANG/WHAMPOA': 'Central',
  'MARINE PARADE': 'Central',
  'GEYLANG': 'Central',
  'TAMPINES': 'East',
  'BEDOK': 'East',
  'PASIR RIS': 'East',
  'SENGKANG': 'North-East',
  'PUNGGOL': 'North-East',
  'HOUGANG': 'North-East',
  'SERANGOON': 'North-East',
  'ANG MO KIO': 'North-East',
  'WOODLANDS': 'North',
  'YISHUN': 'North',
  'SEMBAWANG': 'North',
  'JURONG WEST': 'West',
  'JURONG EAST': 'West',
  'CLEMENTI': 'West',
  'BUKIT BATOK': 'West',
  'CHOA CHU KANG': 'West',
  'BUKIT PANJANG': 'West'
};

export const FLAT_TYPES = [
  '1 ROOM',
  '2 ROOM',
  '3 ROOM',
  '4 ROOM',
  '5 ROOM',
  'EXECUTIVE',
  'MULTI-GENERATION'
] as const;

export const POPULAR_FLAT_MODELS = [
  'Model A',
  'Improved',
  'New Generation',
  'Premium Apartment',
  'Apartment',
  'Maisonette',
  'DBSS',
  'Simplified',
  'Standard',
  'Type S1',
  'Type S2',
  'Terrace'
] as const;

// In-memory cache for API calls to prevent redundant requests
const queryCache = new Map<string, { data: HDBTransaction[]; total: number; timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes

export function parseRemainingLease(leaseStr: string, commenceYear?: number): number {
  if (!leaseStr) {
    if (commenceYear) {
      const currentYear = new Date().getFullYear();
      const elapsed = currentYear - commenceYear;
      return Math.max(0, 99 - elapsed);
    }
    return 60;
  }
  const yearMatch = leaseStr.match(/(\d+)\s*years?/i);
  const monthMatch = leaseStr.match(/(\d+)\s*months?/i);
  const years = yearMatch ? parseInt(yearMatch[1], 10) : 0;
  const months = monthMatch ? parseInt(monthMatch[1], 10) : 0;
  return Number((years + months / 12).toFixed(2));
}

export function transformRecord(r: RawHDBRecord): HDBTransaction {
  const price = parseFloat(r.resale_price) || 0;
  const sqm = parseFloat(r.floor_area_sqm) || 1;
  const sqft = Math.round(sqm * 10.7639);
  const psm = Math.round(price / sqm);
  const psf = Math.round(price / sqft);
  const commenceYear = parseInt(r.lease_commence_date, 10) || 1990;
  const leaseYears = parseRemainingLease(r.remaining_lease, commenceYear);
  const townUpper = r.town ? r.town.toUpperCase().trim() : '';

  return {
    id: r._id,
    month: r.month,
    town: townUpper,
    flatType: r.flat_type,
    block: r.block,
    streetName: r.street_name,
    address: `Blk ${r.block} ${r.street_name}`,
    storeyRange: r.storey_range,
    floorAreaSqm: sqm,
    floorAreaSqft: sqft,
    flatModel: r.flat_model,
    leaseCommenceDate: commenceYear,
    remainingLease: r.remaining_lease || `${Math.floor(leaseYears)} years`,
    remainingLeaseYears: leaseYears,
    resalePrice: price,
    pricePerSqm: psm,
    pricePerSqft: psf,
    isMature: MATURE_ESTATES.has(townUpper),
    isMillionDollar: price >= 1000000
  };
}

export interface FetchTransactionsParams {
  limit?: number;
  offset?: number;
  sort?: string;
  filters?: Partial<SearchFilters>;
}

export async function fetchTransactions(params: FetchTransactionsParams = {}): Promise<{
  records: HDBTransaction[];
  total: number;
}> {
  const { limit = 50, offset = 0, sort = 'month desc', filters } = params;

  const url = new URL(BASE_API_URL);
  url.searchParams.set('resource_id', DATASET_RESOURCE_ID);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  if (sort) {
    url.searchParams.set('sort', sort);
  }

  // Construct filters object
  const apiFilters: Record<string, string> = {};
  if (filters?.town && filters.town !== 'ALL') {
    apiFilters.town = filters.town;
  }
  if (filters?.flatType && filters.flatType !== 'ALL') {
    apiFilters.flat_type = filters.flatType;
  }
  if (filters?.flatModel && filters.flatModel !== 'ALL') {
    apiFilters.flat_model = filters.flatModel;
  }

  if (Object.keys(apiFilters).length > 0) {
    url.searchParams.set('filters', JSON.stringify(apiFilters));
  }

  if (filters?.query?.trim()) {
    url.searchParams.set('q', filters.query.trim());
  }

  const cacheKey = url.toString();
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { records: cached.data, total: cached.total };
  }

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Data.gov.sg API returned status ${res.status}`);
    }
    const json = await res.json();
    if (!json.success || !json.result) {
      throw new Error('Invalid response structure from Data.gov.sg');
    }

    let records: HDBTransaction[] = (json.result.records || []).map(transformRecord);
    const total = json.result.total || records.length;

    // Client-side additional filtering if min/max price, area, or lease applied
    if (filters?.minPrice || filters?.maxPrice || filters?.minArea || filters?.maxArea || filters?.minLeaseYears || filters?.onlyMillionDollar) {
      records = records.filter(r => {
        if (filters.minPrice && r.resalePrice < filters.minPrice) return false;
        if (filters.maxPrice && r.resalePrice > filters.maxPrice) return false;
        if (filters.minArea && r.floorAreaSqm < filters.minArea) return false;
        if (filters.maxArea && r.floorAreaSqm > filters.maxArea) return false;
        if (filters.minLeaseYears && r.remainingLeaseYears < filters.minLeaseYears) return false;
        if (filters.onlyMillionDollar && !r.isMillionDollar) return false;
        return true;
      });
    }

    queryCache.set(cacheKey, { data: records, total, timestamp: Date.now() });
    return { records, total };
  } catch (err) {
    console.error('Error fetching HDB transactions:', err);
    throw err;
  }
}

/**
 * Fetch top million-dollar transactions
 */
export async function fetchMillionDollarTransactions(limit = 100): Promise<HDBTransaction[]> {
  const url = new URL(BASE_API_URL);
  url.searchParams.set('resource_id', DATASET_RESOURCE_ID);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('sort', 'resale_price desc');

  const cacheKey = `million_dollar_${limit}`;
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const res = await fetch(url.toString());
  const json = await res.json();
  const records = (json.result?.records || []).map(transformRecord).filter((r: HDBTransaction) => r.resalePrice >= 1000000);
  queryCache.set(cacheKey, { data: records, total: records.length, timestamp: Date.now() });
  return records;
}

/**
 * SLA Bala's Table standard values
 * Returns the estimated leasehold value percentage relative to freehold value (0 - 100%)
 */
export function getBalasTablePercentage(remainingYears: number): number {
  const capped = Math.max(0, Math.min(99, remainingYears));
  // SLA Official points:
  const anchorPoints = [
    { y: 0, v: 0.0 },
    { y: 5, v: 12.0 },
    { y: 10, v: 21.0 },
    { y: 15, v: 30.0 },
    { y: 20, v: 38.5 },
    { y: 25, v: 45.5 },
    { y: 30, v: 51.5 },
    { y: 35, v: 58.0 },
    { y: 40, v: 63.4 },
    { y: 45, v: 68.2 },
    { y: 50, v: 72.5 },
    { y: 55, v: 76.5 },
    { y: 60, v: 80.0 },
    { y: 65, v: 83.3 },
    { y: 70, v: 86.4 },
    { y: 75, v: 89.0 },
    { y: 80, v: 90.7 },
    { y: 85, v: 92.4 },
    { y: 90, v: 93.8 },
    { y: 95, v: 95.1 },
    { y: 99, v: 96.0 }
  ];

  for (let i = 0; i < anchorPoints.length - 1; i++) {
    const p1 = anchorPoints[i];
    const p2 = anchorPoints[i + 1];
    if (capped >= p1.y && capped <= p2.y) {
      const ratio = (capped - p1.y) / (p2.y - p1.y);
      return Number((p1.v + ratio * (p2.v - p1.v)).toFixed(1));
    }
  }
  return 96.0;
}

/**
 * Calculate Singapore Buyer's Stamp Duty (residential property)
 */
export function calculateBSD(price: number): number {
  if (price <= 0) return 0;
  let bsd = 0;
  // Tier 1: First $180k @ 1%
  const t1 = Math.min(price, 180000);
  bsd += t1 * 0.01;

  // Tier 2: Next $180k ($180k - $360k) @ 2%
  if (price > 180000) {
    const t2 = Math.min(price - 180000, 180000);
    bsd += t2 * 0.02;
  }

  // Tier 3: Next $640k ($360k - $1,000,000) @ 3%
  if (price > 360000) {
    const t3 = Math.min(price - 360000, 640000);
    bsd += t3 * 0.03;
  }

  // Tier 4: Next $500k ($1,000,000 - $1,500,000) @ 4%
  if (price > 1000000) {
    const t4 = Math.min(price - 1000000, 500000);
    bsd += t4 * 0.04;
  }

  // Tier 5: Next $1,500,000 ($1,500,000 - $3,000,000) @ 5%
  if (price > 1500000) {
    const t5 = Math.min(price - 1500000, 1500000);
    bsd += t5 * 0.05;
  }

  // Tier 6: Above $3,000,000 @ 6%
  if (price > 3000000) {
    bsd += (price - 3000000) * 0.06;
  }

  return Math.round(bsd);
}

/**
 * Calculate Monthly Mortgage & Affordability under Singapore regulations
 */
export function calculateMortgage(params: {
  price: number;
  loanType: 'HDB' | 'Bank';
  tenureYears?: number;
  interestRate?: number;
  buyerAge?: number;
}): MortgageResult {
  const { price, loanType } = params;
  const isHdb = loanType === 'HDB';
  const ltvPct = isHdb ? 0.80 : 0.75;
  const interestRate = params.interestRate ?? (isHdb ? 2.6 : 3.0);
  const maxTenure = isHdb ? 25 : 30;
  const tenureYears = Math.min(params.tenureYears ?? 25, maxTenure);

  const loanAmount = Math.round(price * ltvPct);
  const downpaymentTotal = price - loanAmount;
  // For Bank loan: min 5% must be cash, rest can be CPF OA
  const downpaymentCash = isHdb ? 0 : Math.round(price * 0.05);
  const downpaymentCpf = downpaymentTotal - downpaymentCash;

  const monthlyRate = (interestRate / 100) / 12;
  const totalMonths = tenureYears * 12;

  let monthlyInstallment = 0;
  if (monthlyRate > 0 && totalMonths > 0) {
    monthlyInstallment = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  }

  const totalPayment = monthlyInstallment * totalMonths;
  const totalInterest = Math.max(0, totalPayment - loanAmount);
  const bsdAmount = calculateBSD(price);

  // Singapore MSR rule: HDB monthly installment must not exceed 30% of gross monthly income
  const minMonthlyIncomeRequired = Math.round(monthlyInstallment / 0.30);

  return {
    propertyPrice: price,
    loanType,
    ltvPct: ltvPct * 100,
    loanAmount,
    downpaymentTotal,
    downpaymentCpf,
    downpaymentCash,
    bsdAmount,
    monthlyInstallment,
    totalInterest,
    minMonthlyIncomeRequired,
    tenureYears,
    interestRate
  };
}

/**
 * Valuation Estimator using CMA (Comparative Market Analysis)
 */
export async function estimateValuation(params: {
  town: string;
  flatType: string;
  floorAreaSqm: number;
  storeyTier: 'Low (01-06)' | 'Mid (07-15)' | 'High (16-25)' | 'Very High (26+)';
  remainingLeaseYears: number;
}): Promise<ValuationEstimate> {
  // Query recent transactions matching town and flat type
  const { records } = await fetchTransactions({
    limit: 60,
    sort: 'month desc',
    filters: {
      town: params.town,
      flatType: params.flatType
    }
  });

  if (records.length === 0) {
    // Fallback benchmark if no recent transactions
    const basePsm = params.town === 'CENTRAL AREA' || params.town === 'QUEENSTOWN' ? 8500 : 5500;
    const est = basePsm * params.floorAreaSqm;
    return {
      estimatedPrice: Math.round(est),
      minRange: Math.round(est * 0.93),
      maxRange: Math.round(est * 1.07),
      estimatedPsf: Math.round(basePsm / 10.7639),
      estimatedPsm: basePsm,
      balaResidualPct: getBalasTablePercentage(params.remainingLeaseYears),
      confidenceScore: 65,
      comparables: []
    };
  }

  // Calculate base median price per sqm from recent records
  const psmValues = records.map(r => r.pricePerSqm).sort((a, b) => a - b);
  const medianPsm = psmValues[Math.floor(psmValues.length / 2)];

  // Adjust for storey tier
  let storeyFactor = 1.0;
  if (params.storeyTier === 'Low (01-06)') storeyFactor = 0.96;
  else if (params.storeyTier === 'Mid (07-15)') storeyFactor = 1.0;
  else if (params.storeyTier === 'High (16-25)') storeyFactor = 1.05;
  else if (params.storeyTier === 'Very High (26+)') storeyFactor = 1.12;

  // Adjust for lease decay difference vs median lease in sample
  const avgSampleLease = records.reduce((acc, r) => acc + r.remainingLeaseYears, 0) / records.length;
  const leaseDiff = params.remainingLeaseYears - avgSampleLease;
  const leaseFactor = 1 + (leaseDiff * 0.006); // ~0.6% adjustment per year difference

  const finalPsm = Math.round(medianPsm * storeyFactor * leaseFactor);
  const estimatedPrice = Math.round(finalPsm * params.floorAreaSqm);
  const estimatedPsf = Math.round(finalPsm / 10.7639);

  return {
    estimatedPrice,
    minRange: Math.round(estimatedPrice * 0.94),
    maxRange: Math.round(estimatedPrice * 1.06),
    estimatedPsf,
    estimatedPsm: finalPsm,
    balaResidualPct: getBalasTablePercentage(params.remainingLeaseYears),
    confidenceScore: Math.min(95, 70 + Math.min(25, records.length)),
    comparables: records.slice(0, 5)
  };
}

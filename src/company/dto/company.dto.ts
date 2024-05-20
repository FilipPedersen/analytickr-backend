export interface CompanyDto {
  company: Company;
  growthMetrics: GrowthMetrics;
  valuation: Valuation;
  technicals: Technicals;
  marketCap: number;
  dividend: number;
  grossMargin: number;
  quarterly: ChartData[];
  yearly: ChartData[];
}

export interface Technicals {
  '52weekHigh': number;
  '52weekLow': number;
  revenue: number;
  wallStreetTargetPrice: number;
  ebitda: number;
}

export interface ChartData {
  labels: string[];
  label: string;
  color: string;
  chartType: string;
  data: number[];
}
export interface Valuation {
  peRatio: number;
  forwardPeRatio: number;
  psRatio: number;
  pbRatio: number;
}

export interface GrowthMetrics {
  revenueGrowthYoY: number;
  profitsGrowthYoY: number;
}

export interface Company {
  name: string;
  ticker: string;
  sector: string;
  industry: string;
  currencySymbol: string;
  exchange: string;
}

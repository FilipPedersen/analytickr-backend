export interface CompanyDto {
  company: {
    name: string;
    ticker: string;
    sector: string;
    industry: string;
    currencySymbol: string;
    exchange: string;
  };
  growthMetrics: {
    revenueGrowthYoY: number;
    profitsGrowthYoY: number;
  };
  valuation: {
    peRatio: number;
    forwardPeRatio: number;
    psRatio: number;
    pbRatio: number;
  };
  marketCap: number;
  dividend: number;
  grossMargin: number;
  quarterly: ChartDto;
  yearly: ChartDto;
}

export interface ChartDto {
  labels: string[];
  datasets: {
    label: string;
    color: string;
    data: number[];
  }[];
}

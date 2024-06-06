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
    companyInformation: CompanyInformation;
    ownership: Ownership;
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
    chartType: string;
    datasets: Dataset[];
    metric: string;
}

export interface Dataset {
    data: number[];
    label: string;
    color: string;
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
    logoUrl: string;
    ticker: string;
    sector: string;
    industry: string;
    currencySymbol: string;
    exchange: string;
}

export interface CompanyInformation {
    ceo: string;
    employees: number;
    headquarters: string;
    industry: string;
    website: string;
    shortInterest: number;
    sharesShort: number;
}

export interface Ownership {
    institutionalOwners: InstitutionalOwner[];
    institutionalBreakdown: PieChart;
}

export interface PieChart {
    labels: string[];
    datasets: [
        {
            data: number[];
            backgroundColor: string[];
        },
    ];
}

export interface InstitutionalOwner {
    name: string;
    totalShares: number;
}

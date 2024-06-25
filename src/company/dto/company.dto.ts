export interface CompanyDto {
    company: Company;
    growthMetrics: GrowthMetrics;
    valuation: Valuation;
    technicals: Technicals;
    marketCap: number;
    volume: number;
    price: number;
    changes: number;
    dividend: number;
    grossMargin: number;
    quarterly: ChartData[];
    yearly: ChartData[];
    companyInformation: CompanyInformation;
    ownership: Ownership;
}

export interface Technicals {
    range: string;
    revenue: number;
    wallStreetTargetPrice: number;
    ebitda: number;
}

export interface ChartData {
    label: string;
    chartType: string;
    emoji?: string;
    datasets: Dataset[];
    metric: string;
    labels: string[];
    stacked: boolean;
    showXAxis: boolean;
}

export interface Dataset {
    data: number[];
    label?: string;
    tension?: number;
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
    employees: string;
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

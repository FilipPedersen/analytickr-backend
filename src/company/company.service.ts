import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
    CompanyDto,
    ChartData,
    Company,
    GrowthMetrics,
    Valuation,
    Technicals,
    CompanyInformation,
    Ownership,
    InstitutionalOwner,
    PieChart,
} from './dto/company.dto';
import { IncomeStatementDto } from './dto/income-statement.dto';
import { CashFlowDto } from './dto/cash-flow.dto';
import { BalanceSheetDto } from './dto/balance-sheet.dto';
import {
    CompanyOutlookDto,
    FinancialDataDto,
    MetricDto,
    ProfileDto,
    RatioDto,
} from './dto/company-outlook.dto';
import { CompanySharesDto } from './dto/company-shares.dto';

@Injectable()
export class CompanyService {
    private readonly apiKey: string;
    private readonly logger = new Logger(CompanyService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('FMP_API_KEY');
    }

    async getCompanyData(ticker: string): Promise<CompanyDto> {
        this.logger.debug(`Fetching data for ticker: ${ticker}`);

        const [
            companyOutlookData,
            cashFlowDataQuarterly,
            cashFlowDataAnnual,
            incomeStatementQuarter,
            incomeStatementAnnual,
            balanceSheetQuarter,
            balanceSheetAnnual,
            ownershipData,
            companySharesData,
        ] = await Promise.all([
            this.fetchData<CompanyOutlookDto>(
                `https://financialmodelingprep.com/api/v4/company-outlook?symbol=${ticker}&apikey=${this.apiKey}`,
            ),
            this.fetchData<CashFlowDto[]>(
                `https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?period=quarter&apikey=${this.apiKey}`,
            ),
            this.fetchData<CashFlowDto[]>(
                `https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?period=annual&apikey=${this.apiKey}`,
            ),
            this.fetchData<IncomeStatementDto[]>(
                `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=quarter&apikey=${this.apiKey}`,
            ),
            this.fetchData<IncomeStatementDto[]>(
                `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${this.apiKey}`,
            ),
            this.fetchData<BalanceSheetDto[]>(
                `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?period=quarter&apikey=${this.apiKey}`,
            ),
            this.fetchData<BalanceSheetDto[]>(
                `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?period=annual&apikey=${this.apiKey}`,
            ),
            this.fetchData<any[]>(
                `https://financialmodelingprep.com/api/v3/institutional-holder/${ticker}?apikey=${this.apiKey}`,
            ),
            this.fetchData<CompanySharesDto[]>(
                `https://financialmodelingprep.com/api/v4/shares_float?${ticker}&apikey=${this.apiKey}`,
            ),
        ]);
        console.log(companySharesData);
        const profile = companyOutlookData.profile;
        const metrics = companyOutlookData.metrics;
        const ratios = companyOutlookData.ratios[0];
        const financial = companyOutlookData.financialsQuarter.income[0];

        const companyDto: CompanyDto = {
            company: this.mapCompanyProfile(profile),
            growthMetrics: this.mapGrowthMetrics(metrics),
            valuation: this.mapValuation(ratios),
            technicals: {
                range: profile.range,
                revenue: financial.revenue,
                wallStreetTargetPrice: 0, // configure later
                ebitda: financial.ebitda,
            },
            marketCap: profile.mktCap,
            dividend: ratios.dividendYielPercentageTTM,
            grossMargin: ratios.grossProfitMarginTTM,
            quarterly: this.getChartData(
                cashFlowDataQuarterly,
                incomeStatementQuarter,
                balanceSheetQuarter,
                'quarterly',
            ),
            yearly: this.getChartData(
                cashFlowDataAnnual,
                incomeStatementAnnual,
                balanceSheetAnnual,
                'yearly',
            ),
            companyInformation: this.mapCompanyInformation(profile),
            ownership: this.mapOwnership(ownershipData, companySharesData),
        };

        return companyDto;
    }

    private async fetchData<T>(url: string): Promise<T> {
        this.logger.debug(`Fetching data from URL: ${url}`);
        try {
            const response = await lastValueFrom(
                this.httpService
                    .get(url)
                    .pipe(map((response) => response.data)),
            );
            return response as T;
        } catch (error) {
            this.logger.error(
                `Error fetching data from URL: ${url}`,
                error.stack,
            );
            throw error;
        }
    }

    private mapCompanyProfile(profile: ProfileDto): Company {
        return {
            name: profile.companyName,
            logoUrl: profile.image,
            ticker: profile.symbol,
            sector: profile.sector,
            industry: profile.industry,
            currencySymbol: profile.currency,
            exchange: profile.exchangeShortName,
        };
    }

    private mapTechnicals(
        profile: ProfileDto,
        financialData: FinancialDataDto,
    ): Technicals {
        return {
            range: profile.range,
            revenue: financialData.revenue,
            wallStreetTargetPrice: 0, // configure later
            ebitda: financialData.ebitda,
        };
    }

    private mapGrowthMetrics(metrics: any): GrowthMetrics {
        return {
            revenueGrowthYoY: metrics.revenueGrowthYoY, // configure later
            profitsGrowthYoY: metrics.profitsGrowthYoY, // configure later
        };
    }

    private mapValuation(ratios: RatioDto): Valuation {
        return {
            peRatio: ratios.peRatioTTM,
            forwardPeRatio: ratios.peRatioTTM, // Update this if forward PE is available elsewhere
            psRatio: ratios.priceToSalesRatioTTM,
            pbRatio: ratios.priceToBookRatioTTM,
        };
    }

    private mapCompanyInformation(profile: ProfileDto): CompanyInformation {
        return {
            ceo: profile.ceo,
            employees: profile.fullTimeEmployees,
            headquarters: `${profile.address}, ${profile.city}, ${profile.state}, ${profile.zip}`,
            industry: profile.industry,
            website: profile.website,
            shortInterest: 0, // Update if this data is available
            sharesShort: 0, // Update if this data is available
        };
    }

    private getChartData(
        cashFlowData: any[],
        incomeStatementData: any[],
        balanceSheetData: any[],
        period: 'quarterly' | 'yearly',
    ): ChartData[] {
        const cashFlowLabels = this.getLabels(cashFlowData, period);
        const incomeStatementLabels = this.getLabels(
            incomeStatementData,
            period,
        );
        const balanceSheetLabels = this.getLabels(balanceSheetData, period);

        const netIncomeData = this.getDataForLabels(
            cashFlowData,
            cashFlowLabels,
            'netIncome',
            period,
            'millions',
        );
        const totalRevenue = this.getDataForLabels(
            incomeStatementData,
            incomeStatementLabels,
            'revenue',
            period,
            'millions',
        );
        const sellingGeneralAndAdministrativeExpenses = this.getDataForLabels(
            incomeStatementData,
            incomeStatementLabels,
            'sellingGeneralAndAdministrativeExpenses',
            period,
            'millions',
        );
        const researchAndDevelopmentExpenses = this.getDataForLabels(
            incomeStatementData,
            incomeStatementLabels,
            'researchAndDevelopmentExpenses',
            period,
            'millions',
        );
        const freeCashFlow = this.getDataForLabels(
            cashFlowData,
            cashFlowLabels,
            'freeCashFlow',
            period,
            'millions',
        );
        const sharesOutstanding = this.getDataForLabels(
            incomeStatementData,
            incomeStatementLabels,
            'weightedAverageShsOut',
            period,
            'millions',
        );

        const cashVsDebt = this.getCashVsDebtData(
            balanceSheetData,
            balanceSheetLabels,
            period,
            'bar',
            'Cash vs Debt',
        );

        return [
            {
                labels: cashFlowLabels,
                label: 'Net Income',
                datasets: [
                    {
                        data: netIncomeData.data,
                        color: 'grey',
                    },
                ],
                metric: netIncomeData.metric,
                chartType: 'bar',
            },
            {
                labels: incomeStatementLabels,
                label: 'Revenue',
                datasets: [
                    {
                        data: totalRevenue.data,
                        color: 'blue',
                    },
                ],
                metric: totalRevenue.metric,
                chartType: 'bar',
            },
            {
                labels: cashFlowLabels,
                label: 'Free Cashflow',
                datasets: [
                    {
                        data: freeCashFlow.data,
                        color: 'green',
                    },
                ],
                metric: freeCashFlow.metric,
                chartType: 'bar',
            },
            {
                labels: incomeStatementLabels,
                label: 'Operating Expenses',
                datasets: [
                    {
                        data: sellingGeneralAndAdministrativeExpenses.data,
                        label: 'SG&A',
                        color: 'blue',
                    },
                    {
                        data: researchAndDevelopmentExpenses.data,
                        label: 'R&D',
                        color: 'green',
                    },
                ],
                metric: sellingGeneralAndAdministrativeExpenses.metric,
                chartType: 'bar',
            },
            cashVsDebt,
            {
                labels: incomeStatementLabels,
                label: 'Shares Outstanding',
                datasets: [
                    {
                        data: sharesOutstanding.data,
                        color: 'red',
                    },
                ],
                metric: sharesOutstanding.metric,
                chartType: 'bar',
            },
        ];
    }

    private getLabels(
        financialData: any[],
        period: 'quarterly' | 'yearly',
    ): string[] {
        this.logger.debug(`Generating labels for period: ${period}`);

        const labels = financialData
            .map((entry) => entry.date)
            .reverse()
            .filter((key) => {
                const date = new Date(key);
                const year = date.getFullYear();
                if (period === 'quarterly') {
                    return year >= 2019;
                } else if (period === 'yearly') {
                    return year > 2004;
                }
                return false;
            })
            .map((date) => {
                const dt = new Date(date);
                const quarter = Math.ceil((dt.getMonth() + 1) / 3);
                const year = dt.getFullYear().toString().slice(-2);
                return period === 'quarterly'
                    ? `Q${quarter}'${year}`
                    : dt.getFullYear().toString();
            });

        this.logger.debug(`Generated labels: ${labels}`);
        return labels;
    }

    private getDataForLabels(
        financialData: any[],
        labels: string[],
        metric: string,
        period: 'quarterly' | 'yearly',
        format: 'millions' | 'thousands' | 'percent',
    ): { data: number[]; metric: string } {
        const dataMap = financialData.reduce(
            (acc, entry) => {
                const dt = new Date(entry.date);
                const formattedKey =
                    period === 'quarterly'
                        ? `Q${Math.ceil((dt.getMonth() + 1) / 3)}'${dt.getFullYear().toString().slice(-2)}`
                        : dt.getFullYear().toString();
                acc[formattedKey] = parseFloat(entry[metric]);
                return acc;
            },
            {} as Record<string, number>,
        );
        const data = labels.map((label) => dataMap[label] ?? null);
        return this.formatData(data, format);
    }

    private formatData(
        data: number[],
        format: 'millions' | 'thousands' | 'percent',
    ): { data: number[]; metric: string } {
        switch (format) {
            case 'millions':
                return {
                    data: data.map((value) => value / 1000000),
                    metric: 'Millions',
                };
            case 'thousands':
                return {
                    data: data.map((value) => value / 1000),
                    metric: 'Thousands',
                };
            case 'percent':
                return {
                    data: data.map((value) => value * 100),
                    metric: 'Percent',
                };
            default:
                return { data, metric: '' };
        }
    }

    private getOperatingLeverageData(
        incomeStatements: any[],
        labels: string[],
        period: 'quarterly' | 'yearly',
        chartType: string,
        label: string,
    ): ChartData {
        const revenue = this.getDataForLabels(
            incomeStatements,
            labels,
            'totalRevenue',
            period,
            'millions',
        );
        const operatingExpenses = this.getDataForLabels(
            incomeStatements,
            labels,
            'totalOperatingExpenses',
            period,
            'millions',
        );

        return {
            labels,
            label: label,
            datasets: [
                { data: revenue.data, label: 'Revenue', color: 'blue' },
                {
                    data: operatingExpenses.data,
                    label: 'Operating Expenses',
                    color: 'purple',
                },
            ],
            metric: revenue.metric,
            chartType: chartType,
        };
    }

    private mapOwnership(
        ownershipData: any[],
        companySharesData: CompanySharesDto[],
    ): {
        institutionalOwners: InstitutionalOwner[];
        institutionalBreakdown: PieChart;
    } {
        // Sort the ownership data by shares in descending order
        const sortedOwnershipData = ownershipData.sort(
            (a, b) => b.shares - a.shares,
        );
        // Take the top 10 largest owners
        const topOwners = sortedOwnershipData.slice(0, 10);

        // Map the top owners to the InstitutionalOwner format
        const institutionalOwners: InstitutionalOwner[] = topOwners.map(
            (owner) => ({
                name: owner.holder,
                totalShares: owner.shares,
            }),
        );

        // Calculate total shares held by institutions
        const totalInstitutionalShares = institutionalOwners.reduce(
            (acc, owner) => acc + owner.totalShares,
            0,
        );

        // Assume the remaining shares are held by retail owners and insiders
        const totalShares = sortedOwnershipData.reduce(
            (acc, owner) => acc + owner.shares,
            0,
        );

        const retailAndInsiderShares =
            companySharesData[0].outstandingShares - totalInstitutionalShares;

        // For simplicity, assume insiders are a fraction of retailAndInsiderShares, adjust as needed
        const insidersShares = 0; // Adjust this based on actual data if available
        const retailShares = retailAndInsiderShares - insidersShares;

        const pieChartData: PieChart = {
            labels: ['Retail Owners', 'Insiders', 'Institutions'],
            datasets: [
                {
                    data: [
                        (retailShares / totalShares) * 100,
                        (insidersShares / totalShares) * 100,
                        (totalInstitutionalShares / totalShares) * 100,
                    ],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                },
            ],
        };

        const ownership = {
            institutionalOwners,
            institutionalBreakdown: pieChartData,
        };

        return ownership;
    }

    private getCashVsDebtData(
        balanceSheetStatements: any[],
        labels: string[],
        period: 'quarterly' | 'yearly',
        chartType: string,
        label: string,
    ): ChartData {
        const cash = this.getDataForLabels(
            balanceSheetStatements,
            labels,
            'cashAndCashEquivalents',
            period,
            'millions',
        );
        const debt = this.getDataForLabels(
            balanceSheetStatements,
            labels,
            'totalDebt',
            period,
            'millions',
        );

        return {
            labels,
            label: label,
            datasets: [
                { data: cash.data, label: 'Cash', color: 'green' },
                { data: debt.data, label: 'Debt', color: 'red' },
            ],
            metric: cash.metric,
            chartType: chartType,
        };
    }
}

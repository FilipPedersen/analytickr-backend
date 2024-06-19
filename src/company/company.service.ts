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
} from './dto/company.dto';

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
        ] = await Promise.all([
            this.fetchData(
                `https://financialmodelingprep.com/api/v4/company-outlook?symbol=${ticker}&apikey=${this.apiKey}`,
            ),
            this.fetchData(
                `https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?period=quarter&apikey=${this.apiKey}`,
            ),
            this.fetchData(
                `https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?period=annual&apikey=${this.apiKey}`,
            ),
            this.fetchData(
                `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=quarter&apikey=${this.apiKey}`,
            ),
            this.fetchData(
                `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${this.apiKey}`,
            ),
            this.fetchData(
                `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?period=quarter&apikey=${this.apiKey}`,
            ),
            this.fetchData(
                `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?period=annual&apikey=${this.apiKey}`,
            ),
        ]);

        const profile = companyOutlookData.profile;
        const metrics = companyOutlookData.metrics;
        const ratios = companyOutlookData.ratios[0];
        const financialsAnnual = companyOutlookData.financialsAnnual.income;
        const financialsQuarter = companyOutlookData.financialsQuarter.income;

        const companyDto: CompanyDto = {
            company: this.mapCompanyProfile(profile),
            growthMetrics: this.mapGrowthMetrics(metrics),
            valuation: this.mapValuation(ratios),
            technicals: this.mapTechnicals(profile),
            marketCap: profile.mktCap,
            dividend: ratios.dividendYielPercentageTTM,
            grossMargin: ratios.grossProfitMarginTTM,
            quarterly: this.getChartData(
                financialsQuarter,
                cashFlowDataQuarterly,
                incomeStatementQuarter,
                balanceSheetQuarter,
                'quarterly',
            ),
            yearly: this.getChartData(
                financialsAnnual,
                cashFlowDataAnnual,
                incomeStatementAnnual,
                balanceSheetAnnual,
                'yearly',
            ),
            companyInformation: this.mapCompanyInformation(profile),
            ownership: {} as Ownership,
        };

        return companyDto;
    }

    private async fetchData(url: string): Promise<any> {
        this.logger.debug(`Fetching data from URL: ${url}`);
        try {
            const response = await lastValueFrom(
                this.httpService
                    .get(url)
                    .pipe(map((response) => response.data)),
            );
            return response;
        } catch (error) {
            this.logger.error(
                `Error fetching data from URL: ${url}`,
                error.stack,
            );
            throw error;
        }
    }

    private mapCompanyProfile(profile: any): Company {
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

    private mapTechnicals(profile: any): Technicals {
        return {
            range: profile.range,
            revenue: profile.revenue,
            wallStreetTargetPrice: profile.priceTargetAverage,
            ebitda: profile.ebitda,
        };
    }

    private mapGrowthMetrics(metrics: any): GrowthMetrics {
        return {
            revenueGrowthYoY: metrics.revenueGrowthYoY,
            profitsGrowthYoY: metrics.profitsGrowthYoY,
        };
    }

    private mapValuation(ratios: any): Valuation {
        return {
            peRatio: ratios.peRatioTTM,
            forwardPeRatio: ratios.peRatioTTM, // Update this if forward PE is available elsewhere
            psRatio: ratios.priceToSalesRatioTTM,
            pbRatio: ratios.priceToBookRatioTTM,
        };
    }

    private mapCompanyInformation(profile: any): CompanyInformation {
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
        financialData: any[],
        cashFlowData: any[],
        incomeStatementData: any[],
        balanceSheetData: any[],
        period: 'quarterly' | 'yearly',
    ): ChartData[] {
        const labels = this.getLabels(financialData, period);

        const netIncomeData = this.getDataForLabels(
            cashFlowData,
            labels,
            'netIncome',
            period,
            'millions',
        );
        const totalRevenue = this.getDataForLabels(
            incomeStatementData,
            labels,
            'revenue',
            period,
            'millions',
        );
        const sellingGeneralAndAdministrativeExpenses = this.getDataForLabels(
            incomeStatementData,
            labels,
            'sellingGeneralAndAdministrativeExpenses',
            period,
            'millions',
        );
        const researchAndDevelopmentExpenses = this.getDataForLabels(
            incomeStatementData,
            labels,
            'researchAndDevelopmentExpenses',
            period,
            'millions',
        );
        const freeCashFlow = this.getDataForLabels(
            cashFlowData,
            labels,
            'freeCashFlow',
            period,
            'millions',
        );
        const sharesOutstanding = this.getDataForLabels(
            incomeStatementData,
            labels,
            'weightedAverageShsOut',
            period,
            'millions',
        );

        const cashVsDebt = this.getCashVsDebtData(
            balanceSheetData,
            labels,
            period,
            'bar',
            'Cash vs Debt',
        );

        return [
            {
                labels,
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
                labels,
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
                labels,
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
                labels,
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
                labels,
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
        return financialData
            .map((entry) => entry.date)
            .reverse()
            .filter(
                (key) =>
                    (period !== 'quarterly' ||
                        new Date(key).getFullYear() >= 2019) &&
                    (period !== 'yearly' || new Date(key).getFullYear() > 2004),
            )
            .map((date) => {
                const dt = new Date(date);
                const quarter = Math.ceil((dt.getMonth() + 1) / 3);
                const year = dt.getFullYear().toString().slice(-2);
                return period === 'quarterly'
                    ? `Q${quarter}'${year}`
                    : dt.getFullYear().toString();
            });
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

    // private mapOwnership(insideTrades: any[]): Ownership {
    //     const institutionalOwners = insideTrades.map(trade => ({
    //         name: trade.reportingName,
    //         totalShares: trade.securitiesOwned,
    //     }));

    //     const institutionalBreakdown = {
    //         labels: insideTrades.map(trade => trade.reportingName),
    //         datasets: [{
    //             data: insideTrades.map(trade => trade.securitiesOwned),
    //             backgroundColor: insideTrades.map(() => '#' + Math.floor(Math.random()*16777215).toString(16)),  // Random colors
    //         }],
    //     };

    //     return {
    //         institutionalOwners,
    //         institutionalBreakdown,
    //     };
    // }

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

    // private mapOwnership(ownershipData: any): Ownership {
    //     const institutionalOwners = ownershipData.map(owner => ({
    //         name: owner.name,
    //         totalShares: owner.shares,
    //     }));

    //     const institutionalBreakdown = {
    //         labels: ownershipData.map(owner => owner.name),
    //         datasets: [{
    //             data: ownershipData.map(owner => owner.shares),
    //             backgroundColor: ownershipData.map(() => '#' + Math.floor(Math.random()*16777215).toString(16)),  // Random colors
    //         }],
    //     };

    //     return {
    //         institutionalOwners,
    //         institutionalBreakdown,
    //     };
    // }
}

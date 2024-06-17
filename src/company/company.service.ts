import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ChartData, CompanyDto, PieChart } from './dto/company.dto';
import {
    EHDStockFundamentals,
    EHDIncomeStatement,
    EHDCashFlow,
    EHDBalanceSheet,
} from 'ehd-js/src/types/model';
import { lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';

const API_KEY = process.env.FMP_API_KEY;

@Injectable()
export class CompanyService {
    private readonly apiUrl = 'https://financialmodelingprep.com/api/v3';
    private readonly apiKey = API_KEY;

    constructor(private httpService: HttpService) {}

    async getCompanyFundamentals(ticker: string): Promise<CompanyDto> {
        const companyProfile = await lastValueFrom(
            this.httpService
                .get(`${this.apiUrl}/profile/${ticker}?apikey=${this.apiKey}`)
                .pipe(map((response) => response.data[0])),
        );

        const financialGrowth = await lastValueFrom(
            this.httpService
                .get(
                    `${this.apiUrl}/financial-growth/${ticker}?apikey=${this.apiKey}`,
                )
                .pipe(map((response) => response.data[0])),
        );

        const keyMetrics = await lastValueFrom(
            this.httpService
                .get(
                    `${this.apiUrl}/key-metrics-ttm/${ticker}?apikey=${this.apiKey}`,
                )
                .pipe(map((response) => response.data[0])),
        );

        const ownership = await lastValueFrom(
            this.httpService
                .get(
                    `${this.apiUrl}/institutional-ownership/${ticker}?apikey=${this.apiKey}`,
                )
                .pipe(map((response) => response.data)),
        );

        const companyDto: CompanyDto = {
            company: {
                name: companyProfile.companyName,
                logoUrl: companyProfile.image,
                ticker: companyProfile.symbol,
                sector: companyProfile.sector,
                industry: companyProfile.industry,
                currencySymbol: companyProfile.currency,
                exchange: companyProfile.exchange,
            },
            growthMetrics: {
                revenueGrowthYoY: financialGrowth.revenueGrowth,
                profitsGrowthYoY: financialGrowth.netIncomeGrowth,
            },
            valuation: {
                peRatio: keyMetrics.peRatioTTM,
                forwardPeRatio: keyMetrics.forwardPE,
                psRatio: keyMetrics.psRatioTTM,
                pbRatio: keyMetrics.pbRatioTTM,
            },
            technicals: {
                '52weekHigh': companyProfile['52WeekHigh'],
                '52weekLow': companyProfile['52WeekLow'],
                revenue: companyProfile.revenue,
                wallStreetTargetPrice: companyProfile.priceTarget,
                ebitda: companyProfile.ebitda,
            },
            marketCap: companyProfile.marketCap,
            dividend: companyProfile.dividendYield,
            grossMargin: companyProfile.grossMargin,
            quarterly: [], // This would require further API calls to populate
            yearly: [], // This would require further API calls to populate
            companyInformation: {
                ceo: companyProfile.ceo,
                employees: companyProfile.fullTimeEmployees,
                headquarters: companyProfile.address,
                industry: companyProfile.industry,
                website: companyProfile.website,
                shortInterest: companyProfile.shortInterest,
                sharesShort: companyProfile.sharesShort,
            },
            ownership: {
                institutionalOwners: ownership.map((owner) => ({
                    name: owner.name,
                    totalShares: owner.shares,
                })),
                institutionalBreakdown: {
                    labels: ownership.map((owner) => owner.name),
                    datasets: [
                        {
                            data: ownership.map((owner) => owner.shares),
                            backgroundColor: ownership.map(
                                () =>
                                    '#' +
                                    Math.floor(
                                        Math.random() * 16777215,
                                    ).toString(16),
                            ), // Random colors
                        },
                    ],
                },
            },
        };

        return companyDto;
    }

    private getChartData(
        data: EHDStockFundamentals,
        period: 'quarterly' | 'yearly',
    ): ChartData[] {
        const incomeStatement = data.Financials.Income_Statement[period];
        const cashFlow = data.Financials.Cash_Flow[period];
        const balanceSheet = data.Financials.Balance_Sheet[period];

        const labels = this.getLabels(
            incomeStatement || cashFlow || balanceSheet,
            period,
        );

        const netIncomeData = this.getDataForLabels(
            incomeStatement,
            labels,
            'netIncome',
            period,
            'millions',
        );
        const cashFlowData = this.getDataForLabels(
            cashFlow,
            labels,
            'freeCashFlow',
            period,
            'millions',
        );
        const balanceSheetData = this.getDataForLabels(
            balanceSheet,
            labels,
            'commonStockSharesOutstanding',
            period,
            'millions',
        );

        const totalRevenue = this.getDataForLabels(
            incomeStatement,
            labels,
            'totalRevenue',
            period,
            'millions',
        );

        const cashVsDebtData = this.getCashVsDebtData(
            balanceSheet,
            labels,
            period,
            'bar',
            'Cash vs Debt',
        );

        const operatingLeverageData = this.getOperatingLeverageData(
            incomeStatement,
            labels,
            period,
            'line',
            'Operating Leverage',
        );

        return [
            {
                labels,
                label: 'Net Income',

                datasets: [
                    {
                        data: netIncomeData.data,
                        label: 'Net Income',
                        color: 'grey',
                    },
                ],
                metric: netIncomeData.metric,
                chartType: 'bar',
            },
            {
                labels,
                label: 'Total Revenue',
                datasets: [
                    {
                        data: totalRevenue.data,
                        label: 'Total Revenue',
                        color: 'blue',
                    },
                ],
                metric: totalRevenue.metric,
                chartType: 'bar',
            },
            {
                labels,
                label: 'Free Cash Flow',
                datasets: [
                    {
                        data: cashFlowData.data,
                        label: 'Free Cash Flow',
                        color: 'green',
                    },
                ],
                metric: cashFlowData.metric,
                chartType: 'bar',
            },
            {
                labels,
                label: 'Shares Outstanding',
                datasets: [
                    {
                        data: balanceSheetData.data,
                        label: 'Shares Outstanding',
                        color: 'red',
                    },
                ],
                metric: balanceSheetData.metric,
                chartType: 'bar',
            },
            cashVsDebtData,
            operatingLeverageData,
        ];
    }

    private createPieChart(data: EHDStockFundamentals): PieChart {
        const institutionalOwnership = parseFloat(
            data.SharesStats.PercentInstitutions.toFixed(1),
        );
        const insiderOwnership = parseFloat(
            data.SharesStats.PercentInsiders.toFixed(1),
        );
        const retailOwnership = parseFloat(
            (100 - institutionalOwnership - insiderOwnership).toFixed(1),
        );

        return {
            labels: ['Institutional', 'Insider', 'Retail'],
            datasets: [
                {
                    data: [
                        institutionalOwnership,
                        insiderOwnership,
                        retailOwnership,
                    ],
                    backgroundColor: ['#A8DADC', '#457B9D', '#1D3557'],
                },
            ],
        };
    }

    private getOperatingLeverageData(
        incomeStatement: Record<string, EHDIncomeStatement>,
        labels: string[],
        period: 'quarterly' | 'yearly',
        chartType: string,
        label: string,
    ): ChartData {
        const revenue = this.getDataForLabels(
            incomeStatement,
            labels,
            'totalRevenue',
            period,
            'millions',
        );
        const operatingExpenses = this.getDataForLabels(
            incomeStatement,
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

    private getCashVsDebtData(
        balanceSheet: Record<string, EHDBalanceSheet>,
        labels: string[],
        period: 'quarterly' | 'yearly',
        chartType: string,
        label: string,
    ): ChartData {
        const cash = this.getDataForLabels(
            balanceSheet,
            labels,
            'cashAndEquivalents',
            period,
            'millions',
        );
        const debt = this.getDataForLabels(
            balanceSheet,
            labels,
            'shortLongTermDebtTotal',
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

    private getLabels(
        financialData: Record<
            string,
            EHDIncomeStatement | EHDCashFlow | EHDBalanceSheet
        >,
        period: 'quarterly' | 'yearly',
    ): string[] {
        return Object.keys(financialData)
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
        financialData: Record<string, any>,
        labels: string[],
        metric: string,
        period: 'quarterly' | 'yearly',
        format: 'millions' | 'thousands' | 'percent',
    ): { data: number[]; metric: string } {
        const dataMap = Object.keys(financialData).reduce(
            (acc, key) => {
                const dt = new Date(key);
                const formattedKey =
                    period === 'quarterly'
                        ? `Q${Math.ceil((dt.getMonth() + 1) / 3)}'${dt.getFullYear().toString().slice(-2)}`
                        : dt.getFullYear().toString();
                acc[formattedKey] = parseFloat(financialData[key][metric]);
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
}

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ChartData, CompanyDto } from './dto/company.dto';
import {
    EHDStockFundamentals,
    EHDIncomeStatement,
    EHDCashFlow,
    EHDBalanceSheet,
} from 'ehd-js/src/types/model';

const API_KEY = 'demo';

@Injectable()
export class CompanyService {
    async getCompanyFundamentals(ticker: string): Promise<CompanyDto> {
        const apiKey = API_KEY;
        const url = `https://eodhd.com/api/fundamentals/${ticker}?api_token=${apiKey}`;

        try {
            const response = await fetch(url);
            const data: EHDStockFundamentals = await response.json();

            const institutionalOwners = Object.keys(data.Holders.Institutions)
                .slice(0, 10)
                .map((key) => {
                    const institution = data.Holders.Institutions[key];
                    return {
                        name: institution.name,
                        totalShares: institution.totalShares,
                    };
                });

            const formattedData: CompanyDto = {
                company: {
                    name: data.General?.Name ?? 'N/A',
                    ticker: data.General?.Code ?? 'N/A',
                    logoUrl: data.General?.LogoURL ?? 'N/A',
                    sector: data.General?.Sector ?? 'N/A',
                    industry: data.General?.Industry ?? 'N/A',
                    currencySymbol: data.General?.CurrencySymbol ?? 'N/A',
                    exchange: data.General?.Exchange ?? 'N/A',
                },
                technicals: {
                    revenue: data.Highlights?.RevenueTTM ?? 0,
                    '52weekHigh': data.Technicals?.['52WeekHigh'] ?? 0,
                    '52weekLow': data.Technicals?.['52WeekLow'] ?? 0,
                    wallStreetTargetPrice:
                        data.Highlights?.WallStreetTargetPrice ?? 0,
                    ebitda: data.Highlights?.EBITDA ?? 0,
                },
                growthMetrics: {
                    revenueGrowthYoY:
                        data.Highlights?.QuarterlyRevenueGrowthYOY ?? 0,
                    profitsGrowthYoY:
                        data.Highlights?.QuarterlyEarningsGrowthYOY ?? 0,
                },
                valuation: {
                    peRatio: data.Highlights?.PERatio ?? 0,
                    forwardPeRatio: data.Valuation?.ForwardPE ?? 0,
                    psRatio: data.Valuation?.PriceSalesTTM ?? 0,
                    pbRatio: data.Valuation?.PriceBookMRQ ?? 0,
                },
                marketCap: data.Highlights?.MarketCapitalization ?? 0,
                dividend: data.Highlights?.DividendYield ?? 0,
                grossMargin: data.Highlights?.ProfitMargin ?? 0,
                quarterly: this.getChartData(data, 'quarterly'),
                yearly: this.getChartData(data, 'yearly'),
                companyInformation: {
                    ceo: data.General?.Officers[0].Name ?? 'N/A',
                    employees: data.General?.FullTimeEmployees ?? 0,
                    headquarters:
                        `${data.General?.AddressData?.City}, ${data.General?.AddressData?.Country}` ??
                        'N/A',
                    industry: data.General?.Industry ?? 'N/A',
                    sharesShort: data.Technicals?.SharesShort ?? 0,
                    shortInterest: data.Technicals?.ShortPercent ?? 0,
                    website: data.General?.WebURL ?? 'N/A',
                    institutionalOwners: institutionalOwners,
                },
            };

            return formattedData;
        } catch (error) {
            console.error('Error fetching or processing data:', error.message);
            throw new HttpException(
                `Failed to fetch data: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
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

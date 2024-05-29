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
        );
        const cashFlowData = this.getDataForLabels(
            cashFlow,
            labels,
            'freeCashFlow',
            period,
        );
        const balanceSheetData = this.getDataForLabels(
            balanceSheet,
            labels,
            'commonStockSharesOutstanding',
            period,
        );

        const cashVsDebtData = this.getCashVsDebtData(
            balanceSheet,
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
                        data: netIncomeData,
                        label: 'Net Income',
                        color: 'blue',
                    },
                ],
                chartType: 'bar',
            },
            {
                labels,
                label: 'Free Cash Flow',
                datasets: [
                    {
                        data: cashFlowData,
                        label: 'Free Cash Flow',
                        color: 'green',
                    },
                ],
                chartType: 'bar',
            },
            {
                labels,
                label: 'Shares Outstanding',
                datasets: [
                    {
                        data: balanceSheetData,
                        label: 'Shares Outstanding',
                        color: 'red',
                    },
                ],
                chartType: 'bar',
            },
            cashVsDebtData,
        ];
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
        );
        const debt = this.getDataForLabels(
            balanceSheet,
            labels,
            'shortLongTermDebtTotal',
            period,
        );

        return {
            labels,
            label: label,
            datasets: [
                { data: cash, label: 'Cash', color: 'green' },
                { data: debt, label: 'Debt', color: 'red' },
            ],
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
    ): number[] {
        const values = Object.values(financialData).map((entry) =>
            parseFloat(entry[metric]),
        );

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
        return labels.map((label) => dataMap[label] ?? null);
    }
}

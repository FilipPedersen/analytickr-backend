// src/company/company.service.ts

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
    private readonly apiUrl = 'https://financialmodelingprep.com/api/v3';
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

        const companyProfile = await this.fetchData(
            `${this.apiUrl}/profile/${ticker}?apikey=${this.apiKey}`,
        );
        const incomeStatements = await this.getFinancialData(
            ticker,
            'income-statement',
        );
        const cashFlowStatements = await this.getFinancialData(
            ticker,
            'cash-flow-statement',
        );
        const balanceSheetStatements = await this.getFinancialData(
            ticker,
            'balance-sheet-statement',
        );
        const keyMetrics = await this.fetchData(
            `${this.apiUrl}/key-metrics-ttm/${ticker}?apikey=${this.apiKey}`,
        );
        // const ownershipData = await this.fetchData(
        //     `${this.apiUrl}/institutional-ownership/${ticker}?apikey=${this.apiKey}`,
        // );

        const [quarterly, yearly] = this.splitFinancialData(
            incomeStatements,
            cashFlowStatements,
            balanceSheetStatements,
        );

        const companyDto: CompanyDto = {
            company: {
                name: companyProfile[0].companyName,
                logoUrl: companyProfile[0].image,
                ticker: companyProfile[0].symbol,
                sector: companyProfile[0].sector,
                industry: companyProfile[0].industry,
                currencySymbol: companyProfile[0].currency,
                exchange: companyProfile[0].exchangeShortName,
            },
            growthMetrics: {
                revenueGrowthYoY: keyMetrics[0].revenueGrowth,
                profitsGrowthYoY: keyMetrics[0].netIncomeGrowth,
            },
            valuation: {
                peRatio: keyMetrics.peRatioTTM,
                forwardPeRatio: keyMetrics.forwardPE,
                psRatio: keyMetrics.psRatioTTM,
                pbRatio: keyMetrics.pbRatioTTM,
            },
            technicals: {} as Technicals,
            marketCap: companyProfile.marketCap,
            dividend: companyProfile.dividendYield,
            grossMargin: companyProfile.grossMargin,
            quarterly,
            yearly,
            companyInformation: this.mapCompanyInformation(companyProfile),
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

    private async getFinancialData(
        ticker: string,
        endpoint: string,
    ): Promise<any[]> {
        const url = `${this.apiUrl}/${endpoint}/${ticker}?apikey=${this.apiKey}`;
        return this.fetchData(url);
    }

    private splitFinancialData(
        incomeStatements: any[],
        cashFlowStatements: any[],
        balanceSheetStatements: any[],
    ): [ChartData[], ChartData[]] {
        const quarterly = this.getChartData(
            incomeStatements.filter((entry) => entry.period === 'Q'),
            cashFlowStatements.filter((entry) => entry.period === 'Q'),
            balanceSheetStatements.filter((entry) => entry.period === 'Q'),
            'quarterly',
        );

        const yearly = this.getChartData(
            incomeStatements.filter((entry) => entry.period === 'FY'),
            cashFlowStatements.filter((entry) => entry.period === 'FY'),
            balanceSheetStatements.filter((entry) => entry.period === 'FY'),
            'yearly',
        );

        return [quarterly, yearly];
    }

    private getChartData(
        incomeStatements: any[],
        cashFlowStatements: any[],
        balanceSheetStatements: any[],
        period: 'quarterly' | 'yearly',
    ): ChartData[] {
        const labels = this.getLabels(
            incomeStatements || cashFlowStatements || balanceSheetStatements,
            period,
        );

        const netIncomeData = this.getDataForLabels(
            incomeStatements,
            labels,
            'netIncome',
            period,
            'millions',
        );
        const cashFlowData = this.getDataForLabels(
            cashFlowStatements,
            labels,
            'freeCashFlow',
            period,
            'millions',
        );
        const balanceSheetData = this.getDataForLabels(
            balanceSheetStatements,
            labels,
            'commonStockSharesOutstanding',
            period,
            'millions',
        );
        const totalRevenue = this.getDataForLabels(
            incomeStatements,
            labels,
            'totalRevenue',
            period,
            'millions',
        );
        const cashVsDebtData = this.getCashVsDebtData(
            balanceSheetStatements,
            labels,
            period,
            'bar',
            'Cash vs Debt',
        );
        const operatingLeverageData = this.getOperatingLeverageData(
            incomeStatements,
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
            'cashAndEquivalents',
            period,
            'millions',
        );
        const debt = this.getDataForLabels(
            balanceSheetStatements,
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

    private mapCompanyProfile(profile: any): Company {
        return {
            name: profile.companyName,
            logoUrl: profile.image,
            ticker: profile.symbol,
            sector: profile.sector,
            industry: profile.industry,
            currencySymbol: profile.currency,
            exchange: profile.exchange,
        };
    }

    private mapGrowthMetrics(keyMetrics: any): GrowthMetrics {
        return {
            revenueGrowthYoY: keyMetrics.revenueGrowth,
            profitsGrowthYoY: keyMetrics.netIncomeGrowth,
        };
    }

    private mapValuation(keyMetrics: any): Valuation {
        return {
            peRatio: keyMetrics.peRatioTTM,
            forwardPeRatio: keyMetrics.forwardPE,
            psRatio: keyMetrics.psRatioTTM,
            pbRatio: keyMetrics.pbRatioTTM,
        };
    }

    private mapTechnicals(profile: any): Technicals {
        return {
            '52weekHigh': profile['52WeekHigh'],
            '52weekLow': profile['52WeekLow'],
            revenue: profile.revenue,
            wallStreetTargetPrice: profile.priceTarget,
            ebitda: profile.ebitda,
        };
    }

    private mapCompanyInformation(profile: any): CompanyInformation {
        return {
            ceo: profile.ceo,
            employees: profile.fullTimeEmployees,
            headquarters: profile.address,
            industry: profile.industry,
            website: profile.website,
            shortInterest: profile.shortInterest,
            sharesShort: profile.sharesShort,
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

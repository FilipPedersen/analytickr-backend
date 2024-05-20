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
          sector: data.General?.Sector ?? 'N/A',
          industry: data.General?.Industry ?? 'N/A',
          currencySymbol: data.General?.CurrencySymbol ?? 'N/A',
          exchange: data.General?.Exchange ?? 'N/A',
        },
        technicals: {
          revenue: data.Highlights?.RevenueTTM ?? 0,
          '52weekHigh': data.Technicals?.['52WeekHigh'] ?? 0,
          '52weekLow': data.Technicals?.['52WeekLow'] ?? 0,
          wallStreetTargetPrice: data.Highlights?.WallStreetTargetPrice ?? 0,
          ebitda: data.Highlights?.EBITDA ?? 0,
        },
        growthMetrics: {
          revenueGrowthYoY: data.Highlights?.QuarterlyRevenueGrowthYOY ?? 0,
          profitsGrowthYoY: data.Highlights?.QuarterlyEarningsGrowthYOY ?? 0,
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
    const netIncomeData: number[] = [];
    const cashFlowData: number[] = [];
    const balanceSheetData: number[] = [];

    Object.keys(incomeStatement || cashFlow || balanceSheet)
      .reverse()
      .forEach((key) => {
        const dt = new Date(key);
        if (dt.getFullYear() >= 2019) {
          if (incomeStatement[key]) {
            netIncomeData.push(parseFloat(incomeStatement[key].netIncome));
          }
          if (cashFlow[key]) {
            cashFlowData.push(parseFloat(cashFlow[key]['freeCashFlow']));
          }
          if (balanceSheet[key]) {
            balanceSheetData.push(
              parseFloat(balanceSheet[key].commonStockSharesOutstanding),
            );
          }
        }
      });

    return [
      {
        labels,
        label: 'Net Income',
        color: 'blue',
        data: netIncomeData,
        chartType: 'bar',
      },
      {
        labels,
        label: 'Free Cash Flow',
        color: 'green',
        data: cashFlowData,
        chartType: 'bar',
      },
      {
        labels,
        label: 'Shares Outstanding',
        color: 'red',
        data: balanceSheetData,
        chartType: 'bar',
      },
    ];
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
        (key) => period !== 'quarterly' || new Date(key).getFullYear() >= 2019,
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
}

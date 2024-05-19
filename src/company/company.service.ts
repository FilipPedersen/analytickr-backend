import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CompanyDto } from './dto/company.dto';

const API_KEY = 'demo';

@Injectable()
export class CompanyService {
  async getCompanyFundamentals(ticker: string) {
    const apiKey = API_KEY;
    const url = `https://eodhd.com/api/fundamentals/${ticker}?api_token=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const formattedData: CompanyDto = {
        company: {
          name: data.General?.Name ?? 'N/A',
          ticker: data.General?.Code ?? 'N/A',
          sector: data.General?.Sector ?? 'N/A',
          industry: data.General?.Industry ?? 'N/A',
          currencySymbol: data.General?.CurrencySymbol ?? 'N/A',
          exchange: data.General?.Exchange ?? 'N/A',
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
        quarterly: this.formatQuarterlyData(
          data.Financials.Income_Statement.quarterly,
        ),
        yearly: this.formatYearlyData(data.Financials.Income_Statement.yearly),
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

  private formatQuarterlyData(quarterlyData: any): {
    labels: string[];
    datasets: { label: string; color: string; data: number[] }[];
  } {
    const labels = Object.keys(quarterlyData)
      .reverse()
      .map((date) => {
        const quarter = Math.ceil(new Date(date).getMonth() / 3);
        const year = new Date(date).getFullYear().toString().slice(-2);
        return `Q${quarter}'${year}`;
      });

    const netIncomeData = Object.values(quarterlyData)
      .reverse()
      .map((data: any) => parseFloat(data.netIncome));

    return {
      labels,
      datasets: [
        {
          label: 'Net Income',
          color: 'green',
          data: netIncomeData,
        },
      ],
    };
  }

  private formatYearlyData(yearlyData: any): {
    labels: string[];
    datasets: { label: string; color: string; data: number[] }[];
  } {
    const labels = Object.keys(yearlyData)
      .reverse()
      .map((date) => new Date(date).getFullYear().toString());

    const netIncomeData = Object.values(yearlyData)
      .reverse()
      .map((data: any) => parseFloat(data.netIncome));

    return {
      labels,
      datasets: [
        {
          label: 'Net Income',
          color: 'green',
          data: netIncomeData,
        },
      ],
    };
  }
}

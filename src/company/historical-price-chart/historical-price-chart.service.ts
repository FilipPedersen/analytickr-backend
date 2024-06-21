import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ChartData } from '../dto/company.dto';
import { HistoricalPriceChart } from './historical-price-chart.dto';

@Injectable()
export class HistoricalService {
    private readonly apiKey: string;
    private readonly logger = new Logger(HistoricalService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('FMP_API_KEY');
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

    private getStartDate(period: '3m' | 'ytd' | '1y' | '3y'): string {
        const date = new Date();
        switch (period) {
            case '3m':
                date.setMonth(date.getMonth() - 3);
                break;
            case 'ytd':
                date.setMonth(0, 1);
                break;
            case '1y':
                date.setFullYear(date.getFullYear() - 1);
                break;
            case '3y':
                date.setFullYear(date.getFullYear() - 3);
                break;
        }
        return date.toISOString().split('T')[0];
    }

    async getHistoricalData(
        ticker: string,
        timeframe: '3m' | 'ytd' | '1y' | '3y',
    ): Promise<ChartData> {
        this.logger.debug(
            `Fetching historical data for ticker: ${ticker} with timeframe: ${timeframe}`,
        );

        const startDate = this.getStartDate(timeframe);
        let url: string;

        if (timeframe === '3m') {
            url = `https://financialmodelingprep.com/api/v3/historical-chart/15min/${ticker}?apikey=${this.apiKey}`;
        } else {
            url = `https://financialmodelingprep.com/api/v3/historical-chart/1day/${ticker}?from=${startDate}&apikey=${this.apiKey}`;
        }

        const historicalData = await this.fetchData(url);

        return this.getHistoricalChartData(
            historicalData,
            this.getLabelForTimeframe(timeframe),
        );
    }

    private getLabelForTimeframe(
        timeframe: '3m' | 'ytd' | '1y' | '3y',
    ): string {
        switch (timeframe) {
            case '3m':
                return '3 Months';
            case 'ytd':
                return 'Year to Date';
            case '1y':
                return '1 Year';
            case '3y':
                return '3 Years';
            default:
                return '';
        }
    }

    private getHistoricalChartData(
        data: HistoricalPriceChart[],
        label: string,
    ): ChartData {
        const labels = data.map((item) => item.date);
        const closePrices = data.map((item) => item.close);

        return {
            label: 'Price Chart',
            chartType: 'line',
            datasets: [
                {
                    data: closePrices,
                    color: 'blue',
                },
            ],
            metric: 'USD',
            labels,
            stacked: false,
            showXAxis: false,
        };
    }
}

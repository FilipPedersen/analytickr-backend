import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChartData } from '../dto/company.dto';
import { HistoricalService } from './historical-price-chart.service';

@Controller('historical-price-chart')
export class HistoricalController {
    constructor(private readonly historicalService: HistoricalService) {}

    @Get(':ticker')
    async getHistoricalData(
        @Param('ticker') ticker: string,
        @Query('timeframe') timeframe: '3m' | 'ytd' | '1y' | '3y',
    ): Promise<ChartData> {
        return this.historicalService.getHistoricalData(ticker, timeframe);
    }
}

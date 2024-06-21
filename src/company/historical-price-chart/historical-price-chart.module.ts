import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HistoricalService } from './historical-price-chart.service';
import { HistoricalController } from './historical-price-chart.controller';

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [HistoricalService],
    controllers: [HistoricalController],
})
export class HistoricalModule {}

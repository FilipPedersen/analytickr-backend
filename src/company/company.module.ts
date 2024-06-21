import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { HttpModule } from '@nestjs/axios';
import { HistoricalModule } from './historical-price-chart/historical-price-chart.module';

@Module({
    imports: [HttpModule, HistoricalModule],
    controllers: [CompanyController],
    providers: [CompanyService],
})
export class CompanyModule {}

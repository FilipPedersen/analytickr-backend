import { IsString, IsNumber, IsOptional } from 'class-validator';

export class StockDto {
    @IsString()
    symbol: string;

    @IsString()
    companyName: string;

    @IsString()
    ticker: string;

    @IsString()
    logoUrl: string;

    @IsNumber()
    marketCap: number;

    @IsNumber()
    priceTarget: number;

    @IsOptional()
    @IsNumber()
    shortInterestPercentage?: number;

    @IsNumber()
    stockPrice: number;

    @IsNumber()
    stockPriceChange: number;

    @IsNumber()
    moneyVolume: number;
}

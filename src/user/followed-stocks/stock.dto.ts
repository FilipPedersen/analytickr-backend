import { IsString, IsNumber, IsOptional } from 'class-validator';

export class StockDto {
    @IsString()
    companyName: string;

    @IsString()
    ticker: string;

    @IsString()
    logoUrl: string;

    @IsString()
    user: string;
}

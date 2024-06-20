import { IsNumber, IsString } from 'class-validator';

export class CompanySharesDto {
    @IsString()
    symbol: string;

    @IsString()
    date: string;

    @IsNumber()
    freeFloat: number;

    @IsNumber()
    floatShares: number;

    @IsNumber()
    outstandingShares: number;

    @IsString()
    source: string;
}

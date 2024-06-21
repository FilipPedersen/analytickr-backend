import { IsNumber, IsString } from 'class-validator';

export class PriceTargetDto {
    @IsString()
    symbol: string;

    @IsNumber()
    targetHigh: number;

    @IsNumber()
    targetLow: number;

    @IsNumber()
    targetConsensus: number;

    @IsNumber()
    targetMedian: number;
}

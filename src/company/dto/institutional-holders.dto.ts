import { IsNumber, IsString } from 'class-validator';

export class InstitutionalHoldersDto {
    @IsString()
    holder: string;

    @IsNumber()
    shares: number;

    @IsString()
    dateReported: string;

    @IsNumber()
    change: number;
}

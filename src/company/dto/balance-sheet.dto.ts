import { IsDateString, IsInt, IsString, IsOptional } from 'class-validator';

export class BalanceSheetDto {
    @IsDateString()
    date: string;

    @IsString()
    symbol: string;

    @IsString()
    reportedCurrency: string;

    @IsString()
    cik: string;

    @IsDateString()
    fillingDate: string;

    @IsDateString()
    acceptedDate: string;

    @IsInt()
    calendarYear: number;

    @IsString()
    period: string;

    @IsInt()
    cashAndCashEquivalents: number;

    @IsInt()
    shortTermInvestments: number;

    @IsInt()
    cashAndShortTermInvestments: number;

    @IsInt()
    netReceivables: number;

    @IsInt()
    inventory: number;

    @IsInt()
    otherCurrentAssets: number;

    @IsInt()
    totalCurrentAssets: number;

    @IsInt()
    propertyPlantEquipmentNet: number;

    @IsInt()
    goodwill: number;

    @IsInt()
    intangibleAssets: number;

    @IsInt()
    goodwillAndIntangibleAssets: number;

    @IsInt()
    longTermInvestments: number;

    @IsInt()
    taxAssets: number;

    @IsInt()
    otherNonCurrentAssets: number;

    @IsInt()
    totalNonCurrentAssets: number;

    @IsInt()
    otherAssets: number;

    @IsInt()
    totalAssets: number;

    @IsInt()
    accountPayables: number;

    @IsInt()
    shortTermDebt: number;

    @IsInt()
    taxPayables: number;

    @IsInt()
    deferredRevenue: number;

    @IsInt()
    otherCurrentLiabilities: number;

    @IsInt()
    totalCurrentLiabilities: number;

    @IsInt()
    longTermDebt: number;

    @IsInt()
    deferredRevenueNonCurrent: number;

    @IsInt()
    deferredTaxLiabilitiesNonCurrent: number;

    @IsInt()
    otherNonCurrentLiabilities: number;

    @IsInt()
    totalNonCurrentLiabilities: number;

    @IsInt()
    otherLiabilities: number;

    @IsInt()
    capitalLeaseObligations: number;

    @IsInt()
    totalLiabilities: number;

    @IsInt()
    preferredStock: number;

    @IsInt()
    commonStock: number;

    @IsInt()
    retainedEarnings: number;

    @IsInt()
    accumulatedOtherComprehensiveIncomeLoss: number;

    @IsInt()
    othertotalStockholdersEquity: number;

    @IsInt()
    totalStockholdersEquity: number;

    @IsInt()
    totalEquity: number;

    @IsInt()
    totalLiabilitiesAndStockholdersEquity: number;

    @IsInt()
    minorityInterest: number;

    @IsInt()
    totalLiabilitiesAndTotalEquity: number;

    @IsInt()
    totalInvestments: number;

    @IsInt()
    totalDebt: number;

    @IsInt()
    netDebt: number;

    @IsOptional()
    @IsString()
    link: string;

    @IsOptional()
    @IsString()
    finalLink: string;
}

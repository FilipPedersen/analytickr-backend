import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CashFlowDto {
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

    @IsString()
    calendarYear: string;

    @IsString()
    period: string;

    @IsNumber()
    netIncome: number;

    @IsNumber()
    depreciationAndAmortization: number;

    @IsNumber()
    deferredIncomeTax: number;

    @IsNumber()
    stockBasedCompensation: number;

    @IsNumber()
    changeInWorkingCapital: number;

    @IsNumber()
    accountsReceivables: number;

    @IsNumber()
    inventory: number;

    @IsNumber()
    accountsPayables: number;

    @IsNumber()
    otherWorkingCapital: number;

    @IsNumber()
    otherNonCashItems: number;

    @IsNumber()
    netCashProvidedByOperatingActivities: number;

    @IsNumber()
    investmentsInPropertyPlantAndEquipment: number;

    @IsNumber()
    acquisitionsNet: number;

    @IsNumber()
    purchasesOfInvestments: number;

    @IsNumber()
    salesMaturitiesOfInvestments: number;

    @IsNumber()
    otherInvestingActivites: number;

    @IsNumber()
    netCashUsedForInvestingActivites: number;

    @IsNumber()
    debtRepayment: number;

    @IsNumber()
    commonStockIssued: number;

    @IsNumber()
    commonStockRepurchased: number;

    @IsNumber()
    dividendsPaid: number;

    @IsNumber()
    otherFinancingActivites: number;

    @IsNumber()
    netCashUsedProvidedByFinancingActivities: number;

    @IsNumber()
    effectOfForexChangesOnCash: number;

    @IsNumber()
    netChangeInCash: number;

    @IsNumber()
    cashAtEndOfPeriod: number;

    @IsNumber()
    cashAtBeginningOfPeriod: number;

    @IsNumber()
    operatingCashFlow: number;

    @IsNumber()
    capitalExpenditure: number;

    @IsNumber()
    freeCashFlow: number;

    @IsString()
    @IsOptional()
    link: string;

    @IsString()
    @IsOptional()
    finalLink: string;
}

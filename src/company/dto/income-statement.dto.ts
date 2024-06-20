import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class IncomeStatementDto {
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
    revenue: number;

    @IsNumber()
    costOfRevenue: number;

    @IsNumber()
    grossProfit: number;

    @IsNumber()
    grossProfitRatio: number;

    @IsNumber()
    researchAndDevelopmentExpenses: number;

    @IsNumber()
    generalAndAdministrativeExpenses: number;

    @IsNumber()
    sellingAndMarketingExpenses: number;

    @IsNumber()
    sellingGeneralAndAdministrativeExpenses: number;

    @IsNumber()
    otherExpenses: number;

    @IsNumber()
    operatingExpenses: number;

    @IsNumber()
    costAndExpenses: number;

    @IsNumber()
    interestIncome: number;

    @IsNumber()
    interestExpense: number;

    @IsNumber()
    depreciationAndAmortization: number;

    @IsNumber()
    ebitda: number;

    @IsNumber()
    ebitdaratio: number;

    @IsNumber()
    operatingIncome: number;

    @IsNumber()
    operatingIncomeRatio: number;

    @IsNumber()
    totalOtherIncomeExpensesNet: number;

    @IsNumber()
    incomeBeforeTax: number;

    @IsNumber()
    incomeBeforeTaxRatio: number;

    @IsNumber()
    incomeTaxExpense: number;

    @IsNumber()
    netIncome: number;

    @IsNumber()
    netIncomeRatio: number;

    @IsNumber()
    eps: number;

    @IsNumber()
    epsdiluted: number;

    @IsNumber()
    weightedAverageShsOut: number;

    @IsNumber()
    weightedAverageShsOutDil: number;

    @IsString()
    @IsOptional()
    link: string;

    @IsString()
    @IsOptional()
    finalLink: string;
}

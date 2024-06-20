import {
    IsString,
    IsNumber,
    IsBoolean,
    IsDateString,
    IsOptional,
    ValidateNested,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProfileDto {
    @IsString()
    symbol: string;

    @IsNumber()
    price: number;

    @IsNumber()
    beta: number;

    @IsNumber()
    volAvg: number;

    @IsNumber()
    mktCap: number;

    @IsNumber()
    lastDiv: number;

    @IsString()
    range: string;

    @IsNumber()
    changes: number;

    @IsString()
    companyName: string;

    @IsString()
    currency: string;

    @IsString()
    cik: string;

    @IsString()
    isin: string;

    @IsString()
    cusip: string;

    @IsString()
    exchange: string;

    @IsString()
    exchangeShortName: string;

    @IsString()
    industry: string;

    @IsString()
    website: string;

    @IsString()
    description: string;

    @IsString()
    ceo: string;

    @IsString()
    sector: string;

    @IsString()
    country: string;

    @IsString()
    fullTimeEmployees: string;

    @IsString()
    phone: string;

    @IsString()
    address: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    zip: string;

    @IsNumber()
    dcfDiff: number;

    @IsNumber()
    dcf: number;

    @IsString()
    image: string;

    @IsDateString()
    ipoDate: string;

    @IsBoolean()
    defaultImage: boolean;

    @IsBoolean()
    isEtf: boolean;

    @IsBoolean()
    isActivelyTrading: boolean;

    @IsBoolean()
    isAdr: boolean;

    @IsBoolean()
    isFund: boolean;
}

export class MetricDto {
    @IsNumber()
    dividendYielTTM: number;

    @IsNumber()
    volume: number;

    @IsNumber()
    yearHigh: number;

    @IsNumber()
    yearLow: number;
}

export class RatioDto {
    @IsNumber()
    dividendYielTTM: number;

    @IsNumber()
    dividendYielPercentageTTM: number;

    @IsNumber()
    peRatioTTM: number;

    @IsNumber()
    pegRatioTTM: number;

    @IsNumber()
    payoutRatioTTM: number;

    @IsNumber()
    currentRatioTTM: number;

    @IsNumber()
    quickRatioTTM: number;

    @IsNumber()
    cashRatioTTM: number;

    @IsNumber()
    daysOfSalesOutstandingTTM: number;

    @IsNumber()
    daysOfInventoryOutstandingTTM: number;

    @IsNumber()
    operatingCycleTTM: number;

    @IsNumber()
    daysOfPayablesOutstandingTTM: number;

    @IsNumber()
    cashConversionCycleTTM: number;

    @IsNumber()
    grossProfitMarginTTM: number;

    @IsNumber()
    operatingProfitMarginTTM: number;

    @IsNumber()
    pretaxProfitMarginTTM: number;

    @IsNumber()
    netProfitMarginTTM: number;

    @IsNumber()
    effectiveTaxRateTTM: number;

    @IsNumber()
    returnOnAssetsTTM: number;

    @IsNumber()
    returnOnEquityTTM: number;

    @IsNumber()
    returnOnCapitalEmployedTTM: number;

    @IsNumber()
    netIncomePerEBTTTM: number;

    @IsNumber()
    ebtPerEbitTTM: number;

    @IsNumber()
    ebitPerRevenueTTM: number;

    @IsNumber()
    debtRatioTTM: number;

    @IsNumber()
    debtEquityRatioTTM: number;

    @IsNumber()
    longTermDebtToCapitalizationTTM: number;

    @IsNumber()
    totalDebtToCapitalizationTTM: number;

    @IsNumber()
    interestCoverageTTM: number;

    @IsNumber()
    cashFlowToDebtRatioTTM: number;

    @IsNumber()
    companyEquityMultiplierTTM: number;

    @IsNumber()
    receivablesTurnoverTTM: number;

    @IsNumber()
    payablesTurnoverTTM: number;

    @IsNumber()
    inventoryTurnoverTTM: number;

    @IsNumber()
    fixedAssetTurnoverTTM: number;

    @IsNumber()
    assetTurnoverTTM: number;

    @IsNumber()
    operatingCashFlowPerShareTTM: number;

    @IsNumber()
    freeCashFlowPerShareTTM: number;

    @IsNumber()
    cashPerShareTTM: number;

    @IsNumber()
    operatingCashFlowSalesRatioTTM: number;

    @IsNumber()
    freeCashFlowOperatingCashFlowRatioTTM: number;

    @IsNumber()
    cashFlowCoverageRatiosTTM: number;

    @IsNumber()
    shortTermCoverageRatiosTTM: number;

    @IsNumber()
    capitalExpenditureCoverageRatioTTM: number;

    @IsNumber()
    dividendPaidAndCapexCoverageRatioTTM: number;

    @IsNumber()
    priceBookValueRatioTTM: number;

    @IsNumber()
    priceToBookRatioTTM: number;

    @IsNumber()
    priceToSalesRatioTTM: number;

    @IsNumber()
    priceEarningsRatioTTM: number;

    @IsNumber()
    priceToFreeCashFlowsRatioTTM: number;

    @IsNumber()
    priceToOperatingCashFlowsRatioTTM: number;

    @IsNumber()
    priceCashFlowRatioTTM: number;

    @IsNumber()
    priceEarningsToGrowthRatioTTM: number;

    @IsNumber()
    priceSalesRatioTTM: number;

    @IsNumber()
    enterpriseValueMultipleTTM: number;

    @IsNumber()
    priceFairValueTTM: number;

    @IsNumber()
    dividendPerShareTTM: number;
}

class InsideTradeDto {
    @IsString()
    symbol: string;

    @IsDateString()
    filingDate: string;

    @IsDateString()
    transactionDate: string;

    @IsString()
    reportingCik: string;

    @IsString()
    transactionType: string;

    @IsNumber()
    securitiesOwned: number;

    @IsString()
    companyCik: string;

    @IsString()
    reportingName: string;

    @IsString()
    typeOfOwner: string;

    @IsString()
    acquistionOrDisposition: string;

    @IsString()
    formType: string;

    @IsNumber()
    securitiesTransacted: number;

    @IsNumber()
    price: number;

    @IsString()
    securityName: string;

    @IsString()
    link: string;
}

class KeyExecutiveDto {
    @IsString()
    title: string;

    @IsString()
    name: string;

    @IsNumber()
    pay: number;

    @IsString()
    currencyPay: string;

    @IsString()
    gender: string;

    @IsNumber()
    yearBorn: number;

    @IsNumber()
    titleSince: number;
}

class SplitsHistoryDto {
    @IsDateString()
    date: string;

    @IsString()
    label: string;

    @IsNumber()
    numerator: number;

    @IsNumber()
    denominator: number;
}

class StockDividendDto {
    @IsDateString()
    date: string;

    @IsString()
    label: string;

    @IsNumber()
    adjDividend: number;

    @IsNumber()
    dividend: number;

    @IsDateString()
    recordDate: string;

    @IsDateString()
    paymentDate: string;

    @IsDateString()
    declarationDate: string;
}

class StockNewsDto {
    @IsString()
    symbol: string;

    @IsDateString()
    publishedDate: string;

    @IsString()
    title: string;

    @IsString()
    image: string;

    @IsString()
    site: string;

    @IsString()
    text: string;

    @IsString()
    url: string;
}

class RatingDto {
    @IsString()
    symbol: string;

    @IsDateString()
    date: string;

    @IsString()
    rating: string;

    @IsNumber()
    ratingScore: number;

    @IsString()
    ratingRecommendation: string;

    @IsNumber()
    ratingDetailsDCFScore: number;

    @IsString()
    ratingDetailsDCFRecommendation: string;

    @IsNumber()
    ratingDetailsROEScore: number;

    @IsString()
    ratingDetailsROERecommendation: string;

    @IsNumber()
    ratingDetailsROAScore: number;

    @IsString()
    ratingDetailsROARecommendation: string;

    @IsNumber()
    ratingDetailsDEScore: number;

    @IsString()
    ratingDetailsDERecommendation: string;

    @IsNumber()
    ratingDetailsPEScore: number;

    @IsString()
    ratingDetailsPERecommendation: string;

    @IsNumber()
    ratingDetailsPBScore: number;

    @IsString()
    ratingDetailsPBRecommendation: string;
}

export class FinancialDataDto {
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

class FinancialsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FinancialDataDto)
    income: FinancialDataDto[];
}

class CompanyOutlookDto {
    @ValidateNested()
    @Type(() => ProfileDto)
    profile: ProfileDto;

    @ValidateNested()
    @Type(() => MetricDto)
    metrics: MetricDto;

    @ValidateNested({ each: true })
    @Type(() => RatioDto)
    ratios: RatioDto[];

    @ValidateNested({ each: true })
    @Type(() => InsideTradeDto)
    insideTrades: InsideTradeDto[];

    @ValidateNested({ each: true })
    @Type(() => KeyExecutiveDto)
    keyExecutives: KeyExecutiveDto[];

    @ValidateNested({ each: true })
    @Type(() => SplitsHistoryDto)
    splitsHistory: SplitsHistoryDto[];

    @ValidateNested({ each: true })
    @Type(() => StockDividendDto)
    stockDividend: StockDividendDto[];

    @ValidateNested({ each: true })
    @Type(() => StockNewsDto)
    stockNews: StockNewsDto[];

    @ValidateNested({ each: true })
    @Type(() => RatingDto)
    rating: RatingDto[];

    @ValidateNested()
    @Type(() => FinancialsDto)
    financialsAnnual: FinancialsDto;

    @ValidateNested()
    @Type(() => FinancialsDto)
    financialsQuarter: FinancialsDto;
}

export { CompanyOutlookDto };

import { Controller, Get, Param } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @Get(':ticker')
    async getCompany(@Param('ticker') ticker: string) {
        return this.companyService.getCompanyData(ticker);
    }
}

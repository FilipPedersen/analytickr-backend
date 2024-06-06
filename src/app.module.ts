import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './user/user.controller';
import { UsersModule } from './user/user.module';
import { UsersService } from './user/user.service';
import { CompanyModule } from './company/company.module';

@Module({
    imports: [UsersModule, CompanyModule],
    controllers: [AppController, UsersController],
    providers: [AppService, UsersService],
})
export class AppModule {}

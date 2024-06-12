import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './user/user.controller';
import { UsersModule } from './user/user.module';
import { UsersService } from './user/user.service';
import { CompanyModule } from './company/company.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { FollowedStocksModule } from './user/followed-stocks/followed-stocks.module';

@Module({
    imports: [
        UsersModule,
        CompanyModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        FollowedStocksModule,
    ],
    controllers: [AppController, UsersController],
    providers: [AppService, UsersService, JwtStrategy],
})
export class AppModule {}

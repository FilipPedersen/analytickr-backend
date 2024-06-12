import { Module } from '@nestjs/common';
import { FollowedStocksService } from './followed-stocks.service';
import { FollowedStocksController } from './followed-stocks.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/strategy/jwt.strategy';

@Module({
    imports: [PassportModule],
    providers: [FollowedStocksService, JwtStrategy],
    controllers: [FollowedStocksController],
})
export class FollowedStocksModule {}

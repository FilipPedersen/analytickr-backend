import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FollowedStocksService } from './followed-stocks.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('followed-stocks')
export class FollowedStocksController {
    constructor(private followedStocksService: FollowedStocksService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getFollowedStocks(@Req() req) {
        return 'hello';
        // const clerkId = req.user.id;
        // console.log('clerkId', clerkId);

        // return this.followedStocksService.getFollowedStocks(clerkId);
    }
}

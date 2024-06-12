import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FollowedStocksService } from './followed-stocks.service';
import { AuthGuard } from '@nestjs/passport';
import { StockDto } from './stock.dto';

@Controller('user/followed-stocks')
export class FollowedStocksController {
    constructor(private followedStocksService: FollowedStocksService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getFollowedStocks(@Req() req) {
        console.log('user:', req.user);

        const { clerkId } = req.user;

        return this.followedStocksService.getFollowedStocks(clerkId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async addFollowedStock(@Req() req, @Body() createStockDto: StockDto) {
        const { clerkId } = req.user;
        return this.followedStocksService.addFollowedStock(
            clerkId,
            createStockDto,
        );
    }
}

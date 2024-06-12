import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FollowedStocksService } from './followed-stocks.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user/followed-stocks')
export class FollowedStocksController {
    constructor(private followedStocksService: FollowedStocksService) {}

    @Get()
    async getFollowedStocks(@Req() req) {
        // const { clerkId } = req.user;

        let clerkId =
            'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJkdmJfMmhZbzNLdTRaM2dKSDBHRE1kNWw0ZWdYdjduIiwiaWQiOiJjbGllbnRfMmhZbzY1VXJGVWx3b05nNkVMUkttT1B2ZVhqIiwicm90YXRpbmdfdG9rZW4iOiJ3dWl0Njd1bWhoaHpvbzdub24yaW9lZXZ2d2ZvZnJraHE4MG1lbnYzIn0.X_0YFNILhGgspHjwSTNX_EZbiDdPju8dn-Fl9EhJ7syYMpD461HqfWrP1TzOJSpXSRQrqypKxs471Cy54mRDXFO70GK1u4EB3UK9dBkt9sjZy9xXUO4puQ4_0lV4pWqufGbb3W_Zo5wTu-PMpME4rE3YDw9yALMz0B_TpAW4Yi9wIu1qv7CF0Ym6IQUmH_7Vw5jmDBehguUUC_EqLRCAAtGo1R4X12q7Xu1pFUcvGzRFBkVWsk2Egse1juhfJxgl6K0HemLEbjSENbfMRanL4vBncj_GehE36kruCkBSah24EadKllXMhwKbCHSSMDdj97DIbFEt9mFhgb02umQkBA';
        console.log('clerkId', clerkId);

        return this.followedStocksService.getFollowedStocks(clerkId);
    }
}

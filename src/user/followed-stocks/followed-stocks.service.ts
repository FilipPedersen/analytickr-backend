import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FollowedStocksService {
    constructor() {}

    async getFollowedStocks(clerkId: string) {
        const user = prisma.user.findUnique({
            where: { clerkId },
            include: { stocks: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user.stocks;
    }
}

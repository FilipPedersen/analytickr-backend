import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { StockDto } from './stock.dto';

const prisma = new PrismaClient();

@Injectable()
export class FollowedStocksService {
    constructor() {}

    async getFollowedStocks(clerkId: string) {
        const user = await prisma.user.findUnique({
            where: { clerkId },
            include: { stocks: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user.stocks;
    }

    async addFollowedStock(clerkId: string, stock: StockDto) {
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return prisma.stock.create({
            data: {
                companyName: stock.companyName,
                ticker: stock.ticker,
                logoUrl: stock.logoUrl,
                user: {
                    connect: { id: user.id },
                },
            },
        });
    }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class UsersService {
    constructor() {}
    async createUser(userData: User): Promise<User> {
        console.log('clerkId', userData.clerkId);
        console.log('email', userData.email);
        console.log('id', userData.id);

        const createUser = await prisma.user.create({
            data: {
                clerkId: userData.clerkId,
                email: userData.email,
                id: userData.id,
            },
        });
        return createUser;
    }

    async getUsers(): Promise<User[]> {
        return prisma.user.findMany();
    }
}

import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    getUsers() {
        return this.usersService.getUsers();
    }

    @Post('user-signed-up')
    @HttpCode(201)
    async handleUserSignedUp(
        @Body() userData: { clerkId: string; email: string; id: string },
    ): Promise<User> {
        return this.usersService.createUser(userData);
    }
}

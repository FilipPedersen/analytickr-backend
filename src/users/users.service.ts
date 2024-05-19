import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  constructor() {}
  async getUsers() {
    const users = prisma.user.findMany();
    console.log(users);
    return users;
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from 'generated/prisma';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('api/users')
export class UserController {
  @Get('/me')
  getMe(@GetUser() user: User) {
    return user;
  }
}

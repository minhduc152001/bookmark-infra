import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from 'generated/prisma';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { BookmarkService } from './bookmark.service';
import { BookmarkDto, BookmarkEditDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get('/')
  list(@GetUser() user: User) {
    return this.bookmarkService.list(user.id);
  }

  @Post('/')
  create(@GetUser() user: User, @Body() bmBody: BookmarkDto) {
    return this.bookmarkService.create(user.id, bmBody);
  }

  @Put('/')
  update(@GetUser() user: User, @Body() bmBody: BookmarkEditDto) {
    return this.bookmarkService.update(user.id, bmBody);
  }

  @Delete('/:bookmarkId')
  delete(@GetUser() user: User, @Param() bmId: string) {
    return this.bookmarkService.delete(user.id, bmId);
  }
}

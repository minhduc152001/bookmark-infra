import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookmarkDto, BookmarkEditDto } from './dto/bookmark.dto';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class BookmarkService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async list(userId: string) {
    try {
      const bookmarks = await this.prisma.bookmark.findMany({
        where: { userId },
      });

      const bookmarksWithUrls = await Promise.all(
        bookmarks.map(async (bookmark) => {
          if (bookmark.fileKey) {
            const fileUrl = await this.uploadService.getSignedUrl(
              bookmark.fileKey,
            );
            return { ...bookmark, link: fileUrl };
          }
          return bookmark;
        }),
      );

      return bookmarksWithUrls;
    } catch (error) {
      console.error(error);
      throw new Error('Something went wrong...');
    }
  }

  async create(userId: string, bmBody: BookmarkDto) {
    try {
      const newBm = await this.prisma.bookmark.create({
        data: { userId, ...bmBody },
      });
      return newBm;
    } catch (error) {
      console.error(error);
      throw new Error('Something went wrong...');
    }
  }

  async update(userId: string, bmBody: BookmarkEditDto) {
    try {
      const curBm = await this.prisma.bookmark.findFirst({
        where: { userId, id: bmBody.id },
      });
      if (!curBm) throw new Error('Could not find the bookmark');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...updateData } = bmBody;
      const updateBm = await this.prisma.bookmark.update({
        where: { id: curBm.id },
        data: updateData,
      });
      return updateBm;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async delete(userId: string, bmId: string) {
    try {
      const curBm = await this.prisma.bookmark.findFirst({
        where: { userId, id: bmId },
      });
      if (!curBm) throw new Error('Could not find the bookmark');

      const removedBm = await this.prisma.bookmark.delete({
        where: { id: bmId },
      });
      return removedBm;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

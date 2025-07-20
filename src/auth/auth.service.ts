import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(signupBody: AuthDto) {
    try {
      const hash = await argon.hash(signupBody.password);
      const user = await this.prisma.user.create({
        data: { email: signupBody.email, hash },
        select: {
          id: true,
          email: true,
          createdAt: true,
          firstName: true,
          lastName: true,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken!');
        }
      }
      throw error;
    }
  }

  async login(loginBody: AuthDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: loginBody.email },
    });

    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    const pwMatches = await argon.verify(user.hash, loginBody.password);
    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hash, ...userWithoutHash } = user;

    const { accessToken } = await this.signToken(user.id, user.email);
    return {
      ...userWithoutHash,
      accessToken,
    };
  }

  async signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '60m',
      secret: this.config.get('JWT_SECRET'),
    });
    return { accessToken: token };
  }
}

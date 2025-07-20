import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupBody: AuthDto) {
    return this.authService.signup(signupBody);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginBody: AuthDto) {
    return this.authService.login(loginBody);
  }
}

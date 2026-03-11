import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    const validUsername = this.configService.get<string>('ADMIN_USERNAME');
    const validPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (body.username !== validUsername || body.password !== validPassword) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // Simple token: base64 of username:timestamp
    const token = Buffer.from(`${body.username}:${Date.now()}`).toString('base64');

    return {
      token,
      username: body.username,
    };
  }
}

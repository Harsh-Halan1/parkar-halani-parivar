import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('otp/request')
  requestOtp(@Body() body: { phone: string }) {
    return this.auth.requestPhoneOtp(body.phone);
  }

  @Post('otp/verify')
  verifyOtp(@Body() body: { phone: string; token: string; rememberMe?: boolean; firstName?: string; lastName?: string; email?: string }) {
    return this.auth.verifyPhoneOtp(body);
  }

  @Post('email/sign-up')
  signUpEmail(@Body() body: { email: string; password: string; firstName: string; lastName: string; phone?: string; rememberMe?: boolean }) {
    return this.auth.signUpWithEmail(body);
  }

  @Post('email/sign-in')
  signInEmail(@Body() body: { email: string; password: string; rememberMe?: boolean }) {
    return this.auth.signInWithEmail(body);
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('logout')
  logout(@Body() body: { userId: string }) {
    return this.auth.logout(body.userId);
  }

  @Post('update-contact')
  updateContact(@Body() body: { userId: string; email?: string; phone?: string }) {
    return this.auth.updateContactInfo(body);
  }
}

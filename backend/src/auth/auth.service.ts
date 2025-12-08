import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, VerifyOtpDto, SendOtpDto } from './dto';
import { OtpService } from './otp.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
  ) {}
  // ============================================
  // SEND OTP
  // ============================================

  async sendOtp(dto: SendOtpDto) {
    const identifier = dto.email || dto.phone;
    if (!identifier) {
      throw new BadRequestException('Email or phone number is required');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          dto.phone ? { phone: dto.phone } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Generate OTP
    const { otpCode, otpExpiry } = this.otpService.generateOtpWithExpiry(10);

    // Store OTP temporarily
    const otpRecord = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash: '',
        otpCode,
        otpExpiry,
      },
    });

    // Send OTP
    if (dto.email) {
      await this.otpService.sendOtpViaEmail(dto.email, otpCode);
    }

    if (dto.phone) {
      await this.otpService.sendOtpViaSms(dto.phone, otpCode);
    }

    return {
      message: 'OTP sent successfully',
      userId: otpRecord.id,
      expiresIn: 10 * 60,
    };
  }

  // ============================================
  // REGISTRATION
  // ============================================
  // ============================================

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { phone: dto.phone },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(dto.password);

    // Generate OTP
    const { otpCode, otpExpiry } = this.otpService.generateOtpWithExpiry(10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: Role.FAMILY_MEMBER,
        otpCode,
        otpExpiry,
        preferredLanguage: dto.preferredLanguage || 'gu',
      },
    });

    // Send OTP via email/SMS
    if (dto.email) {
      await this.otpService.sendOtpViaEmail(dto.email, otpCode);
    }
    if (dto.phone) {
      await this.otpService.sendOtpViaSms(dto.phone, otpCode);
    }

    return {
      message: 'Registration successful. Please verify your account with the OTP sent.',
      userId: user.id,
      requiresVerification: true,
    };
  }

  // ============================================
  // LOGIN
  // ============================================

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier },
          { phone: dto.identifier },
        ],
      },
      include: {
        person: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      await this.handleFailedLogin(user.id, user.loginAttempts);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check verification status
    if (!user.isEmailVerified || !user.isPhoneVerified) {
      // Send new OTP
      const { otpCode, otpExpiry } = this.otpService.generateOtpWithExpiry(10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpCode, otpExpiry },
      });
      
      if (user.email) {
        await this.otpService.sendOtpViaEmail(user.email, otpCode);
      }
      if (user.phone) {
        await this.otpService.sendOtpViaSms(user.phone, otpCode);
      }
      
      return {
        message: 'Account not verified. OTP sent to your email/phone.',
        userId: user.id,
        requiresVerification: true,
      };
    }

    // Reset login attempts and update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Save refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        isDarkMode: user.isDarkMode,
        person: user.person,
      },
    };
  }

  // ============================================
  // OTP VERIFICATION
  // ============================================

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          dto.phone ? { phone: dto.phone } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.otpCode || !user.otpExpiry) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    if (this.otpService.isOtpExpired(user.otpExpiry)) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    if (user.otpCode !== dto.otpCode) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Mark as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: user.email ? true : user.isEmailVerified,
        isPhoneVerified: user.phone ? true : user.isPhoneVerified,
        otpCode: null,
        otpExpiry: null,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      message: 'Verification successful',
    };
  }

  // ============================================
  // REFRESH TOKEN
  // ============================================

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // ============================================
  // LOGOUT
  // ============================================

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  // ============================================
  // GOOGLE OAUTH
  // ============================================

  async googleLogin(googleUser: any) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.id },
    });

    if (!user) {
      // Check if email exists
      user = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (user) {
        // Link Google account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            isEmailVerified: true,
          },
        });
      } else {
        // Create new user
        const randomPassword = Math.random().toString(36).slice(-12);
        const passwordHash = await this.hashPassword(randomPassword);

        user = await this.prisma.user.create({
          data: {
            email: googleUser.email,
            googleId: googleUser.id,
            passwordHash,
            isEmailVerified: true,
            role: Role.FAMILY_MEMBER,
          },
        });
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async generateTokens(userId: string, email: string | null, role: Role) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  private async handleFailedLogin(userId: string, currentAttempts: number) {
    const newAttempts = currentAttempts + 1;
    const updateData: any = { loginAttempts: newAttempts };

    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}
